import React, { useState, useEffect } from 'react'
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
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react'
import { 
  checkmarkCircle,
  closeCircle,
  refresh,
  warning
} from 'ionicons/icons'

interface AuthPageProps {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onContinue: () => void
}

const AuthPage: React.FC<AuthPageProps> = ({ 
  isAuthenticated, 
  isLoading, 
  error, 
  onRetry, 
  onContinue 
}) => {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setShowSuccess(true)
      // Auto-continue after 2 seconds
      const timer = setTimeout(() => {
        onContinue()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, onContinue])

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>AUTHENTICATION</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
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
            <IonSpinner name="crescent" color="dark" style={{ marginBottom: '20px' }} />
            VERIFYING AUTHENTICATION...
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (showSuccess && isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>SUCCESS</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
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
            <IonIcon 
              icon={checkmarkCircle} 
              style={{ 
                fontSize: '80px', 
                color: '#00ff00', 
                marginBottom: '20px' 
              }} 
            />
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div>AUTHENTICATION</div>
              <div>SUCCESSFUL</div>
            </div>
            <div style={{
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '12px',
              fontWeight: '700',
              color: '#666666',
              textAlign: 'center'
            }}>
              Redirecting to app...
            </div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>AUTHENTICATION</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div className="page-header-minimal">
            <h1>AUTHENTICATION ERROR</h1>
            <p>SOMETHING WENT WRONG</p>
          </div>

          <div style={{ padding: '0 16px' }}>
            <IonCard className="poll-card-minimal">
              <IonCardHeader>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <IonIcon 
                    icon={closeCircle} 
                    style={{ 
                      fontSize: '60px', 
                      color: '#ff0000', 
                      marginRight: '16px' 
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '18px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: '#ff0000'
                  }}>
                    AUTHENTICATION FAILED
                  </div>
                </div>
              </IonCardHeader>
              <IonCardContent>
                <div style={{
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#000000',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  {error}
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px'
                }}>
                  <IonButton 
                    expand="block"
                    color="primary"
                    onClick={onRetry}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '14px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    <IonIcon icon={refresh} style={{ marginRight: '8px' }} />
                    RETRY AUTHENTICATION
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AUTHENTICATION</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
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
          <IonIcon 
            icon={warning} 
            style={{ 
              fontSize: '60px', 
              color: '#ffaa00', 
              marginBottom: '20px' 
            }} 
          />
          <div style={{ textAlign: 'center' }}>
            <div>WAITING FOR</div>
            <div>AUTHENTICATION</div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AuthPage
