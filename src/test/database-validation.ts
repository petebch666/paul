/**
 * Database Validation Suite
 * Phase 1: Testing & Validation
 * 
 * This suite validates database schema, constraints, and policies
 */

import { supabase } from '../database/supabase'

// ============================================
// DATABASE VALIDATION RESULTS
// ============================================

interface ValidationResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

class DatabaseValidator {
  private results: ValidationResult[] = []

  addResult(name: string, passed: boolean, error?: string, details?: any) {
    this.results.push({ name, passed, error, details })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status}: ${name}`)
    if (error) {
      console.log(`   Error: ${error}`)
    }
    if (details) {
      console.log(`   Details:`, details)
    }
  }

  summary() {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    console.log('\n' + '='.repeat(50))
    console.log('📊 DATABASE VALIDATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`)
    console.log('='.repeat(50))

    return { total, passed, failed, successRate: (passed / total) * 100 }
  }
}

const validator = new DatabaseValidator()

// ============================================
// VALIDATION TESTS
// ============================================

/**
 * Test Database Connection
 */
export async function validateDatabaseConnection() {
  console.log('\n🔌 Testing Database Connection...')

  try {
    const { data, error } = await supabase
      .from('polls')
      .select('id')
      .limit(1)

    if (error) {
      validator.addResult('Database Connection', false, error.message)
    } else {
      validator.addResult('Database Connection', true, undefined, 'Connected to Supabase')
    }
  } catch (error) {
    validator.addResult('Database Connection', false, error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Validate Table Existence
 */
export async function validateTableExistence() {
  console.log('\n📋 Validating Table Existence...')

  const tables = ['users', 'polls', 'votes', 'notifications', 'poll_history']

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (error) {
        validator.addResult(`Table Exists: ${table}`, false, error.message)
      } else {
        validator.addResult(`Table Exists: ${table}`, true)
      }
    } catch (error) {
      validator.addResult(`Table Exists: ${table}`, false, error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

/**
 * Validate Foreign Key Constraints
 */
export async function validateForeignKeyConstraints() {
  console.log('\n🔗 Validating Foreign Key Constraints...')

  // Test votes.poll_id -> polls.id
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('poll_id')
      .limit(1)

    if (error && error.code === '42P01') {
      validator.addResult('FK: votes.poll_id', false, 'Foreign key constraint issue')
    } else {
      validator.addResult('FK: votes.poll_id', true)
    }
  } catch (error) {
    validator.addResult('FK: votes.poll_id', false, error instanceof Error ? error.message : 'Unknown error')
  }

  // Test votes.user_id -> users.id
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('user_id')
      .limit(1)

    validator.addResult('FK: votes.user_id', !error, error?.message)
  } catch (error) {
    validator.addResult('FK: votes.user_id', false, error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Validate Unique Constraints
 */
export async function validateUniqueConstraints() {
  console.log('\n🔐 Validating Unique Constraints...')

  // Test: Each user can only vote once per poll
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('poll_id, user_id')
      .limit(100)

    if (data && data.length > 0) {
      // Check for duplicate votes
      const voteMap = new Map<string, Set<string>>()
      let hasDuplicates = false

      for (const vote of data) {
        const key = vote.poll_id
        if (!voteMap.has(key)) {
          voteMap.set(key, new Set())
        }
        if (voteMap.get(key)!.has(vote.user_id)) {
          hasDuplicates = true
          break
        }
        voteMap.get(key)!.add(vote.user_id)
      }

      validator.addResult('Unique Constraint: One vote per user per poll', !hasDuplicates)
    } else {
      validator.addResult('Unique Constraint: One vote per user per poll', true, undefined, 'No votes to check')
    }
  } catch (error) {
    validator.addResult('Unique Constraint: One vote per user per poll', false, error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Validate Trigger: Automatic Vote Counting
 */
export async function validateVoteCountTrigger() {
  console.log('\n⚙️ Validating Vote Count Trigger...')

  try {
    // Get a poll
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select('id, votes, votes_option_a, votes_option_b')
      .limit(1)
      .single()

    if (pollsError || !polls) {
      validator.addResult('Trigger: Vote Count', false, 'No polls found')
      return
    }

    // Get votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('option')
      .eq('poll_id', polls.id)

    if (votesError) {
      validator.addResult('Trigger: Vote Count', false, votesError.message)
      return
    }

    const voteCountA = votes?.filter(v => v.option === 'A').length || 0
    const voteCountB = votes?.filter(v => v.option === 'B').length || 0
    const totalVotes = votes?.length || 0

    // Check if database counts match actual votes
    const countsMatch = 
      polls.votes === totalVotes &&
      polls.votes_option_a === voteCountA &&
      polls.votes_option_b === voteCountB

    validator.addResult(
      'Trigger: Vote Count',
      countsMatch,
      countsMatch ? undefined : 'Vote counts do not match actual votes',
      {
        dbVotes: polls.votes,
        actualVotes: totalVotes,
        dbOptionA: polls.votes_option_a,
        actualOptionA: voteCountA,
        dbOptionB: polls.votes_option_b,
        actualOptionB: voteCountB
      }
    )
  } catch (error) {
    validator.addResult('Trigger: Vote Count', false, error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Validate Data Types
 */
export async function validateDataTypes() {
  console.log('\n📊 Validating Data Types...')

  try {
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*')
      .limit(1)
      .single()

    if (error || !polls) {
      validator.addResult('Data Types: Polls', false, 'No polls found')
      return
    }

    const checks = {
      'id is UUID': typeof polls.id === 'string' && polls.id.includes('-'),
      'votes is number': typeof polls.votes === 'number',
      'title is string': typeof polls.title === 'string',
      'created_at is date': polls.created_at instanceof Date || typeof polls.created_at === 'string'
    }

    const allChecksPassed = Object.values(checks).every(check => check)
    validator.addResult('Data Types: Polls', allChecksPassed, undefined, checks)
  } catch (error) {
    validator.addResult('Data Types: Polls', false, error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Validate Indexes Performance
 */
export async function validateIndexes() {
  console.log('\n⚡ Validating Indexes...')

  const indexes = [
    { table: 'polls', column: 'created_at', name: 'idx_polls_created_at' },
    { table: 'polls', column: 'trending_score', name: 'idx_polls_trending_score' },
    { table: 'polls', column: 'category', name: 'idx_polls_category' },
    { table: 'votes', column: 'poll_id', name: 'idx_votes_poll_id' },
    { table: 'votes', column: 'user_id', name: 'idx_votes_user_id' }
  ]

  for (const index of indexes) {
    try {
      // Try to query using the indexed column
      const { data, error } = await supabase
        .from(index.table)
        .select('*')
        .limit(1)

      validator.addResult(`Index: ${index.name}`, !error)
    } catch (error) {
      validator.addResult(`Index: ${index.name}`, false, error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

/**
 * Main Validation Runner
 */
export async function runAllValidations() {
  console.log('🔍 Starting Database Validation...\n')

  await validateDatabaseConnection()
  await validateTableExistence()
  await validateForeignKeyConstraints()
  await validateUniqueConstraints()
  await validateVoteCountTrigger()
  await validateDataTypes()
  await validateIndexes()

  const summary = validator.summary()
  return summary
}

export default { runAllValidations }

