import React, { useState, useRef } from 'react'
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
  IonChip,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAvatar,
  IonItem,
  IonList,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react'
import { medal, flag, trophy, star, add, people, chevronDownCircleOutline, logOut } from 'ionicons/icons'
import { User, Badge, Poll } from '../types'
import PollCarousel from '../components/PollCarousel'
import SecurityBadge from '../components/SecurityBadge'

interface ProfilePageProps {
  user: User | null
  polls: Poll[]
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
  onNavigateToNotifications: () => void
  onNavigateToHistory: () => void
  onLogout?: () => void
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, 
  polls, 
  onVote, 
  onLike, 
  onNavigateToNotifications, 
  onNavigateToHistory,
  onLogout
}) => {
  const contentRef = useRef<HTMLIonContentElement>(null)
  const [activeTab, setActiveTab] = useState<'polls' | 'badges' | 'stats'>('polls')

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    console.log('🔄 Refreshing profile...')
    // In a real app, this would reload user data
    setTimeout(() => {
      event.detail.complete()
    }, 1000)
  }
  
  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Loading profile...</p>
          </div>
        </IonContent>
      </IonPage>
    )
  }
  
  const userPolls = polls.filter(poll => poll.authorId === user.id || poll.author === user.name)
  
  const badgeIcons: { [key: string]: string } = {
    Crown: medal,
    Target: flag,
    Trophy: trophy,
    Star: star,
    Plus: add,
    Users: people
  }

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 5000) return { level: 'Legendary', color: '#ff0000' }
    if (reputation >= 2000) return { level: 'Master', color: '#800080' }
    if (reputation >= 1000) return { level: 'Expert', color: '#0000ff' }
    if (reputation >= 500) return { level: 'Advanced', color: '#008000' }
    if (reputation >= 100) return { level: 'Intermediate', color: '#ffa500' }
    return { level: 'Beginner', color: '#808080' }
  }

  const reputationLevel = getReputationLevel(user.reputation)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent ref={contentRef} fullscreen>
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing profile..."
          />
        </IonRefresher>

        <div className="page-header-minimal">
          <h1>PROFILE</h1>
          <p>YOUR DEBATE JOURNEY</p>
        </div>

        <IonCard style={{ margin: '16px' }}>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <IonAvatar style={{ width: '80px', height: '80px', marginRight: '16px' }}>
                <img src={user.avatar} alt={user.name} />
              </IonAvatar>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: 0,
                  fontFamily: 'Courier New, Courier, monospace',
                  fontWeight: '700',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {user.name}
                </h2>
                <p style={{ 
                  margin: '4px 0',
                  fontSize: '10px',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Joined {user.joinDate.toLocaleDateString()}
                </p>
                <IonChip color="warning" style={{ marginTop: '8px' }}>
                  <IonIcon icon={trophy} />
                  <IonLabel style={{ color: reputationLevel.color }}>
                {reputationLevel.level}
                  </IonLabel>
                </IonChip>
            </div>
          </div>
          
            <IonGrid>
              <IonRow>
                <IonCol size="3" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Courier New, Courier, monospace', color: '#000000' }}>{user.pollCount}</div>
                  <div style={{ fontSize: '9px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px' }}>Polls</div>
                </IonCol>
                <IonCol size="3" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Courier New, Courier, monospace', color: '#ff0000' }}>{Math.round(user.winRate * 100)}%</div>
                  <div style={{ fontSize: '9px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px' }}>Win Rate</div>
                </IonCol>
                <IonCol size="3" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Courier New, Courier, monospace', color: '#000000' }}>{user.reputation}</div>
                  <div style={{ fontSize: '9px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px' }}>Reputation</div>
                </IonCol>
                <IonCol size="3" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Courier New, Courier, monospace', color: '#000000' }}>{user.followers}</div>
                  <div style={{ fontSize: '9px', color: '#666666', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonSegment 
          value={activeTab} 
          onIonChange={e => setActiveTab(e.detail.value as any)}
          style={{ margin: '0 16px 16px' }}
        >
          <IonSegmentButton value="polls">
            <IonLabel>Polls ({userPolls.length})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="badges">
            <IonLabel>Badges ({user.badges.length})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="stats">
            <IonLabel>Stats</IonLabel>
          </IonSegmentButton>
        </IonSegment>

          {activeTab === 'polls' && (
            <>
              {userPolls.length > 0 ? (
                <PollCarousel
                  polls={userPolls}
                  user={user}
                  onVote={onVote}
                  onLike={onLike}
                  contentRef={contentRef}
                />
              ) : (
                <div style={{ padding: '20px 16px' }}>
                  <IonCard>
                    <IonCardContent style={{ textAlign: 'center', padding: '32px' }}>
                      <p>No polls created yet. Start a debate!</p>
                    </IonCardContent>
                  </IonCard>
                </div>
              )}
            </>
          )}

          {activeTab === 'badges' && (
          <div style={{ padding: '0 16px' }}>
            <IonList>
                {user.badges.map(badge => (
                <IonItem key={badge.id}>
                  <IonIcon 
                    icon={badgeIcons[badge.icon] || star} 
                    slot="start"
                    color={badge.rarity === 'legendary' ? 'warning' : badge.rarity === 'epic' ? 'primary' : 'medium'}
                  />
                  <IonLabel>
                    <h2>{badge.name}</h2>
                    <p>{badge.description}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                        Earned {badge.earnedAt.toLocaleDateString()}
                    </p>
                  </IonLabel>
                  <IonChip color={badge.rarity === 'legendary' ? 'warning' : badge.rarity === 'epic' ? 'primary' : 'medium'} slot="end">
                    {badge.rarity}
                  </IonChip>
                </IonItem>
              ))}
            </IonList>
            </div>
          )}

          {activeTab === 'stats' && (
          <div style={{ padding: '0 16px' }}>
            {/* Security Badge - Development only */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginBottom: '20px' }}>
                <SecurityBadge variant="detailed" />
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="primary"
                onClick={onNavigateToNotifications}
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flex: 1,
                  minWidth: '140px'
                }}
              >
                <IonIcon icon={add} style={{ marginRight: '8px' }} />
                NOTIFICATIONS
              </IonButton>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="secondary"
                onClick={onNavigateToHistory}
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flex: 1,
                  minWidth: '140px'
                }}
              >
                <IonIcon icon={people} style={{ marginRight: '8px' }} />
                POLL HISTORY
              </IonButton>
                </div>

                {onLogout && (
                  <IonButton 
                    expand="block" 
                    fill="outline" 
                    color="danger"
                    onClick={onLogout}
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginTop: '12px'
                    }}
                  >
                    <IonIcon icon={logOut} style={{ marginRight: '8px' }} />
                    LOGOUT
                  </IonButton>
                )}

            <IonCard style={{ marginBottom: '16px' }}>
              <IonCardHeader>
                <IonCardTitle>Debate Performance</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Total Debates</IonLabel>
                    <IonBadge slot="end" color="primary">
                      {userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.totalDebates || 0), 0)}
                    </IonBadge>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Wins</IonLabel>
                    <IonBadge slot="end" color="success">
                      {userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.creatorWins || 0), 0)}
                    </IonBadge>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Losses</IonLabel>
                    <IonBadge slot="end" color="danger">
                      {userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.opponentWins || 0), 0)}
                    </IonBadge>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard style={{ marginBottom: '16px' }}>
              <IonCardHeader>
                <IonCardTitle>Engagement</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Total Votes Received</IonLabel>
                    <IonBadge slot="end" color="primary">
                      {userPolls.reduce((sum, poll) => sum + poll.votes, 0)}
                    </IonBadge>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Average Votes per Poll</IonLabel>
                    <IonBadge slot="end" color="medium">
                      {userPolls.length > 0 ? Math.round(userPolls.reduce((sum, poll) => sum + poll.votes, 0) / userPolls.length) : 0}
                    </IonBadge>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Community</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Followers</IonLabel>
                    <IonBadge slot="end" color="primary">{user.followers}</IonBadge>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Following</IonLabel>
                    <IonBadge slot="end" color="medium">{user.following}</IonBadge>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Reputation Level</IonLabel>
                    <IonChip slot="end" color="warning">
                      <IonLabel style={{ color: reputationLevel.color }}>
                        {reputationLevel.level}
                      </IonLabel>
                    </IonChip>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
            </div>
          )}
      </IonContent>
    </IonPage>
  )
}

export default ProfilePage

