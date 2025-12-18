/**
 * Advanced Bot Detection Middleware
 * Protects against automated attacks, scrapers, and malicious bots
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface BotScore {
  score: number; // 0-100, higher = more likely bot
  reasons: string[];
}

interface RequestFingerprint {
  ip: string;
  userAgent: string;
  headers: Record<string, string>;
  timestamp: number;
}

// Store request history for pattern analysis
const requestHistory = new Map<string, RequestFingerprint[]>();
const blockedIPs = new Set<string>();
const challengedIPs = new Map<string, { expires: number; token: string }>();

// Known bot user agent patterns
const KNOWN_BOT_PATTERNS = [
  /bot|crawler|spider|scraper|curl|wget|python-requests/i,
  /headless|phantom|selenium|puppeteer|playwright/i,
  /automated|scraping|harvester/i,
];

// Suspicious header patterns
const SUSPICIOUS_HEADERS = {
  'x-forwarded-for': /,.*,/, // Multiple proxies
  'via': /.+/, // Proxy usage
  'x-requested-with': /^(?!XMLHttpRequest$)/, // Not AJAX
};

/**
 * Calculate bot score based on request characteristics
 */
function calculateBotScore(req: Request): BotScore {
  let score = 0;
  const reasons: string[] = [];

  // Check user agent
  const userAgent = req.get('user-agent') || '';
  
  if (!userAgent) {
    score += 40;
    reasons.push('Missing User-Agent');
  } else {
    // Check against known bot patterns
    for (const pattern of KNOWN_BOT_PATTERNS) {
      if (pattern.test(userAgent)) {
        score += 30;
        reasons.push('Bot-like User-Agent');
        break;
      }
    }

    // Check for very old browsers (unlikely for real users)
    if (userAgent.includes('MSIE 6.0') || userAgent.includes('MSIE 7.0')) {
      score += 20;
      reasons.push('Outdated browser');
    }
  }

  // Check for missing common headers
  const commonHeaders = ['accept', 'accept-language', 'accept-encoding'];
  const missingHeaders = commonHeaders.filter(h => !req.get(h));
  
  if (missingHeaders.length > 0) {
    score += missingHeaders.length * 10;
    reasons.push(`Missing headers: ${missingHeaders.join(', ')}`);
  }

  // Check for suspicious headers
  for (const [header, pattern] of Object.entries(SUSPICIOUS_HEADERS)) {
    const value = req.get(header);
    if (value && pattern.test(value)) {
      score += 15;
      reasons.push(`Suspicious ${header} header`);
    }
  }

  // Check request rate
  const ip = getClientIP(req);
  const history = requestHistory.get(ip) || [];
  const recentRequests = history.filter(r => Date.now() - r.timestamp < 60000); // Last minute
  
  if (recentRequests.length > 60) {
    score += 30;
    reasons.push('Excessive request rate (>60/min)');
  } else if (recentRequests.length > 30) {
    score += 15;
    reasons.push('High request rate (>30/min)');
  }

  // Check for header anomalies
  const referer = req.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const requestUrl = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
      
      // Check for suspicious referer
      if (refererUrl.hostname !== requestUrl.hostname) {
        // External referer is normal, but check for known scraper domains
        if (refererUrl.hostname.includes('scraperapi') || refererUrl.hostname.includes('proxy')) {
          score += 25;
          reasons.push('Suspicious referer domain');
        }
      }
    } catch (e) {
      // Invalid referer URL
      score += 10;
      reasons.push('Invalid referer URL');
    }
  }

  // Check for automation tools in Accept header
  const accept = req.get('accept') || '';
  if (accept === '*/*' && !userAgent.includes('curl')) {
    score += 10;
    reasons.push('Generic accept header');
  }

  // Normalize score to 0-100
  score = Math.min(score, 100);

  return { score, reasons };
}

/**
 * Get client IP address (handles proxies)
 */
