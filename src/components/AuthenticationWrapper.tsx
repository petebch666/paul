import React, { useState } from 'react'
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

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthPage isAuthenticated={false} isLoading={true} error={null} onRetry={() => {}} onContinue={() => {}} />
  }

  // Show error state if authentication failed
  if (error && !isAuthenticated) {
    return (
      <AuthPage 
        isAuthenticated={false} 
        isLoading={false} 
        error={error} 
        onRetry={() => window.location.reload()} 
        onContinue={() => {}} 
      />
    )
  }

  // User is authenticated, show the app
  if (isAuthenticated && user) {
    return <>{children}</>
  }

  // User is not authenticated, show login/signup flow
  const { login, signUp } = useAuth()

  const handleLogin = async (user: any) => {
    // User is already logged in, component will re-render
  }

  const handleSignUp = async (user: any) => {
    // User is already signed up, component will re-render
  }

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
