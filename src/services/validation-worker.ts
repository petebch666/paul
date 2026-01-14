/**
 * Validation Worker
 * 
 * Background service that processes pending polls through the AI validator
 * and updates their validation status in the database.
 */

import { Poll } from '../types'
import { pollValidator, ValidationResult } from './poll-validator'
import { SupabasePollzAPI } from '../database/supabase-api'
import { getValidationConfig } from '../config/validation'

export interface ValidationWorkerStats {
  processed: number
  approved: number
  rejected: number
  errors: number
  lastRun: Date | null
}

/**
 * Validation Worker class that processes pending polls
 */
export class ValidationWorker {
  private config = getValidationConfig()
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private stats: ValidationWorkerStats = {
    processed: 0,
    approved: 0,
    rejected: 0,
    errors: 0,
    lastRun: null
  }

  /**
   * Start the validation worker
   */
  start(): void {
    if (this.intervalId) {
      console.log('⚠️ Validation worker is already running')
      return
    }

    console.log('🚀 Starting validation worker...')
    console.log(`   Interval: ${this.config.workerInterval}ms`)
    console.log(`   Model: ${this.config.modelName}`)
    console.log(`   Endpoint: ${this.config.ollamaEndpoint}`)

    // Check Ollama availability
    this.checkOllamaAvailability().then(available => {
      if (!available) {
        console.warn('⚠️ Ollama is not available. Polls will remain pending until Ollama is running.')
      } else {
        console.log('✅ Ollama is available')
      }
    })

    // Process immediately on start
    this.processPendingPolls()

    // Then process on interval
    this.intervalId = setInterval(() => {
      this.processPendingPolls()
    }, this.config.workerInterval)
  }

  /**
   * Stop the validation worker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('🛑 Validation worker stopped')
    }
  }

  /**
   * Process pending polls
   */
  async processPendingPolls(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ Validation worker is already processing, skipping...')
      return
    }

    this.isRunning = true
    this.stats.lastRun = new Date()

    try {
      // Check Ollama availability first
      const available = await this.checkOllamaAvailability()
      if (!available) {
        console.log('⏸️ Ollama is not available, skipping validation cycle')
        this.isRunning = false
        return
      }

      // Get pending polls
      const pendingPolls = await SupabasePollzAPI.getPendingPolls(5) // Process 5 at a time

      if (pendingPolls.length === 0) {
        console.log('✅ No pending polls to validate')
        this.isRunning = false
        return
      }

      console.log(`📋 Processing ${pendingPolls.length} pending poll(s)...`)

      // Process each poll
      for (const poll of pendingPolls) {
        await this.validatePoll(poll)
        
        // Small delay between polls to avoid overwhelming Ollama
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`✅ Validation cycle complete. Stats: ${this.stats.processed} processed, ${this.stats.approved} approved, ${this.stats.rejected} rejected, ${this.stats.errors} errors`)
    } catch (error) {
      console.error('❌ Error in validation worker:', error)
      this.stats.errors++
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Validate a single poll
   */
  private async validatePoll(poll: Poll): Promise<void> {
    try {
      console.log(`🔍 Validating poll: "${poll.title}" (${poll.id})`)

      let retries = 0
      let result: ValidationResult | null = null

      // Retry logic
      while (retries < this.config.maxRetries && !result) {
        try {
          result = await pollValidator.validatePoll(poll)
          break
        } catch (error) {
          retries++
          if (retries < this.config.maxRetries) {
            console.log(`   ⚠️ Validation failed, retrying (${retries}/${this.config.maxRetries})...`)
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
          } else {
            throw error
          }
        }
      }

      if (!result) {
        throw new Error('Failed to get validation result after retries')
      }

      // Update poll status
      const status = result.approved ? 'approved' : 'rejected'
      await SupabasePollzAPI.updatePollValidationStatus(
        poll.id,
        status,
        result.reason
      )

      // Update stats
      this.stats.processed++
      if (result.approved) {
        this.stats.approved++
        console.log(`   ✅ Poll approved: "${poll.title}"`)
      } else {
        this.stats.rejected++
        console.log(`   ❌ Poll rejected: "${poll.title}" - ${result.reason}`)
      }

      // Create notification for poll author if rejected
      if (!result.approved && poll.authorId) {
        try {
          await SupabasePollzAPI.createNotification({
            pollId: poll.id,
            userId: poll.authorId,
            type: 'poll_created', // Using existing type
            message: `Your poll "${poll.title}" was rejected: ${result.reason || 'Poll does not meet content guidelines'}`
          })
        } catch (error) {
          console.error('   ⚠️ Failed to create rejection notification:', error)
        }
      }
    } catch (error) {
      console.error(`   ❌ Error validating poll ${poll.id}:`, error)
      this.stats.errors++
    }
  }

  /**
   * Check if Ollama is available
   */
  private async checkOllamaAvailability(): Promise<boolean> {
    try {
      return await pollValidator.checkAvailability()
    } catch (error) {
      return false
    }
  }

  /**
   * Get worker statistics
   */
  getStats(): ValidationWorkerStats {
    return { ...this.stats }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      processed: 0,
      approved: 0,
      rejected: 0,
      errors: 0,
      lastRun: null
    }
  }
}

// Export singleton instance
export const validationWorker = new ValidationWorker()

// Auto-start worker in browser environment (if not in test mode)
if (typeof window !== 'undefined' && !import.meta.env.VITEST) {
  // Start worker after a short delay to allow app to initialize
  setTimeout(() => {
    validationWorker.start()
  }, 5000) // 5 second delay
}