function getClientIP(req: Request): string {
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Generate challenge token
 */
function generateChallengeToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Update request history for pattern analysis
 */
function updateRequestHistory(req: Request): void {
  const ip = getClientIP(req);
  const fingerprint: RequestFingerprint = {
    ip,
    userAgent: req.get('user-agent') || '',
    headers: {
      accept: req.get('accept') || '',
      acceptLanguage: req.get('accept-language') || '',
      acceptEncoding: req.get('accept-encoding') || '',
    },
    timestamp: Date.now(),
  };

  const history = requestHistory.get(ip) || [];
  history.push(fingerprint);

  // Keep only last 100 requests per IP
  if (history.length > 100) {
    history.shift();
  }

  requestHistory.set(ip, history);

  // Clean old entries (older than 1 hour)
  const oneHourAgo = Date.now() - 3600000;
  requestHistory.forEach((entries, key) => {
    const filtered = entries.filter(e => e.timestamp > oneHourAgo);
    if (filtered.length === 0) {
      requestHistory.delete(key);
    } else {
      requestHistory.set(key, filtered);
    }
  });
}
// @ts-nocheck/**
 * Bot detection middleware
 */
export function botDetectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIP(req);

  // Check if IP is blocked
  if (blockedIPs.has(ip)) {
    res.status(403).json({
      success: false,
      error: 'Access denied. Your IP has been blocked due to suspicious activity.',
    });
    return;
  }

  // Update request history
  updateRequestHistory(req);

  // Calculate bot score
  const { score, reasons } = calculateBotScore(req);

  // Add score to request for logging
  (req as any).botScore = score;
  (req as any).botReasons = reasons;

  // Log high scores in development
  if (process.env.NODE_ENV === 'development' && score > 50) {
    console.log(`[Bot Detection] Score: ${score}, Reasons: ${reasons.join(', ')}`);
  }

  // Block obvious bots (score >= 80)
  if (score >= 80) {
    blockedIPs.add(ip);
    
    // Auto-unblock after 1 hour
    setTimeout(() => {
      blockedIPs.delete(ip);
    }, 3600000);

    res.status(403).json({
      success: false,
      error: 'Access denied. Bot-like behavior detected.',
    });
    return;
  }

  // Challenge suspicious requests (score 50-79)
  if (score >= 50 && score < 80) {
    const challenge = challengedIPs.get(ip);
    const now = Date.now();

    // Check if challenge token is provided
    const providedToken = req.get('x-bot-challenge');
    
    if (challenge && providedToken === challenge.token) {
      // Valid token, allow request
      if (now < challenge.expires) {
        challengedIPs.delete(ip);
        next();
        return;
      }
    }

    // Generate new challenge
    const token = generateChallengeToken();
    challengedIPs.set(ip, {
      expires: now + 300000, // 5 minutes
      token,
    });

    res.status(403).json({
      success: false,
      error: 'Bot challenge required',
      challenge: {
        token,
        message: 'Include this token in X-Bot-Challenge header to verify you are not a bot',
      },
    });
    return;
  }

  // Allow normal requests
  next();
}

/**
 * Selective bot detection for specific routes
 * Use this for high-value endpoints (auth, payments, etc.)
 */
export function strictBotDetection(req: Request, res: Response, next: NextFunction): void {
  const { score } = calculateBotScore(req);

  // Stricter threshold for sensitive routes
  if (score >= 30) {
    res.status(403).json({
      success: false,
      error: 'Access denied. This endpoint requires additional verification.',
    });
    return;
  }

  next();
}

/**
 * CAPTCHA verification middleware (integrate with reCAPTCHA or hCaptcha)
 */
export function requireCaptcha(req: Request, res: Response, next: NextFunction): void {
  const captchaToken = req.body.captcha || req.get('x-captcha-token');

  if (!captchaToken) {
    res.status(400).json({
      success: false,
      error: 'CAPTCHA verification required',
      requiresCaptcha: true,
    });
    return;
  }

  // TODO: Verify captcha token with reCAPTCHA/hCaptcha API
  // For now, just check if token exists
  if (captchaToken.length < 20) {
    res.status(400).json({
      success: false,
      error: 'Invalid CAPTCHA token',
      requiresCaptcha: true,
    });
    return;
  }

  next();
}

/**
 * Rate limiting based on fingerprint (more accurate than IP)
 */
export function fingerprintRateLimit(maxRequests: number, windowMs: number) {
  const fingerprints = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIP(req);
    const userAgent = req.get('user-agent') || '';
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex');

    const now = Date.now();
    const record = fingerprints.get(fingerprint);

    if (record) {
      if (now > record.resetAt) {
        // Window expired, reset
        fingerprints.set(fingerprint, { count: 1, resetAt: now + windowMs });
        next();
      } else if (record.count >= maxRequests) {
        // Rate limit exceeded
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        });
      } else {
        // Increment count
        record.count++;
        next();
      }
    } else {
      // First request
      fingerprints.set(fingerprint, { count: 1, resetAt: now + windowMs });
      next();
    }

    // Cleanup old entries
    fingerprints.forEach((value, key) => {
      if (now > value.resetAt) {
        fingerprints.delete(key);
      }
    });
  };
}

/**
 * Honeypot field validator
 * Add hidden fields to forms that bots typically fill
 */
export function honeypotValidator(fieldName: string = 'website') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body[fieldName]) {
      // Bot filled honeypot field
      const ip = getClientIP(req);
      blockedIPs.add(ip);

      // Fake success response to not alert the bot
      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
      });
      return;
    }

    next();
  };
}
