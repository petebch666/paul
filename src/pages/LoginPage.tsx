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
  logIn,
  personAdd
} from 'ionicons/icons'
import { useAuth } from '../hooks/useAuth'

interface LoginPageProps {
  onNavigateToSignUp: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  onNavigateToSignUp
}) => {
  const { login, signInWithGoogle, signInWithApple, isLoading, isGoogleAvailable, isAppleAvailable } = useAuth()
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
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Validate input
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
            <IonTitle>LOGIN</IonTitle>
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
            AUTHENTICATING...
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>LOGIN</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div className="page-header-minimal">
          <h1>WELCOME BACK</h1>
          <p>ENTER YOUR CREDENTIALS TO CONTINUE</p>
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
                SIGN IN
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
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
                    placeholder="your@email.com"
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
                    placeholder="Enter your password"
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
                    disabled={!formData.email || !formData.password}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    <IonIcon icon={logIn} style={{ marginRight: '8px' }} />
                    SIGN IN
                  </IonButton>

                  <IonButton 
                    expand="block" 
                    fill="outline"
                    color="primary"
                    onClick={onNavigateToSignUp}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    <IonIcon icon={personAdd} style={{ marginRight: '8px' }} />
                    CREATE ACCOUNT
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
                    SIGN IN WITH GOOGLE
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
                    SIGN IN WITH APPLE
                  </IonButton>
                )}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Demo Credentials */}
          <IonCard className="poll-card-minimal" style={{ marginTop: '16px' }}>
            <IonCardHeader>
              <IonCardTitle style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#666666',
                textAlign: 'center'
              }}>
                DEMO CREDENTIALS
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '12px',
                fontWeight: '700',
                color: '#666666',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                <div><strong>Email:</strong> alex@example.com</div>
                <div><strong>Password:</strong> password123</div>
                <div style={{ marginTop: '8px', fontSize: '10px' }}>
                  Click "Sign In" after filling these credentials
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default LoginPage
