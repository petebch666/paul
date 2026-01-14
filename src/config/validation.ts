/**
 * Configuration for AI Poll Validation System
 * 
 * This file contains all configuration settings for the Ollama-based
 * poll validation system.
 */

export interface ValidationConfig {
  ollamaEndpoint: string
  modelName: string
  workerInterval: number // in milliseconds
  maxRetries: number
  retryDelay: number // in milliseconds
  timeout: number // in milliseconds
}

/**
 * Default validation configuration
 * Can be overridden via environment variables
 */
export const defaultValidationConfig: ValidationConfig = {
  // Ollama API endpoint (default: localhost)
  ollamaEndpoint: import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434',
  
  // Model name to use for validation
  // Recommended: llama3.2:3b (fast) or llama3.2:1b (very fast)
  // For better accuracy: llama3.2:7b or mistral:7b
  modelName: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2:3b',
  
  // How often the validation worker should check for pending polls (in ms)
  workerInterval: 30000, // 30 seconds
  
  // Maximum number of retries for failed validations
  maxRetries: 3,
  
  // Delay between retries (in ms)
  retryDelay: 5000, // 5 seconds
  
  // Request timeout for Ollama API calls (in ms)
  timeout: 30000, // 30 seconds
}

/**
 * Get the current validation configuration
 * Can be customized per environment
 */
export function getValidationConfig(): ValidationConfig {
  return { ...defaultValidationConfig }
}

