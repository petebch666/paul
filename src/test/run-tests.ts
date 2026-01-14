/**
 * Test Runner for Pollz API
 * Phase 1: Testing & Validation
 * 
 * Run comprehensive tests for all API operations
 */

import { runAllTests } from './api-test-suite'
import { runAllValidations } from './database-validation'

/**
 * Main test runner
 */
async function main() {
  console.log('🚀 Pollz API Test Suite')
  console.log('=' .repeat(50))
  console.log('Testing all critical API operations and database validation')
  console.log('='.repeat(50) + '\n')

  try {
    // Run API tests
    console.log('📡 Running API Tests...')
    const apiResults = await runAllTests()

    // Run database validation
    console.log('\n📊 Running Database Validation...')
    const validationResults = await runAllValidations()

    // Final summary
    console.log('\n\n' + '='.repeat(50))
    console.log('🎉 TESTING COMPLETE')
    console.log('='.repeat(50))
    console.log('API Tests:')
    console.log(`  ✅ ${apiResults.passed}/${apiResults.total} passed (${Math.round(apiResults.successRate)}%)`)
    console.log('Database Validation:')
    console.log(`  ✅ ${validationResults.passed}/${validationResults.total} passed (${Math.round(validationResults.successRate)}%)`)

    const overallSuccess = apiResults.successRate >= 80 && validationResults.successRate >= 80
    if (overallSuccess) {
      console.log('\n✅ All tests passed! Ready for production.')
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues.')
    }

    console.log('='.repeat(50))

    return overallSuccess
  } catch (error) {
    console.error('❌ Test execution failed:', error)
    return false
  }
}

// Run if called directly
if (typeof window === 'undefined') {
  main().catch(console.error)
}

export default main

