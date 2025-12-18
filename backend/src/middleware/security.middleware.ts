@ts-nocheck
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Security Middleware Collection
 * Implements various security best practices for production
 */

/**
 * Content Security Policy Configuration
 * Protects against XSS, clickjacking, and other injection attacks
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts in React
        "'unsafe-eval'", // Required for dev mode, remove in production
        'https://cdn.jsdelivr.net', // For external libraries if needed
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components/inline styles
        'https://fonts.googleapis.com',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'data:', // For inline fonts
      ],
      imgSrc: [
        "'self'",
        'data:', // For base64 images
        'https:', // For external images
        'blob:', // For generated images
      ],
      connectSrc: [
        "'self'",
        'https://api.openai.com', // If using AI features
        'ws:', 'wss:', // For WebSocket connections
      ],
      frameSrc: ["'none'"], // Prevent embedding in iframes
      objectSrc: ["'none'"], // Prevent Flash, Java, etc.
      upgradeInsecureRequests: [], // Force HTTPS
    },
  },
  crossOriginEmbedderPolicy: false, // Set to true if needed
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * Rate Limiting Configuration
 * Protects against brute-force and DoS attacks
 */

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts, please try again later.',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

// Payment endpoints rate limiter
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment requests per hour
  message: 'Too many payment requests, please try again later.',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many payment requests. Please try again in an hour.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

/**
 * CORS Configuration
 * Controls which domains can access the API
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    // Add production domains
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(
        'https://errandbit.com',
        'https://www.errandbit.com',
        'https://app.errandbit.com'
      );
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number', 'X-Page-Size'],
};

/**
 * Request sanitization middleware
 * Prevents NoSQL injection and XSS attacks
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key] as string);
      }
    });
  }

  // Sanitize body
  if (req.body) {
    sanitizeObject(req.body);
  }

  next();
};

/**
 * Sanitize input string
 */
function sanitizeInput(input: string): string {
  // Remove potential MongoDB operators
  let sanitized = input.replace(/[${}]/g, '');

  // Basic XSS prevention (for display purposes, not for storage)
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): void {
  Object.keys(obj).forEach((key) => {
    // Remove dangerous operators
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      return;
    }

    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
}

/**
 * Security headers middleware
 * Adds additional custom security headers
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self)'
  );

  next();
};

/**
 * Secure cookie settings
 */
export const secureCookieOptions = {
  httpOnly: true, // Prevent JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

