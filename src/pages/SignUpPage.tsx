import React, { useState } from 'react'
import { 
  IonPage, 
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/react'
import { 
  person,
  at,
  mail, 
  lockClosed, 
  eye, 
  eyeOff,
  personAdd,
  logoGoogle,
  logoApple
} from 'ionicons/icons'
import { useAuth } from '../hooks/useAuth'
import './SignUpPage.css'

interface SignUpPageProps {
  onNavigateToLogin: () => void
}

const SignUpPage: React.FC<SignUpPageProps> = ({ 
  onNavigateToLogin
}) => {
  const { signUp, signInWithGoogle, signInWithApple, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    setSuccess(false)

    try {
      console.log('📝 Starting sign up process...')
      console.log('👤 Name:', formData.name)
      console.log('🆔 Username:', formData.username)
      console.log('📧 Email:', formData.email)
      
      // Validate all fields
      if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields')
      }

      // Check password match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      console.log('⏳ Calling signUp function...')
      const signUpSuccess = await signUp({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      console.log('📬 Sign up result:', signUpSuccess)
      
      if (!signUpSuccess) {
        throw new Error('Sign up failed. Please try again.')
      }
      
      console.log('✅ Sign up successful! Setting success state...')
      setSuccess(true)
      
      // Give user feedback before navigation
      console.log('🎉 Waiting for authentication to complete...')
      
      // Fallback: If UI doesn't update within 1 second, force reload
      setTimeout(() => {
        console.log('⚠️ Forcing page reload to show app...')
        window.location.reload()
      }, 1000)
      
    } catch (err) {
      console.error('❌ Sign up failed:', err)
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
      setSuccess(false)
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
        <IonContent fullscreen className="signup-page">
          <div className="loading-container">
            <IonSpinner name="crescent" color="dark" />
            <div>CREATING ACCOUNT...</div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonContent fullscreen className="signup-page">
        <div className="signup-container">
          {/* Header */}
          <div className="signup-header">
            <h1>PAUL</h1>
            <p>CREATE YOUR ACCOUNT</p>
          </div>

          {/* Sign Up Form */}
          <div className="signup-form-container">
            <form onSubmit={handleSubmit} className="signup-form">
              {/* Name Input */}
              <div className="input-group">
                <div className="input-wrapper">
                  <IonIcon icon={person} className="input-icon" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="FULL NAME"
                    required
                    className="custom-input"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="input-group">
                <div className="input-wrapper">
                  <IonIcon icon={at} className="input-icon" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="USERNAME"
                    required
                    className="custom-input"
                  />
                </div>
              </div>

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

              {/* Confirm Password Input */}
              <div className="input-group">
                <div className="input-wrapper">
                  <IonIcon icon={lockClosed} className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="CONFIRM PASSWORD"
                    required
                    className="custom-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    <IonIcon icon={showConfirmPassword ? eyeOff : eye} />
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '16px',
                  background: '#00ff00',
                  color: '#000000',
                  border: '2px solid #000000',
                  fontFamily: 'Courier New, Courier, monospace',
                  fontWeight: '700',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '12px'
                }}>
                  ✅ ACCOUNT CREATED SUCCESSFULLY!
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Password Requirements */}
              <div className="password-requirements">
                <div className="requirement-title">PASSWORD REQUIREMENTS:</div>
                <div className="requirement-item">• MINIMUM 8 CHARACTERS</div>
                <div className="requirement-item">• 1 UPPERCASE, 1 LOWERCASE</div>
                <div className="requirement-item">• 1 NUMBER, 1 SPECIAL CHAR</div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
              >
                <IonIcon icon={personAdd} />
                CREATE ACCOUNT
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

            {/* Login Link */}
            <div className="login-link">
              <span>ALREADY HAVE AN ACCOUNT?</span>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="link-button"
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SignUpPage
