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
  notifications, 
  notificationsOutline,
  time, 
  checkmarkCircle,
  calendar
} from 'ionicons/icons'
import { PollNotification } from '../types'

interface NotificationsPageProps {
  notifications: PollNotification[]
  loading: boolean
  onRefresh: () => void
  onMarkAsRead: (notificationId: string) => void
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  notifications, 
  loading, 
  onRefresh,
  onMarkAsRead
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'poll_expired': return time
      case 'poll_created': return notifications
      case 'poll_trending': return notificationsOutline
      default: return notifications
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'poll_expired': return 'warning'
      case 'poll_created': return 'success'
      case 'poll_trending': return 'primary'
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

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>NOTIFICATIONS</IonTitle>
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
            LOADING NOTIFICATIONS...
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            NOTIFICATIONS
            {unreadCount > 0 && (
              <IonBadge 
                color="danger" 
                style={{ 
                  marginLeft: '8px',
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '10px',
                  fontWeight: '700'
                }}
              >
                {unreadCount}
              </IonBadge>
            )}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div className="page-header-minimal">
          <h1>NOTIFICATIONS</h1>
          <p>STAY UPDATED ON YOUR POLLS</p>
        </div>

        {notifications.length === 0 ? (
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
            NO NOTIFICATIONS YET
          </div>
        ) : (
          <div style={{ padding: '0 16px' }}>
            {notifications.map((notification) => (
              <IonCard 
                key={notification.id} 
                className="poll-card-minimal"
                style={{ 
                  opacity: notification.isRead ? 0.7 : 1,
                  borderLeft: notification.isRead ? 'none' : '4px solid #ff0000'
                }}
              >
                <IonCardHeader>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <IonChip 
                      color={getNotificationColor(notification.type)}
                      style={{ 
                        fontFamily: 'Courier New, Courier, monospace',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      <IonIcon icon={getNotificationIcon(notification.type)} style={{ marginRight: '4px' }} />
                      {notification.type.replace('_', ' ').toUpperCase()}
                    </IonChip>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonBadge 
                        color="medium"
                        style={{ 
                          fontFamily: 'Courier New, Courier, monospace',
                          fontSize: '10px',
                          fontWeight: '700'
                        }}
                      >
                        <IonIcon icon={calendar} style={{ marginRight: '4px' }} />
                        {formatDate(notification.createdAt)}
                      </IonBadge>
                      {!notification.isRead && (
                        <IonIcon 
                          icon={checkmarkCircle} 
                          color="primary"
                          style={{ fontSize: '16px' }}
                          onClick={() => onMarkAsRead(notification.id)}
                        />
                      )}
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none" style={{ '--padding-start': '0', '--inner-padding-end': '0' }}>
                    <IonLabel>
                      <div style={{ 
                        fontFamily: 'Courier New, Courier, monospace',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        color: '#000000',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
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
            REFRESH NOTIFICATIONS
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default NotificationsPage
