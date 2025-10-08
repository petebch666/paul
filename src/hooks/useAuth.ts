import { useState, useEffect, useCallback } from 'react'
import { User } from '../types'
import { PollzAPI } from '../database/api'
import { oauthService, OAuthUser } from '../services/oauth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth()
    // Temporarily disable OAuth initialization to debug
    // initializeOAuth()
  }, [])

  // Initialize OAuth services
  const initializeOAuth = useCallback(async () => {
    try {
      // Set client IDs from environment variables (if available)
      const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID
      const appleClientId = (import.meta as any).env?.VITE_APPLE_CLIENT_ID

      if (googleClientId) {
        oauthService.setGoogleClientId(googleClientId)
        await oauthService.initializeGoogle()
      }

      if (appleClientId) {
        oauthService.setAppleClientId(appleClientId)
        await oauthService.initializeApple()
      }
    } catch (error) {
      console.warn('OAuth initialization failed:', error)
    }
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('pollz-user')
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          
          // Verify user still exists in database
          const dbUser = await PollzAPI.getUserById(user.id)
          
          if (dbUser) {
            setAuthState({
              user: dbUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            console.log('✅ User authenticated from storage:', dbUser)
            return
          } else {
            // User no longer exists in database, clear storage
            localStorage.removeItem('pollz-user')
            console.log('⚠️ User not found in database, cleared storage')
          }
        } catch (error) {
          console.error('❌ Error parsing stored user:', error)
          localStorage.removeItem('pollz-user')
        }
      }

      // No valid user found
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      console.log('ℹ️ No authenticated user found')
      
    } catch (error) {
      console.error('❌ Authentication initialization failed:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication'
      })
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Find user by email
      const user = await PollzAPI.getUserByEmail(email)
      
      if (!user) {
        throw new Error('User not found. Please check your email or sign up.')
      }

      // Simple password check (in real app, use proper hashing)
      if (user.password !== password) {
        throw new Error('Invalid password. Please try again.')
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user
      
      // Store user in localStorage
      localStorage.setItem('pollz-user', JSON.stringify(userWithoutPassword))
      
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      console.log('✅ Login successful:', userWithoutPassword)
      return true
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
      return false
    }
  }, [])

  const signUp = useCallback(async (userData: {
    name: string
    username: string
    email: string
    password: string
  }): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Check if user already exists
      const existingUser = await PollzAPI.getUserByEmail(userData.email)
      if (existingUser) {
        throw new Error('User with this email already exists. Please login instead.')
      }

      // Generate unique ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create new user
      const newUser = {
        id: userId,
        name: userData.name,
        username: userData.username.startsWith('@') ? userData.username : `@${userData.username}`,
        email: userData.email,
        password: userData.password, // In real app, hash this
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=000000&color=ffffff&size=150`,
        followers: 0,
        following: 0,
        reputation: 0,
        badges: [],
        pollCount: 0,
        winRate: 0,
        joinDate: new Date()
      }

      // Save user to database
      await PollzAPI.createUser(newUser)

      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = newUser
      
      // Store user in localStorage
      localStorage.setItem('pollz-user', JSON.stringify(userWithoutPassword))
      
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      console.log('✅ Sign up successful:', userWithoutPassword)
      return true
      
    } catch (error) {
      console.error('❌ Sign up failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }))
      return false
    }
  }, [])

  const logout = useCallback(() => {
    // Clear user from localStorage
    localStorage.removeItem('pollz-user')
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })

    console.log('✅ User logged out')
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    // Update user in localStorage
    localStorage.setItem('pollz-user', JSON.stringify(updatedUser))
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }))

    console.log('✅ User updated:', updatedUser)
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const oauthUser = await oauthService.signInWithGoogle()
      
      if (!oauthUser) {
        throw new Error('Google sign-in failed')
      }

      // Check if user already exists
      let user = await PollzAPI.getUserByEmail(oauthUser.email)
      
      if (!user) {
        // Create new user from OAuth data
        const newUser = {
          id: oauthUser.id,
          name: oauthUser.name,
          username: `@${oauthUser.name.toLowerCase().replace(/\s+/g, '')}`,
          email: oauthUser.email,
          avatar: oauthUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(oauthUser.name)}&background=000000&color=ffffff&size=150`,
          followers: 0,
          following: 0,
          reputation: 0,
          badges: [],
          pollCount: 0,
          winRate: 0,
          joinDate: new Date()
        }

        user = await PollzAPI.createUser(newUser)
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user
      
      // Store user in localStorage
      localStorage.setItem('pollz-user', JSON.stringify(userWithoutPassword))
      
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      console.log('✅ Google sign-in successful:', userWithoutPassword)
      return true
      
    } catch (error) {
      console.error('❌ Google sign-in failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google sign-in failed'
      }))
      return false
    }
  }, [])

  const signInWithApple = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const oauthUser = await oauthService.signInWithApple()
      
      if (!oauthUser) {
        throw new Error('Apple sign-in failed')
      }

      // Check if user already exists
      let user = await PollzAPI.getUserByEmail(oauthUser.email)
      
      if (!user) {
        // Create new user from OAuth data
        const newUser = {
          id: oauthUser.id,
          name: oauthUser.name,
          username: `@${oauthUser.name.toLowerCase().replace(/\s+/g, '')}`,
          email: oauthUser.email,
          avatar: oauthUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(oauthUser.name)}&background=000000&color=ffffff&size=150`,
          followers: 0,
          following: 0,
          reputation: 0,
          badges: [],
          pollCount: 0,
          winRate: 0,
          joinDate: new Date()
        }

        user = await PollzAPI.createUser(newUser)
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user
      
      // Store user in localStorage
      localStorage.setItem('pollz-user', JSON.stringify(userWithoutPassword))
      
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      console.log('✅ Apple sign-in successful:', userWithoutPassword)
      return true
      
    } catch (error) {
      console.error('❌ Apple sign-in failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Apple sign-in failed'
      }))
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...authState,
    login,
    signUp,
    logout,
    updateUser,
    clearError,
    initializeAuth,
    signInWithGoogle,
    signInWithApple,
    isGoogleAvailable: oauthService.isGoogleAvailable(),
    isAppleAvailable: oauthService.isAppleAvailable()
  }
}
