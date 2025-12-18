// @ts-nocheck
/**
 * Sentry Configuration
 * Error tracking and performance monitoring for frontend
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry(): void {
  // Only initialize in production or if explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true') {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
      console.warn('Sentry DSN not configured. Skipping Sentry initialization.');
      return;
    }

    Sentry.init({
      dsn,
      environment: import.meta.env.VITE_ENVIRONMENT || 'production',
      
      // Performance Monitoring
      integrations: [
        new BrowserTracing({
          // Trace navigation
          tracePropagationTargets: [
            'localhost',
            import.meta.env.VITE_API_URL || 'http://localhost:3000',
          ],
        }),
      ],

      // Performance traces sample rate
      // 1.0 = 100% of transactions, 0.1 = 10%
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

      // Session Replay for debugging
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || 'development',

      // Additional configuration
      beforeSend(event, hint) {
        // Filter out sensitive information
        if (event.request) {
          // Remove sensitive headers
          if (event.request.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }

          // Remove sensitive query parameters
          if (event.request.url) {
            try {
              const url = new URL(event.request.url);
              url.searchParams.delete('token');
              url.searchParams.delete('api_key');
              event.request.url = url.toString();
            } catch (e) {
              // Invalid URL, skip sanitization
            }
          }
        }

        // Filter out specific errors
        if (event.exception?.values) {
          const errorMessage = event.exception.values[0]?.value || '';
          
          // Don't report network errors in development
          if (!import.meta.env.PROD && errorMessage.includes('Network')) {
            return null;
          }

          // Don't report cancelled requests
          if (errorMessage.includes('cancelled') || errorMessage.includes('aborted')) {
            return null;
          }
        }

        return event;
      },

      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Random network errors
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        // User cancelled actions
        'User cancelled',
        'AbortError',
      ],

      // Denylist for URLs that shouldn't be reported
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
      ],
    });

    console.log('✅ Sentry initialized for error tracking and performance monitoring');
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>): void {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Measure a specific operation
 */
export async function measureOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, 'function');
  
  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}
