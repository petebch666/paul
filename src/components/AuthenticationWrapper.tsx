import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../pages/LoginPage'
import SignUpPage from '../pages/SignUpPage'
import AuthPage from '../pages/AuthPage'

interface AuthenticationWrapperProps {
  children: React.ReactNode
}

type AuthPageType = 'login' | 'signup' | 'auth'

const AuthenticationWrapper: React.FC<AuthenticationWrapperProps> = ({ children }) => {
  const authState = useAuth()
  const { user, isAuthenticated, isLoading, error } = authState
  const [currentPage, setCurrentPage] = useState<AuthPageType>('auth')

  // Debug logging - track ALL auth state changes
  useEffect(() => {
    console.log('🔐 Auth State Changed:', { 
      isAuthenticated, 
      hasUser: !!user, 
      userName: user?.name,
      isLoading, 
      error,
      currentPage
    })
    
    // If authenticated, this should trigger app display
    if (isAuthenticated && user) {
      console.log('🎉 AUTHENTICATED! Should show app now')
      console.log('   - User:', user.name, user.email)
      console.log('   - Component will re-render with children')
    }
  }, [isAuthenticated, user, isLoading, error, currentPage])

  // Priority 1: User is authenticated - SHOW THE APP!
  if (isAuthenticated && user) {
    console.log('🚀 RENDERING APP - User is authenticated:', user.name)
    return <React.Fragment key={user.id}>{children}</React.Fragment>
  }

  // Priority 2: Show loading state while checking authentication
  if (isLoading) {
    console.log('⏳ Loading authentication...')
    return (
      <AuthPage 
        isAuthenticated={false} 
        isLoading={true} 
        error={null} 
        onRetry={() => {
          console.log('🔄 Manual retry requested')
          window.location.reload()
        }} 
        onContinue={() => setCurrentPage('login')} 
      />
    )
  }

  // Priority 3: Show error state if authentication failed
  if (error && !isAuthenticated) {
    console.log('❌ Authentication error:', error)
    return (
      <AuthPage 
        isAuthenticated={false} 
        isLoading={false} 
        error={error} 
        onRetry={() => {
          console.log('🔄 Manual retry requested')
          window.location.reload()
        }} 
        onContinue={() => setCurrentPage('login')} 
      />
    )
  }

  // Priority 4: User not authenticated, show login/signup
  console.log('ℹ️ User not authenticated, showing auth pages, currentPage:', currentPage)

  // User is not authenticated, show login/signup flow
  const handleNavigateToSignUp = () => {
    setCurrentPage('signup')
  }

  const handleNavigateToLogin = () => {
    setCurrentPage('login')
  }

  switch (currentPage) {
    case 'login':
      return (
        <LoginPage
          onNavigateToSignUp={handleNavigateToSignUp}
        />
      )
    
    case 'signup':
      return (
        <SignUpPage
          onNavigateToLogin={handleNavigateToLogin}
        />
      )
    
    default:
      return (
        <AuthPage 
          isAuthenticated={false} 
          isLoading={false} 
          error={null} 
          onRetry={() => window.location.reload()} 
          onContinue={() => setCurrentPage('login')} 
        />
      )
  }
}

export default AuthenticationWrapper
