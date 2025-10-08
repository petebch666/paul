import React, { useState } from 'react'
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonAlert,
  IonSpinner
} from '@ionic/react'
import { 
  mail, 
  lockClosed, 
  eye, 
  eyeOff,
  person,
  checkmarkCircle,
  arrowBack
} from 'ionicons/icons'
import { useAuth } from '../hooks/useAuth'

interface SignUpPageProps {
  onNavigateToLogin: () => void
}

const SignUpPage: React.FC<SignUpPageProps> = ({ 
  onNavigateToLogin
}) => {
  const { signUp, signInWithGoogle, signInWithApple, isLoading, isGoogleAvailable, isAppleAvailable } = useAuth()
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long'
    }

    if (!formData.email.includes('@')) {
      return 'Please enter a valid email address'
    }

    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters long'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Validate form
      const validationError = validateForm()
      if (validationError) {
        throw new Error(validationError)
      }

      const success = await signUp({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      })

      if (!success) {
        throw new Error('Sign up failed. Please try again.')
      }
      
    } catch (err) {
      console.error('❌ Sign up failed:', err)
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple()
    } catch (error) {
      console.error('Apple sign-in error:', error)
    }
  }

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>SIGN UP</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#000000'
          }}>
            <IonSpinner name="crescent" color="dark" style={{ marginRight: '10px' }} />
            CREATING ACCOUNT...
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>SIGN UP</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div className="page-header-minimal">
          <h1>JOIN POLLZ</h1>
          <p>CREATE YOUR ACCOUNT TO START POLLING</p>
        </div>

        <div style={{ padding: '0 16px' }}>
          <IonCard className="poll-card-minimal">
            <IonCardHeader>
              <IonCardTitle style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '18px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#000000',
                textAlign: 'center'
              }}>
                CREATE ACCOUNT
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonIcon 
                    icon={person} 
                    slot="start" 
                    style={{ color: '#000000', marginRight: '8px' }}
                  />
                  <IonLabel position="stacked">FULL NAME</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.name}
                    onIonInput={(e) => handleInputChange('name', e.detail.value!)}
                    placeholder="John Doe"
                    required
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  />
                </IonItem>

                <IonItem>
                  <IonIcon 
                    icon={person} 
                    slot="start" 
                    style={{ color: '#000000', marginRight: '8px' }}
                  />
                  <IonLabel position="stacked">USERNAME</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.username}
                    onIonInput={(e) => handleInputChange('username', e.detail.value!)}
                    placeholder="johndoe"
                    required
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  />
                </IonItem>

                <IonItem>
                  <IonIcon 
                    icon={mail} 
                    slot="start" 
                    style={{ color: '#000000', marginRight: '8px' }}
                  />
                  <IonLabel position="stacked">EMAIL</IonLabel>
                  <IonInput
                    type="email"
                    value={formData.email}
                    onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                    placeholder="john@example.com"
                    required
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  />
                </IonItem>

                <IonItem>
                  <IonIcon 
                    icon={lockClosed} 
                    slot="start" 
                    style={{ color: '#000000', marginRight: '8px' }}
                  />
                  <IonLabel position="stacked">PASSWORD</IonLabel>
                  <IonInput
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onIonInput={(e) => handleInputChange('password', e.detail.value!)}
                    placeholder="Minimum 6 characters"
                    required
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  />
                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#000000'
                    }}
                  >
                    <IonIcon icon={showPassword ? eyeOff : eye} />
                  </IonButton>
                </IonItem>

                <IonItem>
                  <IonIcon 
                    icon={lockClosed} 
                    slot="start" 
                    style={{ color: '#000000', marginRight: '8px' }}
                  />
                  <IonLabel position="stacked">CONFIRM PASSWORD</IonLabel>
                  <IonInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onIonInput={(e) => handleInputChange('confirmPassword', e.detail.value!)}
                    placeholder="Confirm your password"
                    required
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  />
                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#000000'
                    }}
                  >
                    <IonIcon icon={showConfirmPassword ? eyeOff : eye} />
                  </IonButton>
                </IonItem>

                {error && (
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    margin: '16px 0',
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '2px solid #000000'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  marginTop: '24px'
                }}>
                  <IonButton 
                    expand="block" 
                    type="submit"
                    color="primary"
                    disabled={!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    <IonIcon icon={checkmarkCircle} style={{ marginRight: '8px' }} />
                    CREATE ACCOUNT
                  </IonButton>

                  <IonButton 
                    expand="block" 
                    fill="outline"
                    color="primary"
                    onClick={onNavigateToLogin}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    <IonIcon icon={arrowBack} style={{ marginRight: '8px' }} />
                    BACK TO LOGIN
                  </IonButton>
                </div>
              </form>

              {/* OAuth Divider */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: '24px 0 16px 0' 
              }}>
                <div style={{ 
                  flex: 1, 
                  height: '2px', 
                  backgroundColor: '#000000' 
                }}></div>
                <div style={{ 
                  padding: '0 16px',
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  OR CONTINUE WITH
                </div>
                <div style={{ 
                  flex: 1, 
                  height: '2px', 
                  backgroundColor: '#000000' 
                }}></div>
              </div>

              {/* OAuth Buttons */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px'
              }}>
                {isGoogleAvailable && (
                  <IonButton 
                    expand="block" 
                    fill="outline"
                    color="medium"
                    onClick={handleGoogleSignIn}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      border: '2px solid #000000'
                    }}
                  >
                    <IonIcon icon="logo-google" style={{ marginRight: '8px' }} />
                    SIGN UP WITH GOOGLE
                  </IonButton>
                )}

                {isAppleAvailable && (
                  <IonButton 
                    expand="block" 
                    fill="solid"
                    color="dark"
                    onClick={handleAppleSignIn}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      backgroundColor: '#000000',
                      color: '#ffffff'
                    }}
                  >
                    <IonIcon icon="logo-apple" style={{ marginRight: '8px' }} />
                    SIGN UP WITH APPLE
                  </IonButton>
                )}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Terms and Privacy */}
          <IonCard className="poll-card-minimal" style={{ marginTop: '16px' }}>
            <IonCardContent>
              <div style={{
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '10px',
                fontWeight: '700',
                color: '#666666',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
                We respect your privacy and will never share your data with third parties.
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SignUpPage
