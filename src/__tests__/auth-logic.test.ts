/**
 * Unit tests for the authentication identifier logic in src/hooks/useAuth.ts.
 *
 * The login() function uses this regex to decide whether the identifier
 * is an email address or a plain username:
 *
 *   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
 *
 * If isEmail is true  → use the identifier directly as the email
 * If isEmail is false → look up the username to obtain the email
 *
 * These tests validate the regex in complete isolation — no React
 * rendering, no hooks, no Supabase calls.
 *
 * The signup() function uses the same pattern for email validation,
 * and also validates name, username format, and password length.
 * Those validations are tested here as pure logic checks too.
 */

// ─────────────────────────────────────────────────────────────
// The regex extracted directly from useAuth.ts login()
// ─────────────────────────────────────────────────────────────

/** Mirrors the exact regex used in useAuth login() */
const isEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isEmail(identifier: string): boolean {
  return isEmailRegex.test(identifier.trim().toLowerCase())
}

// ─────────────────────────────────────────────────────────────
// The username format regex from useAuth.ts signup()
// ─────────────────────────────────────────────────────────────

/** Mirrors the username validation regex in useAuth signup() */
const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/

function isValidUsername(username: string): boolean {
  return usernameRegex.test(username)
}

// ─────────────────────────────────────────────────────────────
// Email detection — login identifier routing
// ─────────────────────────────────────────────────────────────

describe('isEmail regex (login identifier detection)', () => {
  describe('valid email addresses → should return true', () => {
    it('should detect a standard email address', () => {
      expect(isEmail('user@example.com')).toBe(true)
    })

    it('should detect email with subdomain', () => {
      expect(isEmail('user@mail.example.com')).toBe(true)
    })

    it('should detect email with plus addressing', () => {
      expect(isEmail('user+tag@example.com')).toBe(true)
    })

    it('should detect email with dots in local part', () => {
      expect(isEmail('first.last@example.com')).toBe(true)
    })

    it('should detect email with hyphens in domain', () => {
      expect(isEmail('alice@my-domain.co.uk')).toBe(true)
    })

    it('should detect email with numbers in local part', () => {
      expect(isEmail('user123@example.org')).toBe(true)
    })

    it('should detect uppercase email (normalised via toLowerCase)', () => {
      // useAuth trims and lowercases before testing — our isEmail() wrapper does the same
      expect(isEmail('USER@EXAMPLE.COM')).toBe(true)
    })

    it('should detect email with single-char local part', () => {
      expect(isEmail('a@b.co')).toBe(true)
    })
  })

  describe('invalid / username-style inputs → should return false', () => {
    it('plain username with no @ should not be detected as email', () => {
      expect(isEmail('username')).toBe(false)
    })

    it('username with dots but no @ should not be detected as email', () => {
      expect(isEmail('user.name')).toBe(false)
    })

    it('@ with nothing before it should not be detected as email', () => {
      expect(isEmail('@username')).toBe(false)
    })

    it('@ with nothing after the dot should not be detected as email', () => {
      // "user@domain." — trailing dot, empty TLD
      expect(isEmail('user@domain.')).toBe(false)
    })

    it('missing TLD (no dot after @) should not be detected as email', () => {
      expect(isEmail('user@')).toBe(false)
    })

    it('partial email with only local and @ should not be detected', () => {
      expect(isEmail('user@nodot')).toBe(false)
    })

    it('string with spaces should not be detected as email', () => {
      expect(isEmail('user name@example.com')).toBe(false)
    })

    it('empty string should not be detected as email', () => {
      expect(isEmail('')).toBe(false)
    })

    it('numeric-only string should not be detected as email', () => {
      expect(isEmail('12345')).toBe(false)
    })

    it('username with underscores should not be detected as email', () => {
      expect(isEmail('cool_user_99')).toBe(false)
    })

    it('username with hyphens should not be detected as email', () => {
      expect(isEmail('my-username')).toBe(false)
    })
  })

  describe('edge / boundary cases', () => {
    it('double @ should not be treated as a valid email', () => {
      // "[^\s@]+" on left of @ means no @ is allowed in local part
      expect(isEmail('user@@example.com')).toBe(false)
    })

    it('@ in the domain part should not be treated as valid', () => {
      expect(isEmail('user@ex@ample.com')).toBe(false)
    })

    it('whitespace-only string should not be detected as email', () => {
      expect(isEmail('   ')).toBe(false)
    })

    it('email surrounded by whitespace is trimmed before testing', () => {
      // isEmail() trims before testing, matching what useAuth does
      expect(isEmail('  alice@example.com  ')).toBe(true)
    })
  })
})

