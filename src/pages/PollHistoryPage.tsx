import React from 'react'
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
  IonIcon,
  IonChip,
  IonBadge,
  IonButton,
  IonSpinner
} from '@ionic/react'
import { 
  time, 
  thumbsUp, 
  heart, 
  share, 
  add,
  calendar
} from 'ionicons/icons'
import { PollHistory } from '../types'

interface PollHistoryPageProps {
  pollHistory: PollHistory[]
  loading: boolean
  onRefresh: () => void
}

const PollHistoryPage: React.FC<PollHistoryPageProps> = ({ 
  pollHistory, 
  loading, 
  onRefresh 
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return add
      case 'voted': return thumbsUp
      case 'liked': return heart
      case 'shared': return share
      default: return time
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'primary'
      case 'voted': return 'success'
      case 'liked': return 'danger'
      case 'shared': return 'warning'
      default: return 'medium'
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} minutes ago`
    } else if (hours < 24) {
      return `${hours} hours ago`
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>POLL HISTORY</IonTitle>
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
            LOADING HISTORY...
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>POLL HISTORY</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div className="page-header-minimal">
          <h1>YOUR POLL ACTIVITY</h1>
          <p>TRACK YOUR POLL INTERACTIONS</p>
        </div>

        {pollHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#666666'
          }}>
            NO ACTIVITY YET. START CREATING POLLS!
          </div>
        ) : (
          <div style={{ padding: '0 16px' }}>
            {pollHistory.map((history) => (
              <IonCard key={history.id} className="poll-card-minimal">
                <IonCardHeader>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <IonChip 
                      color={getActionColor(history.action)}
                      style={{ 
                        fontFamily: 'Courier New, Courier, monospace',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      <IonIcon icon={getActionIcon(history.action)} style={{ marginRight: '4px' }} />
                      {history.action.toUpperCase()}
                    </IonChip>
                    <IonBadge 
                      color="medium"
                      style={{ 
                        fontFamily: 'Courier New, Courier, monospace',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}
                    >
                      <IonIcon icon={calendar} style={{ marginRight: '4px' }} />
                      {formatDate(history.timestamp)}
                    </IonBadge>
                  </div>
                  <IonCardTitle style={{ 
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '14px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#000000',
                    marginBottom: '8px'
                  }}>
                    {history.pollTitle}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none" style={{ '--padding-start': '0', '--inner-padding-end': '0' }}>
                    <IonLabel>
                      <div style={{ 
                        fontFamily: 'Courier New, Courier, monospace',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#666666'
                      }}>
                        CATEGORY: {history.pollCategory}
                      </div>
                    </IonLabel>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          marginTop: '20px'
        }}>
          <IonButton 
            fill="outline" 
            color="primary"
            onClick={onRefresh}
            style={{ 
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            REFRESH HISTORY
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default PollHistoryPage
