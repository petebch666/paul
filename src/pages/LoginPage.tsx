import React, { useState } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react'
import { 
  mail, 
  lockClosed, 
  eye, 
  eyeOff,
  logIn,
  logoGoogle,
  logoApple
} from 'ionicons/icons'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

interface LoginPageProps {
  onNavigateToSignUp: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  onNavigateToSignUp
}) => {
  const { login, signInWithGoogle, signInWithApple, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields')
      }

      const success = await login(formData.email, formData.password)
      
      if (!success) {
        throw new Error('Login failed. Please check your credentials.')
      }
      
    } catch (err) {
      console.error('❌ Login failed:', err)
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      setError('Google Sign-In is not configured')
    }
  }

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple()
    } catch (error) {
      setError('Apple Sign-In is not configured')
    }
  }

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen className="login-page">
          <div className="loading-container">
            <IonSpinner name="crescent" color="dark" />
            <div>AUTHENTICATING...</div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonContent fullscreen className="login-page">
        <div className="login-container">
          {/* Header */}
          <div className="login-header">
            <h1>PAUL</h1>
            <p>WELCOME BACK</p>
          </div>

          {/* Login Form */}
          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Input */}
              <div className="input-group">
                <div className="input-wrapper">
                  <IonIcon icon={mail} className="input-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="EMAIL"
                    required
                    className="custom-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-group">
                <div className="input-wrapper">
                  <IonIcon icon={lockClosed} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="PASSWORD"
                    required
                    className="custom-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    <IonIcon icon={showPassword ? eyeOff : eye} />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.email || !formData.password}
              >
                <IonIcon icon={logIn} />
                SIGN IN
              </button>
            </form>

            {/* OAuth Divider */}
            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>

            {/* OAuth Buttons */}
            <div className="oauth-buttons">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn-oauth btn-google"
              >
                <IonIcon icon={logoGoogle} />
                GOOGLE
              </button>

              <button
                type="button"
                onClick={handleAppleSignIn}
                className="btn-oauth btn-apple"
              >
                <IonIcon icon={logoApple} />
                APPLE
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="signup-link">
              <span>DON'T HAVE AN ACCOUNT?</span>
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="link-button"
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default LoginPage