// ─────────────────────────────────────────────────────────────
// Username validation — signup form
// ─────────────────────────────────────────────────────────────

describe('username validation regex (signup)', () => {
  describe('valid usernames', () => {
    it('should accept alphanumeric username', () => {
      expect(isValidUsername('alice123')).toBe(true)
    })

    it('should accept username with underscores', () => {
      expect(isValidUsername('my_user')).toBe(true)
    })

    it('should accept username with hyphens', () => {
      expect(isValidUsername('my-user')).toBe(true)
    })

    it('should accept exactly 3 characters (minimum length)', () => {
      expect(isValidUsername('abc')).toBe(true)
    })

    it('should accept exactly 20 characters (maximum length)', () => {
      expect(isValidUsername('a'.repeat(20))).toBe(true)
    })

    it('should accept mixed case username (regex is case-insensitive via character class)', () => {
      expect(isValidUsername('CoolUser')).toBe(true)
    })
  })

  describe('invalid usernames', () => {
    it('should reject username shorter than 3 characters', () => {
      expect(isValidUsername('ab')).toBe(false)
    })

    it('should reject username longer than 20 characters', () => {
      expect(isValidUsername('a'.repeat(21))).toBe(false)
    })

    it('should reject username with spaces', () => {
      expect(isValidUsername('my user')).toBe(false)
    })

    it('should reject username with @ symbol', () => {
      expect(isValidUsername('user@name')).toBe(false)
    })

    it('should reject username with dots', () => {
      expect(isValidUsername('user.name')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidUsername('')).toBe(false)
    })

    it('should reject username with special characters', () => {
      expect(isValidUsername('user!')).toBe(false)
    })

    it('should reject username with slashes', () => {
      expect(isValidUsername('user/path')).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────
// Password validation — signup form (inline logic)
// ─────────────────────────────────────────────────────────────

describe('password length validation (signup)', () => {
  /** Mirrors the check in useAuth signup() */
  function isValidPassword(password: string): boolean {
    return password.length >= 8
  }

  it('should accept a password of exactly 8 characters', () => {
    expect(isValidPassword('12345678')).toBe(true)
  })

  it('should accept a password longer than 8 characters', () => {
    expect(isValidPassword('a very long password!')).toBe(true)
  })

  it('should reject a password of 7 characters', () => {
    expect(isValidPassword('1234567')).toBe(false)
  })

  it('should reject an empty password', () => {
    expect(isValidPassword('')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// Name validation — signup form (inline logic)
// ─────────────────────────────────────────────────────────────

describe('name validation (signup)', () => {
  /** Mirrors: !name.trim() || name.trim().length < 2 */
  function isValidName(name: string): boolean {
    return name.trim().length >= 2
  }

  it('should accept a name with exactly 2 characters after trim', () => {
    expect(isValidName('Jo')).toBe(true)
  })

  it('should accept a normal full name', () => {
    expect(isValidName('Alice Smith')).toBe(true)
  })

  it('should reject a single character name', () => {
    expect(isValidName('J')).toBe(false)
  })

  it('should reject an empty string', () => {
    expect(isValidName('')).toBe(false)
  })

  it('should reject a whitespace-only string', () => {
    expect(isValidName('   ')).toBe(false)
  })

  it('should trim whitespace before checking length', () => {
    // " A " trims to "A" — length 1, invalid
    expect(isValidName(' A ')).toBe(false)
    // " AB " trims to "AB" — length 2, valid
    expect(isValidName(' AB ')).toBe(true)
  })
})
