/**
 * Security Headers Configuration
 * Defines Content Security Policy and other security headers
 */

export const SECURITY_HEADERS = {
  /**
   * Content Security Policy (CSP)
   * Prevents XSS, clickjacking, and other code injection attacks
   */
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://appleid.cdn-apple.com", // Allow Google/Apple OAuth
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://accounts.google.com https://appleid.apple.com",
    "frame-src 'self' https://accounts.google.com https://appleid.apple.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),

  /**
   * X-Content-Type-Options
   * Prevents MIME type sniffing
   */
  'X-Content-Type-Options': 'nosniff',

  /**
   * X-Frame-Options
   * Prevents clickjacking
   */
  'X-Frame-Options': 'DENY',

  /**
   * X-XSS-Protection
   * Enables XSS filter in older browsers
   */
  'X-XSS-Protection': '1; mode=block',

  /**
   * Referrer-Policy
   * Controls how much referrer information is sent
   */
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  /**
   * Permissions-Policy
   * Controls which features and APIs can be used
   */
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()'
  ].join(', ')
}

/**
 * Apply security headers to meta tags
 * Note: These should ideally be set by the server, but we can add some via meta tags
 */
export function applySecurityHeaders() {
  // Set Content Security Policy via meta tag (fallback)
  const cspMeta = document.createElement('meta')
  cspMeta.httpEquiv = 'Content-Security-Policy'
  cspMeta.content = SECURITY_HEADERS['Content-Security-Policy']
  
  // Only apply if not already set
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    document.head.appendChild(cspMeta)
  }

  // Set X-Content-Type-Options
  const contentTypeMeta = document.createElement('meta')
  contentTypeMeta.httpEquiv = 'X-Content-Type-Options'
  contentTypeMeta.content = 'nosniff'
  
  if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
    document.head.appendChild(contentTypeMeta)
  }

  // Set Referrer Policy
  const referrerMeta = document.createElement('meta')
  referrerMeta.name = 'referrer'
  referrerMeta.content = 'strict-origin-when-cross-origin'
  
  if (!document.querySelector('meta[name="referrer"]')) {
    document.head.appendChild(referrerMeta)
  }

  console.log('🔒 Security headers applied')
}

/**
 * Security best practices configuration
 */
export const SECURITY_CONFIG = {
  // Session timeout (30 minutes of inactivity)
  SESSION_TIMEOUT: 30 * 60 * 1000,

  // Maximum login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,

  // Login lockout duration (15 minutes)
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000,

  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,

  // Input validation
  MAX_INPUT_LENGTH: 1000,
  MAX_USERNAME_LENGTH: 30,
  MAX_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 254,

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // CSRF protection
  CSRF_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours

  // Cookie settings
  COOKIE_SECURE: true, // Only send over HTTPS
  COOKIE_HTTP_ONLY: true, // Not accessible via JavaScript
  COOKIE_SAME_SITE: 'strict' as const,

  // Development mode flag
  IS_DEVELOPMENT: import.meta.env.DEV
}

export default {
  SECURITY_HEADERS,
  SECURITY_CONFIG,
  applySecurityHeaders
}

