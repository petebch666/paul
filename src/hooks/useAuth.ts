import { useState, useEffect, useCallback } from 'react'
import { User } from '../types'
import UnifiedPollzAPI from '../database/unified-api'
import { storage } from '../utils/storage'

const PollzAPI = UnifiedPollzAPI
import { 
  hashPassword, 
  comparePassword, 
  validatePassword,
  validateEmail,
  validateUsername,
  validateName,
  checkRateLimit,
  resetRateLimit,
  sanitizeInput
} from '../utils/security'

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
  
  const [initialized, setInitialized] = useState(false)

  // Initialize authentication on mount (only once)
  useEffect(() => {
    if (initialized) {
      console.log('⏭️ Skipping init - already initialized')
      return
    }
    
    console.log('🔄 Running auth initialization...')
    
    const init = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
        
        // Check if user is stored in AsyncStorage
        const storedUser = await storage.getItem('paul-user')
        console.log('📦 Stored user:', storedUser ? 'Found' : 'Not found')
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            console.log('👤 Parsed user:', user.name, user.email)
            
            // Verify user still exists in database
            const dbUser = await PollzAPI.getUserById(user.id)
            
            if (dbUser) {
              console.log('✅ User verified in database')
              setAuthState({
                user: dbUser,
                isAuthenticated: true,
                isLoading: false,
                error: null
              })
              console.log('✅ User authenticated from storage:', dbUser.name)
              setInitialized(true)
              return
            } else {
              // User no longer exists in database, clear storage
              await storage.removeItem('paul-user')
              console.log('⚠️ User not found in database, cleared storage')
            }
          } catch (error) {
            console.error('❌ Error parsing stored user:', error)
            await storage.removeItem('paul-user')
          }
        }

        // No valid user found
        console.log('ℹ️ No authenticated user found, showing login')
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        setInitialized(true)
        
      } catch (error) {
        console.error('❌ Authentication initialization failed:', error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication'
        })
        setInitialized(true)
      }
    }

    init()
  }, [initialized])

  // Initialize OAuth services
  const initializeOAuth = useCallback(async () => {
    try {
      // Set client IDs from environment variables (if available)
      const googleClientId = (import.meta as any).supaenv?.VITE_GOOGLE_CLIENT_ID
      const appleClientId = (import.meta as any).supaenv?.VITE_APPLE_CLIENT_ID

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


  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Validate and sanitize email
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email')
      }

      // Check rate limiting (5 attempts per 15 minutes)
      const rateLimit = checkRateLimit(emailValidation.sanitized, 5, 15 * 60 * 1000)
      if (rateLimit.isLimited) {
        const minutesLeft = Math.ceil((rateLimit.resetIn || 0) / 60000)
        throw new Error(`Too many login attempts. Please try again in ${minutesLeft} minutes.`)
      }

      // Find user by sanitized email
      const user = await PollzAPI.getUserByEmail(emailValidation.sanitized)
      
      if (!user) {
        throw new Error('User not found. Please check your email or sign up.')
      }

      // Validate password with hash comparison
      if (!user.password) {
        throw new Error('Account error. Please contact support.')
      }

      const isPasswordValid = await comparePassword(password, user.password)
      if (!isPasswordValid) {
        throw new Error('Invalid password. Please try again.')
      }

      // Reset rate limit on successful login
      resetRateLimit(emailValidation.sanitized)

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user
      
      console.log('💾 Storing user in AsyncStorage...')
      // Store user in AsyncStorage
      await storage.setItem('paul-user', JSON.stringify(userWithoutPassword))
      
      // Verify storage
      const stored = await storage.getItem('paul-user')
      console.log('✅ User stored:', stored ? 'Success' : 'Failed')
      
      console.log('🔐 Setting auth state...')
      // Use React state update with callback to ensure state is set properly
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      // Mark as initialized
      setInitialized(true)

      console.log('✅ Login successful:', userWithoutPassword.name, userWithoutPassword.email)
      console.log('🎉 Auth state updated - isAuthenticated: true, user:', userWithoutPassword.name)
      
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100))
      
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

      // Validate and sanitize all inputs
      const nameValidation = validateName(userData.name)
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error || 'Invalid name')
      }

      const usernameValidation = validateUsername(userData.username)
      if (!usernameValidation.isValid) {
        throw new Error(usernameValidation.error || 'Invalid username')
      }

      const emailValidation = validateEmail(userData.email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email')
      }

      const passwordValidation = validatePassword(userData.password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error || 'Invalid password')
      }

      // Check if user already exists
      const existingUser = await PollzAPI.getUserByEmail(emailValidation.sanitized)
      if (existingUser) {
        throw new Error('User with this email already exists. Please login instead.')
      }

      // Generate unique ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Hash password
      const hashedPassword = await hashPassword(userData.password)

      // Create new user with sanitized data
      const newUser = {
        id: userId,
        name: nameValidation.sanitized,
        username: usernameValidation.sanitized.startsWith('@') ? usernameValidation.sanitized : `@${usernameValidation.sanitized}`,
        email: emailValidation.sanitized,
        password: hashedPassword,
        role: 'user' as const, // Default role
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameValidation.sanitized)}&background=000000&color=ffffff&size=150`,
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
      
      console.log('💾 Storing new user in AsyncStorage...')
      // Store user in AsyncStorage
      await storage.setItem('paul-user', JSON.stringify(userWithoutPassword))
      
      // Verify storage
      const stored = await storage.getItem('paul-user')
      console.log('✅ User stored:', stored ? 'Success' : 'Failed')
      
      console.log('🔐 Setting auth state for new user...')
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      // Mark as initialized
      setInitialized(true)

      console.log('✅ Sign up successful:', userWithoutPassword.name, userWithoutPassword.email)
      console.log('🎉 Auth state updated - isAuthenticated: true, user:', userWithoutPassword.name)
      
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100))
      
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

  const logout = useCallback(async () => {
    // Clear user from AsyncStorage
    await storage.removeItem('paul-user')
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })

    console.log('✅ User logged out')
  }, [])

  const updateUser = useCallback(async (updatedUser: User) => {
    // Update user in AsyncStorage
    await storage.setItem('paul-user', JSON.stringify(updatedUser))
    
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
      
      // Store user in AsyncStorage
      await storage.setItem('paul-user', JSON.stringify(userWithoutPassword))
      
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
      
      // Store user in AsyncStorage
      await storage.setItem('paul-user', JSON.stringify(userWithoutPassword))
      
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
    signInWithGoogle,
    signInWithApple,
    isGoogleAvailable: oauthService.isGoogleAvailable(),
    isAppleAvailable: oauthService.isAppleAvailable()
  }
}
