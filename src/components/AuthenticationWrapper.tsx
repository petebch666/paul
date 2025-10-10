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
  const { user, isAuthenticated, isLoading, error } = useAuth()
  const [currentPage, setCurrentPage] = useState<AuthPageType>('auth')
  const [forceRender, setForceRender] = useState(0)

  // Debug logging
  useEffect(() => {
    console.log('🔐 Auth State:', { 
      isAuthenticated, 
      hasUser: !!user, 
      isLoading, 
      error,
      currentPage,
      forceRender
    })
  }, [isAuthenticated, user, isLoading, error, currentPage, forceRender])

  // Force re-render when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🎉 Authentication successful, forcing re-render...')
      setForceRender(prev => prev + 1)
    }
  }, [isAuthenticated, user])

  // Show loading state while checking authentication
  if (isLoading) {
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

  // Show error state if authentication failed
  if (error && !isAuthenticated) {
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

  // User is authenticated, show the app
  if (isAuthenticated && user) {
    console.log('✅ User authenticated, showing app')
    return <>{children}</>
  }

  console.log('ℹ️ User not authenticated, showing auth pages')

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
