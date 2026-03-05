import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '../database/supabase'
import { User } from '../types'
import {
  getUserByAuthId,
  getUserByEmail,
  getUserById,
  createUserProfile,
  linkUserAuthId,
} from '../database/supabase-api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setState({ user: null, isAuthenticated: false, isLoading: false, error: null })
          return
        }

        let user = await getUserByAuthId(session.user.id)

        // Existing user migrating to Supabase Auth — link by email
        if (!user && session.user.email) {
          user = await linkUserAuthId(session.user.email, session.user.id)
        }

        if (user) {
          if (user.status === 'banned') {
            await supabase.auth.signOut()
            setState({ user: null, isAuthenticated: false, isLoading: false, error: null })
          } else {
            setState({ user, isAuthenticated: true, isLoading: false, error: null })
          }
        } else {
          // No profile found — sign out and surface an error
          await supabase.auth.signOut()
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'ACCOUNT NOT FOUND. PLEASE SIGN UP.',
          })
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) {
      setState(s => ({ ...s, isLoading: false, error: 'INVALID CREDENTIALS' }))
    }
    // On success, onAuthStateChange fires and sets the user
  }, [])

  const signup = useCallback(async (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    setState(s => ({ ...s, isLoading: true, error: null }))

    if (!name.trim() || name.trim().length < 2) {
      setState(s => ({ ...s, isLoading: false, error: 'NAME TOO SHORT' }))
      return
    }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setState(s => ({ ...s, isLoading: false, error: 'USERNAME: 3-20 CHARS, LETTERS/NUMBERS/_/-' }))
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signUpError) {
      setState(s => ({ ...s, isLoading: false, error: signUpError.message.toUpperCase() }))
      return
    }

    const authUser = data.user
    if (!authUser) {
      setState(s => ({ ...s, isLoading: false, error: 'SIGNUP FAILED. TRY AGAIN.' }))
      return
    }

    // Check if email already exists (existing user — link their profile)
    const existingUser = await getUserByEmail(email.trim().toLowerCase())

    if (existingUser) {
      const linked = await linkUserAuthId(email.trim().toLowerCase(), authUser.id)
      if (linked) {
        setState({ user: linked, isAuthenticated: true, isLoading: false, error: null })
      } else {
        setState(s => ({ ...s, isLoading: false, error: 'PROFILE LINK FAILED. TRY AGAIN.' }))
        await supabase.auth.signOut()
      }
      return
    }

    // Brand new user — create profile
    const avatars = ['🎯', '🔥', '⚡', '💀', '🎮', '🃏', '🏆', '👾', '🎲', '🌀']
    const avatar = avatars[Math.floor(Math.random() * avatars.length)]
    try {
      const newUser = await createUserProfile({
        authId: authUser.id,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        avatar,
      })
      setState({ user: newUser, isAuthenticated: true, isLoading: false, error: null })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[SIGNUP] createUserProfile failed:', msg)
      setState(s => ({ ...s, isLoading: false, error: msg.toUpperCase() }))
      await supabase.auth.signOut()
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore sign-out errors
    }
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
