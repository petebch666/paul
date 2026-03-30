import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl || ''

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (!supabaseUrl.startsWith('https://')) {
    console.error('[Supabase] URL must use HTTPS')
    return false
  }
  return true
}

export default supabase
