/**
 * Test Signup Utility
 * Helps debug signup issues
 */

import { 
  validatePassword,
  validateEmail,
  validateUsername,
  validateName
} from './security'

export function testSignupValidation() {
  console.log('🧪 TESTING SIGNUP VALIDATION')
  console.log('============================\n')

  // Test data
  const testData = {
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Test@123'
  }

  console.log('Test Data:', testData)
  console.log('\n--- Validation Results ---\n')

  // Test name
  const nameResult = validateName(testData.name)
  console.log('Name:', nameResult.isValid ? '✅ VALID' : '❌ INVALID')
  if (!nameResult.isValid) console.log('  Error:', nameResult.error)
  if (nameResult.sanitized) console.log('  Sanitized:', nameResult.sanitized)

  // Test username
  const usernameResult = validateUsername(testData.username)
  console.log('\nUsername:', usernameResult.isValid ? '✅ VALID' : '❌ INVALID')
  if (!usernameResult.isValid) console.log('  Error:', usernameResult.error)
  if (usernameResult.sanitized) console.log('  Sanitized:', usernameResult.sanitized)

  // Test email
  const emailResult = validateEmail(testData.email)
  console.log('\nEmail:', emailResult.isValid ? '✅ VALID' : '❌ INVALID')
  if (!emailResult.isValid) console.log('  Error:', emailResult.error)
  if (emailResult.sanitized) console.log('  Sanitized:', emailResult.sanitized)

  // Test password
  const passwordResult = validatePassword(testData.password)
  console.log('\nPassword:', passwordResult.isValid ? '✅ VALID' : '❌ INVALID')
  if (!passwordResult.isValid) console.log('  Error:', passwordResult.error)

  console.log('\n============================')
  
  const allValid = nameResult.isValid && usernameResult.isValid && emailResult.isValid && passwordResult.isValid
  
  if (allValid) {
    console.log('✅ ALL VALIDATIONS PASSED!')
    console.log('\nExample valid password: Test@123')
  } else {
    console.log('❌ SOME VALIDATIONS FAILED')
    console.log('\nPassword Requirements:')
    console.log('  • Minimum 8 characters')
    console.log('  • At least 1 uppercase letter (A-Z)')
    console.log('  • At least 1 lowercase letter (a-z)')
    console.log('  • At least 1 number (0-9)')
    console.log('  • At least 1 special character (!@#$%^&*...)')
    console.log('\nExample valid password: MyP@ssw0rd123')
  }

  return allValid
}

// Test different password examples
export function testPasswordExamples() {
  console.log('\n🔐 PASSWORD EXAMPLES TEST')
  console.log('============================\n')

  const passwords = [
    'password',           // Too weak
    'Password',          // No number or special
    'Password123',       // No special char
    'password123!',      // No uppercase
    'PASSWORD123!',      // No lowercase
    'Test@123',          // Valid!
    'MyP@ssw0rd123',     // Valid!
    'Secure#Pass1',      // Valid!
  ]

  passwords.forEach(pwd => {
    const result = validatePassword(pwd)
    const status = result.isValid ? '✅' : '❌'
    console.log(`${status} "${pwd}"`)
    if (!result.isValid && result.error) {
      console.log(`   ${result.error}`)
    }
  })

  console.log('\n============================')
}

// Make available globally in development
if (import.meta.env.DEV) {
  try {
    (window as any).testSignupValidation = testSignupValidation
    (window as any).testPasswordExamples = testPasswordExamples
    console.log('💡 Run testSignupValidation() to test signup validation')
    console.log('💡 Run testPasswordExamples() to see password examples')
  } catch (e) {
    // Ignore errors in strict mode
  }
}

export default {
  testSignupValidation,
  testPasswordExamples
}

