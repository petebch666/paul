/**
 * Poll Validator Service
 * 
 * Validates polls using Ollama LLM to ensure they meet content guidelines:
 * - Must be humorous/lighthearted
 * - No country/people battles
 * - No sexist content
 * - No political content
 */

import { Poll } from '../types'
import { getValidationConfig } from '../config/validation'

export interface ValidationResult {
  approved: boolean
  reason?: string
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

/**
 * Poll Validator class that uses Ollama to validate polls
 */
export class PollValidator {
  private config = getValidationConfig()

  /**
   * Validates a poll using Ollama LLM
   * @param poll The poll to validate
   * @returns Validation result with approval status and reason
   */
  async validatePoll(poll: Poll): Promise<ValidationResult> {
    try {
      const prompt = this.buildValidationPrompt(poll)
      const response = await this.callOllama(prompt)
      return this.parseResponse(response)
    } catch (error) {
      console.error('Error validating poll:', error)
      // On error, reject the poll with error message
      return {
        approved: false,
        reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Builds the validation prompt for the LLM
   */
  private buildValidationPrompt(poll: Poll): string {
    const pollText = `
Title: ${poll.title}
Description: ${poll.description || 'N/A'}
Category: ${poll.category}
Option A: ${poll.arguments?.optionA || 'N/A'}
Option B: ${poll.arguments?.optionB || 'N/A'}
Context: ${poll.context || 'N/A'}
`.trim()

    return `You are a content moderator for a humorous poll platform. Your job is to validate polls to ensure they meet strict content guidelines.

VALIDATION RULES:
1. The poll MUST be humorous, lighthearted, or funny. Serious debates are NOT allowed.
2. NO country or people battles (e.g., "France vs Germany", "Americans vs Europeans")
3. NO sexist content (e.g., "male vs female", gender-based comparisons)
4. NO political content (e.g., political parties, political figures, political issues)

APPROVED EXAMPLES:
- "Pineapple on pizza: Yes or No?"
- "Cats vs Dogs: Which is cuter?"
- "Morning person vs Night owl: Which are you?"
- "Coffee vs Tea: Which wakes you up better?"
- "Tabs vs Spaces: Which is better for code?"

REJECTED EXAMPLES:
- "France vs Germany: Which country is better?" (country battle)
- "Men vs Women: Who is smarter?" (sexist)
- "Democrats vs Republicans: Which party is right?" (political)
- "Should we raise taxes?" (political, not humorous)
- "Which country has the best food?" (country battle)

POLL TO VALIDATE:
${pollText}

Respond with ONLY a valid JSON object in this exact format:
{
  "approved": true or false,
  "reason": "brief explanation (required if rejected, optional if approved)"
}

Do not include any text before or after the JSON object.`
  }

  /**
   * Calls Ollama API with the prompt
   */
  private async callOllama(prompt: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3, // Lower temperature for more consistent results
            top_p: 0.9,
          }
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data: OllamaResponse = await response.json()
      return data.response.trim()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Validation request timed out')
      }
      throw error
    }
  }

  /**
   * Parses the LLM response into a ValidationResult
   */
  private parseResponse(response: string): ValidationResult {
    try {
      // Try to extract JSON from the response (in case LLM adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      if (typeof parsed.approved !== 'boolean') {
        throw new Error('Invalid response format: approved must be boolean')
      }

      return {
        approved: parsed.approved,
        reason: parsed.reason || (parsed.approved ? undefined : 'Poll does not meet content guidelines')
      }
    } catch (error) {
      console.error('Error parsing validation response:', error)
      console.error('Raw response:', response)
      // If we can't parse, default to rejection
      return {
        approved: false,
        reason: 'Unable to parse validation response. Please ensure the poll is humorous and follows content guidelines.'
      }
    }
  }

  /**
   * Checks if Ollama is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.ollamaEndpoint}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for availability check
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const pollValidator = new PollValidator()

