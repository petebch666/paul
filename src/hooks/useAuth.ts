import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import bcryptjs from 'bcryptjs'
import { User } from '../types'
import {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
} from '../database/supabase-api'

const SESSION_KEY = 'paul_user_id'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (emailOrUsername: string, password: string) => Promise<void>
  signup: (name: string, username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const storedId = await SecureStore.getItemAsync(SESSION_KEY)
      if (storedId) {
        const user = await getUserById(storedId)
        if (user && user.status !== 'banned') {
          setState({ user, isAuthenticated: true, isLoading: false, error: null })
          return
        }
        await SecureStore.deleteItemAsync(SESSION_KEY)
      }
    } catch {
      // silently fail — show login screen
    }
    setState(s => ({ ...s, isLoading: false }))
  }

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      const isEmail = emailOrUsername.includes('@')
      const user = isEmail
        ? await getUserByEmail(emailOrUsername.trim().toLowerCase())
        : await getUserByUsername(emailOrUsername.trim().toLowerCase())

      if (!user) {
        setState(s => ({ ...s, isLoading: false, error: 'USER NOT FOUND' }))
        return
      }
      if (user.status === 'banned') {
        setState(s => ({ ...s, isLoading: false, error: 'ACCOUNT BANNED' }))
        return
      }
      if (user.status === 'suspended') {
        setState(s => ({ ...s, isLoading: false, error: 'ACCOUNT SUSPENDED' }))
        return
      }
      if (!user.password) {
        setState(s => ({ ...s, isLoading: false, error: 'INVALID CREDENTIALS' }))
        return
      }

      const valid = await bcryptjs.compare(password, user.password)
      if (!valid) {
        setState(s => ({ ...s, isLoading: false, error: 'INCORRECT PASSWORD' }))
        return
      }

      await SecureStore.setItemAsync(SESSION_KEY, user.id)
      setState({ user, isAuthenticated: true, isLoading: false, error: null })
    } catch (e) {
      setState(s => ({ ...s, isLoading: false, error: 'LOGIN FAILED. TRY AGAIN.' }))
    }
  }, [])

  const signup = useCallback(async (
    name: string,
    username: string,
    email: string,
    password: string
  ) => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    try {
      // Validate
      if (!name.trim() || name.trim().length < 2) {
        setState(s => ({ ...s, isLoading: false, error: 'NAME TOO SHORT' }))
        return
      }
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
        setState(s => ({
          ...s, isLoading: false,
          error: 'USERNAME: 3-20 CHARS, LETTERS/NUMBERS/_/-'
        }))
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setState(s => ({ ...s, isLoading: false, error: 'INVALID EMAIL' }))
        return
      }
      if (password.length < 8) {
        setState(s => ({ ...s, isLoading: false, error: 'PASSWORD MIN 8 CHARS' }))
        return
      }

      // Check duplicates
      const [existingEmail, existingUsername] = await Promise.all([
        getUserByEmail(email.toLowerCase()),
        getUserByUsername(username.toLowerCase()),
      ])
      if (existingEmail) {
        setState(s => ({ ...s, isLoading: false, error: 'EMAIL ALREADY REGISTERED' }))
        return
      }
      if (existingUsername) {
        setState(s => ({ ...s, isLoading: false, error: 'USERNAME TAKEN' }))
        return
      }

      const hashedPassword = await bcryptjs.hash(password, 10)
      const avatars = ['🎯', '🔥', '⚡', '💀', '🎮', '🃏', '🏆', '👾', '🎲', '🌀']
      const avatar = avatars[Math.floor(Math.random() * avatars.length)]

      const user = await createUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        avatar,
      })

      await SecureStore.setItemAsync(SESSION_KEY, user.id)
      setState({ user, isAuthenticated: true, isLoading: false, error: null })
    } catch (e) {
      setState(s => ({ ...s, isLoading: false, error: 'SIGNUP FAILED. TRY AGAIN.' }))
    }
  }, [])

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY)
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null })
  }, [])

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }))
  }, [])

  const refreshUser = useCallback(async () => {
    if (!state.user) return
    const updated = await getUserById(state.user.id)
    if (updated) setState(s => ({ ...s, user: updated }))
  }, [state.user])

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    clearError,
    refreshUser,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
