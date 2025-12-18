/**
 * Frontend Application Configuration
 * 
 * Centralized configuration management for the ErrandBit frontend application.
 * This module provides type-safe access to environment variables and application constants.
 * 
 * @module config
 */

/**
 * Application environment configuration derived from environment variables.
 * All environment variables are prefixed with VITE_ for security.
 */
export const ENV_CONFIG = {
  /** Application environment (development, staging, production) */
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  /** Flag indicating if running in development mode */
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === 'development',
  
  /** Flag indicating if running in production mode */
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === 'production',
} as const;

/**
 * API configuration for backend communication
 */
export const API_CONFIG = {
  /** Base URL for API requests */
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  /** API endpoint path */
  API_PATH: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  /** Request timeout in milliseconds */
  TIMEOUT_MS: 30000,
  
  /** Maximum retry attempts for failed requests */
  MAX_RETRIES: 3,
  
  /** Delay between retries in milliseconds */
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Fedi wallet integration configuration
 */
export const FEDI_CONFIG = {
  /** Flag to enable/disable Fedi wallet features */
  ENABLED: import.meta.env.VITE_FEDI_ENABLED === 'true',
  
  /** Flag to enable miniapp mode for embedding in Fedi wallet */
  MINIAPP_MODE: import.meta.env.VITE_FEDI_MINIAPP === 'true',
  
  /** Default community identifier */
  DEFAULT_COMMUNITY_ID: import.meta.env.VITE_FEDI_COMMUNITY_ID || 'errandbit',
  
  /** Query parameter name for Fedi context detection */
  CONTEXT_PARAM: 'fedi',
  
  /** Query parameter name for community ID */
  COMMUNITY_PARAM: 'community',
} as const;

/**
 * WebLN (Lightning Network) configuration
 */
export const WEBLN_CONFIG = {
  /** Flag to enable/disable WebLN functionality */
  ENABLED: import.meta.env.VITE_WEBLN_ENABLED === 'true',
  
  /** Flag indicating if WebLN is required for transactions */
  REQUIRED: import.meta.env.VITE_WEBLN_REQUIRED === 'true',
  
  /** Flag to enable fallback methods when WebLN is unavailable */
  FALLBACK_ENABLED: import.meta.env.VITE_WEBLN_FALLBACK === 'true',
  
  /** Provider detection timeout in milliseconds */
  DETECTION_TIMEOUT_MS: 3000,
} as const;

/**
 * Lightning Network payment configuration
 */
export const LIGHTNING_CONFIG = {
  /** Bitcoin network (bitcoin, testnet, regtest) */
  NETWORK: import.meta.env.VITE_LIGHTNING_NETWORK || 'bitcoin',
  
  /** Minimum payment amount in satoshis */
  MIN_AMOUNT_SATS: parseInt(import.meta.env.VITE_LIGHTNING_MIN_AMOUNT || '1000', 10),
  
  /** Maximum payment amount in satoshis */
  MAX_AMOUNT_SATS: parseInt(import.meta.env.VITE_LIGHTNING_MAX_AMOUNT || '1000000', 10),
  
  /** Invoice expiration time in seconds */
  INVOICE_EXPIRY_SECONDS: 3600,
  
  /** Default memo for Lightning invoices */
  DEFAULT_MEMO: 'ErrandBit Payment',
} as const;

/**
 * Privacy and compliance configuration
 */
export const PRIVACY_CONFIG = {
  /** Flag indicating non-KYC operation mode */
  NON_KYC_MODE: import.meta.env.VITE_NON_KYC_MODE === 'true',
  
  /** Flag to show privacy-related badges and indicators */
  SHOW_PRIVACY_BADGES: import.meta.env.VITE_SHOW_PRIVACY_BADGES === 'true',
  
  /** Flag enforcing pseudonymous profiles only */
  PSEUDONYMOUS_ONLY: import.meta.env.VITE_PSEUDONYMOUS_PROFILES === 'true',
  
  /** Flag preventing real name collection */
  NO_REAL_NAMES: import.meta.env.VITE_NO_REAL_NAMES === 'true',
  
  /** Flag indicating privacy-first approach */
  PRIVACY_FIRST: import.meta.env.VITE_PRIVACY_FIRST === 'true',
} as const;

/**
 * Map and geolocation configuration
 */
export const MAP_CONFIG = {
  /** Mapbox access token (optional) */
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || '',
  
  /** Flag indicating if map features are available */
  ENABLED: Boolean(import.meta.env.VITE_MAPBOX_TOKEN),
  
  /** Default map center coordinates */
  DEFAULT_CENTER: { lat: 0, lng: 0 },
  
  /** Default zoom level */
  DEFAULT_ZOOM: 13,
  
  /** Maximum search radius in kilometers */
  MAX_SEARCH_RADIUS_KM: 100,
  
  /** Default search radius in kilometers */
  DEFAULT_SEARCH_RADIUS_KM: 10,
} as const;

/**
 * Error tracking and monitoring configuration (Sentry)
 */
export const MONITORING_CONFIG = {
  /** Sentry DSN for error tracking */
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  
  /** Flag indicating if error tracking is enabled */
  ENABLED: Boolean(import.meta.env.VITE_SENTRY_DSN),
  
  /** Environment name for Sentry */
  ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  
  /** Sample rate for performance monitoring (0.0 to 1.0) */
  TRACES_SAMPLE_RATE: 0.1,
  
  /** Sample rate for session replays (0.0 to 1.0) */
  REPLAYS_SESSION_SAMPLE_RATE: 0.1,
  
  /** Sample rate for error replays (0.0 to 1.0) */
  REPLAYS_ON_ERROR_SAMPLE_RATE: 1.0,
} as const;

/**
 * UI/UX constants for consistent user experience
 */
export const UI_CONSTANTS = {
  /** Toast notification duration in milliseconds */
  TOAST_DURATION_MS: 3000,
  
  /** Debounce delay for search inputs in milliseconds */
  SEARCH_DEBOUNCE_MS: 300,
  
  /** Animation duration for transitions in milliseconds */
  ANIMATION_DURATION_MS: 200,
  
  /** Number of items per page in lists */
  PAGINATION_PAGE_SIZE: 20,
  
  /** Maximum items that can be loaded per page */
  PAGINATION_MAX_SIZE: 100,
  
  /** Breakpoint for mobile devices in pixels */
  BREAKPOINT_MOBILE_PX: 768,
  
  /** Breakpoint for tablet devices in pixels */
  BREAKPOINT_TABLET_PX: 1024,
} as const;

/**
 * Validation constants for form inputs
 */
export const VALIDATION_CONSTANTS = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
  JOB_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
  },
  JOB_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
  },
  REVIEW_COMMENT: {
    MAX_LENGTH: 1000,
  },
  RATING: {
    MIN: 1,
    MAX: 5,
  },
} as const;

