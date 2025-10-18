import { createClient } from '@supabase/supabase-js'
import { ENV } from '../config/env'

// Get Supabase credentials from environment variables
const supabaseUrl = ENV.SUPABASE_URL
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your-project-url.supabase.co' && 
    supabaseAnonKey !== 'your-anon-key-here')
}

// Log configuration status
if (isSupabaseConfigured()) {
  console.log('✅ Supabase configured:', supabaseUrl)
} else {
  console.warn('⚠️ Supabase not configured. Add credentials to .env file.')
  console.warn('See SUPABASE-SETUP-INSTRUCTIONS.md for details')
}

export default supabase

