// React Native compatible security utilities
import bcrypt from 'bcryptjs'
import validator from 'validator'

/**
 * Security Utilities for Pollz App (React Native)
 * Implements critical security measures including:
 * - Password hashing
 * - Input validation
 * - Rate limiting
 */

// ==================== PASSWORD SECURITY ====================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error('Password hashing failed:', error)
    throw new Error('Password hashing failed')
  }
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password comparison failed:', error)
    return false
  }
}

// ==================== INPUT VALIDATION ====================

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123']
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!email || !validator.isEmail(email)) {
    errors.push('Please enter a valid email address')
  }
  
  if (email && email.length > 254) {
    errors.push('Email address is too long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate username
 */
export function validateUsername(username: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }
  
  if (username && username.length > 30) {
    errors.push('Username must be less than 30 characters')
  }
  
  if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens')
  }
  
  // Check for reserved usernames
  const reservedUsernames = ['admin', 'root', 'api', 'www', 'mail', 'support', 'help']
  if (reservedUsernames.includes(username.toLowerCase())) {
    errors.push('This username is reserved')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate name
 */
export function validateName(name: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (name && name.length > 50) {
    errors.push('Name must be less than 50 characters')
  }
  
  if (name && !/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitize input to prevent XSS attacks
 * Note: React Native doesn't have DOM, so we use basic string sanitization
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// ==================== RATE LIMITING ====================

// Simple in-memory rate limiting (for React Native)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = identifier.toLowerCase()
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string): void {
  const key = identifier.toLowerCase()
  rateLimitStore.delete(key)
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  // Use React Native's crypto if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Fallback for React Native
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  
  return result
}

/**
 * Generate a secure random number
 */
export function generateSecureRandom(max: number = 1000000): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  } else {
    // Fallback for React Native
    return Math.floor(Math.random() * max)
  }
}

// ==================== SECURE STORAGE ====================

/**
 * Securely store data (React Native compatible)
 * Note: In React Native, use AsyncStorage or SecureStore for sensitive data
 */
export function secureStore(key: string, data: any): void {
  try {
    // In React Native, you would use AsyncStorage or SecureStore here
    // For now, we'll just log a warning
    console.warn('Secure storage not implemented - use AsyncStorage or SecureStore for sensitive data')
  } catch (error) {
    console.error('Failed to store data securely:', error)
  }
}

/**
 * Securely retrieve data (React Native compatible)
 */
export function secureRetrieve(key: string): any {
  try {
    // In React Native, you would use AsyncStorage or SecureStore here
    console.warn('Secure retrieval not implemented - use AsyncStorage or SecureStore for sensitive data')
    return null
  } catch (error) {
    console.error('Failed to retrieve data securely:', error)
    return null
  }
}

/**
 * Securely remove data (React Native compatible)
 */
export function secureRemove(key: string): void {
  try {
    // In React Native, you would use AsyncStorage or SecureStore here
    console.warn('Secure removal not implemented - use AsyncStorage or SecureStore for sensitive data')
  } catch (error) {
    console.error('Failed to remove data securely:', error)
  }
}