/**
 * Cache configuration for React Query
 */
export const CACHE_CONFIG = {
  /** Default stale time in milliseconds */
  STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  
  /** Cache time in milliseconds */
  CACHE_TIME_MS: 10 * 60 * 1000, // 10 minutes
  
  /** Number of retry attempts for failed queries */
  RETRY_COUNT: 3,
  
  /** Flag to retry on network errors */
  RETRY_ON_MOUNT: false,
  
  /** Refetch on window focus */
  REFETCH_ON_WINDOW_FOCUS: true,
  
  /** Refetch on network reconnect */
  REFETCH_ON_RECONNECT: true,
} as const;

/**
 * HTTP status codes for API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  EXCHANGE_RATES: 'exchangeRates', // Currency exchange rates cache
} as const;

/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  JOBS: '/jobs',
  JOBS_CREATE: '/jobs/create',
  JOBS_DETAIL: '/jobs/:id',
  RUNNERS: '/runners',
  RUNNERS_DETAIL: '/runners/:id',
  EARNINGS: '/earnings',
  SETTINGS: '/settings',
} as const;

/**
 * Feature flags for progressive rollout
 */
export const FEATURE_FLAGS = {
  ENABLE_NOSTR_AUTH: false,
  ENABLE_MULTI_CURRENCY: false,
  ENABLE_REAL_TIME_UPDATES: false,
  ENABLE_PWA_INSTALL: true,
  ENABLE_DARK_MODE: true,
} as const;

/**
 * Type guard to check if a value is a valid environment
 */
export function isValidEnvironment(env: string): env is 'development' | 'staging' | 'production' {
  return ['development', 'staging', 'production'].includes(env);
}

/**
 * Get full API URL for a given endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${baseUrl}/${path}`;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Review and rating configuration
 */
export const REVIEW_CONFIG = {
  /** Minimum rating value */
  MIN_RATING: 1,
  
  /** Maximum rating value */
  MAX_RATING: 5,
  
  /** Maximum comment length in characters */
  MAX_COMMENT_LENGTH: 1000,
  
  /** Minimum rating to be considered "highly rated" */
  HIGH_RATING_THRESHOLD: 4.0,
  
  /** Minimum reviews needed to be considered "established" */
  MIN_REVIEWS_FOR_ESTABLISHED: 5,
} as const;

/**
 * Currency conversion configuration
 */
export const CURRENCY_CONFIG = {
  /** Exchange rate cache duration in milliseconds */
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  
  /** API request timeout in milliseconds */
  API_TIMEOUT_MS: 10000, // 10 seconds
  
  /** Fallback BTC to USD rate (approximate) */
  FALLBACK_BTC_TO_USD: 65000,
  
  /** Fallback BTC to KSH rate (approximate) */
  FALLBACK_BTC_TO_KSH: 9750000,
  
  /** CoinGecko API endpoint for BTC prices */
  COINGECKO_API_URL: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,kes',
} as const;

/**
 * Validate environment configuration
 * Throws an error if required configuration is missing
 */
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!API_CONFIG.BASE_URL) {
    errors.push('VITE_API_URL is required');
  }
  
  if (WEBLN_CONFIG.REQUIRED && !WEBLN_CONFIG.ENABLED) {
    errors.push('WebLN is required but not enabled');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Validate configuration on module load in production
if (ENV_CONFIG.IS_PRODUCTION) {
  validateConfig();
}
