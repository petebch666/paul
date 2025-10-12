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
  IonRefresherContent,
  IonModal
} from '@ionic/react'
import { medal, flag, trophy, star, add, people, chevronDownCircleOutline, logOut, shieldCheckmark, chatbubbles, ribbonOutline, statsChartOutline, shield, trendingUp, heart, chatbox, checkmarkCircle, closeCircle, eyeOutline, thumbsUp, personAdd } from 'ionicons/icons'
import { User, Badge, Poll } from '../types'
import PollCarousel from '../components/PollCarousel'

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
  const [showSecurityModal, setShowSecurityModal] = useState(false)

  const securityFeatures = [
    '🔐 Password Hashing (bcrypt)',
    '🛡️ Input Validation',
    '🚫 XSS Protection',
    '⏱️ Rate Limiting',
    '🎯 CSRF Protection',
    '📋 Security Headers (CSP)'
  ]

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
      
      <IonContent 
        ref={contentRef} 
        fullscreen
        scrollEvents={true}
        className="carousel-scroll"
      >
        {/* Pull to Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing profile..."
          />
        </IonRefresher>

        <style>{`
          /* Carousel scroll behavior */
          .carousel-scroll {
            scroll-behavior: smooth;
          }

          .carousel-scroll::part(scroll) {
            scroll-snap-type: y mandatory;
            scroll-padding: 50vh;
          }
        `}</style>

        <IonCard style={{ margin: '16px', position: 'relative' }}>
          <IonCardContent>
            {/* Security Shield Icon */}
            <div 
              onClick={() => setShowSecurityModal(true)}
              style={{ 
                position: 'absolute',
                top: '16px',
                right: '16px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <IonIcon 
                icon={shieldCheckmark} 
                style={{ 
                  fontSize: '32px',
                  color: '#00aa00',
                  filter: 'drop-shadow(0 0 3px rgba(0, 170, 0, 0.3))'
                }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <IonAvatar style={{ width: '80px', height: '80px', marginRight: '16px' }}>
                <img src={user.avatar} alt={user.name} />
              </IonAvatar>
              <div style={{ flex: 1, paddingRight: '40px' }}>
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

        {/* Tab Selector with Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 16px 12px',
          gap: '24px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderBottom: '1px solid #e9ecef'
        }}>
          <button
            onClick={() => setActiveTab('polls')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'polls' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'polls' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeTab === 'polls' ? '0 2px 8px rgba(102, 126, 234, 0.15)' : 'none'
            }}
          >
            <IonIcon 
              icon={chatbubbles} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'polls' ? '#667eea' : '#666666'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'polls' ? '#667eea' : '#666666'
            }}>
              Polls ({userPolls.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'badges' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'badges' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeTab === 'badges' ? '0 2px 8px rgba(255, 107, 107, 0.15)' : 'none'
            }}
          >
            <IonIcon 
              icon={ribbonOutline} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'badges' ? '#ff6b6b' : '#666666'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'badges' ? '#ff6b6b' : '#666666'
            }}>
              Badges ({user.badges.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'stats' ? '#ffffff' : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'stats' ? 'scale(1.05)' : 'scale(1)',
              minWidth: '70px',
              boxShadow: activeTab === 'stats' ? '0 2px 8px rgba(46, 213, 115, 0.15)' : 'none'
            }}
          >
            <IonIcon 
              icon={statsChartOutline} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'stats' ? '#2ed573' : '#666666'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'stats' ? '#2ed573' : '#666666'
            }}>
              Stats
            </span>
          </button>
        </div>

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
          <div style={{ padding: '16px' }}>
            {/* Performance Overview - Hero Stats */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <IonIcon 
                  icon={trophy} 
                  style={{ 
                    fontSize: '32px', 
                    color: '#ffd700'
                  }} 
                />
                <div>
                  <h3 style={{
                    margin: 0,
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Debate Performance
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase'
                  }}>
                    Your competitive stats
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                {/* Total Debates */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IonIcon 
                    icon={chatbubbles} 
                    style={{ 
                      fontSize: '28px', 
                      color: '#ffffff',
                      marginBottom: '8px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.totalDebates || 0), 0)}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Total Debates
                  </div>
                </div>

                {/* Wins */}
                <div style={{
                  background: 'rgba(46, 213, 115, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(46, 213, 115, 0.4)'
                }}>
                  <IonIcon 
                    icon={checkmarkCircle} 
                    style={{ 
                      fontSize: '28px', 
                      color: '#2ed573',
                      marginBottom: '8px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.creatorWins || 0), 0)}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '9px',
                    color: '#2ed573',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '700'
                  }}>
                    Wins
                  </div>
                </div>

                {/* Losses */}
                <div style={{
                  background: 'rgba(255, 107, 107, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 107, 107, 0.4)'
                }}>
                  <IonIcon 
                    icon={closeCircle} 
                    style={{ 
                      fontSize: '28px', 
                      color: '#ff6b6b',
                      marginBottom: '8px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {userPolls.reduce((sum, poll) => sum + (poll.debateHistory?.opponentWins || 0), 0)}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '9px',
                    color: '#ff6b6b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '700'
                  }}>
                    Losses
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <IonIcon 
                  icon={trendingUp} 
                  style={{ 
                    fontSize: '32px', 
                    color: '#ffffff'
                  }} 
                />
                <div>
                  <h3 style={{
                    margin: 0,
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Engagement
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase'
                  }}>
                    How people interact with your polls
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                {/* Total Votes */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IonIcon 
                    icon={thumbsUp} 
                    style={{ 
                      fontSize: '32px', 
                      color: '#ffffff',
                      marginBottom: '12px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {userPolls.reduce((sum, poll) => sum + poll.votes, 0)}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Total Votes Received
                  </div>
                </div>

                {/* Average Votes */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IonIcon 
                    icon={statsChartOutline} 
                    style={{ 
                      fontSize: '32px', 
                      color: '#ffffff',
                      marginBottom: '12px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {userPolls.length > 0 ? Math.round(userPolls.reduce((sum, poll) => sum + poll.votes, 0) / userPolls.length) : 0}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Avg Votes per Poll
                  </div>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div style={{
              background: 'linear-gradient(135deg, #2ed573 0%, #1abc9c 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(46, 213, 115, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <IonIcon 
                  icon={people} 
                  style={{ 
                    fontSize: '32px', 
                    color: '#ffffff'
                  }} 
                />
                <div>
                  <h3 style={{
                    margin: 0,
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Community
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase'
                  }}>
                    Your network & influence
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                {/* Followers */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IonIcon 
                    icon={personAdd} 
                    style={{ 
                      fontSize: '28px', 
                      color: '#ffffff',
                      marginBottom: '12px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {user.followers}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Followers
                  </div>
                </div>

                {/* Following */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <IonIcon 
                    icon={eyeOutline} 
                    style={{ 
                      fontSize: '28px', 
                      color: '#ffffff',
                      marginBottom: '12px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {user.following}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Following
                  </div>
                </div>

                {/* Reputation */}
                <div style={{
                  background: 'rgba(255, 215, 0, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 215, 0, 0.4)'
                }}>
                  <IonIcon 
                    icon={star} 
                    style={{ 
                      fontSize: '28px', 
                      color: '#ffd700',
                      marginBottom: '12px'
                    }} 
                  />
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {user.reputation}
                  </div>
                  <div style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '9px',
                    color: '#ffd700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '700'
                  }}>
                    {reputationLevel.level}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <IonButton 
                expand="block" 
                fill="solid" 
                color="primary"
                onClick={onNavigateToNotifications}
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flex: 1,
                  minWidth: '140px',
                  '--box-shadow': '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <IonIcon icon={chatbox} style={{ marginRight: '8px' }} />
                NOTIFICATIONS
              </IonButton>
              <IonButton 
                expand="block" 
                fill="solid" 
                color="secondary"
                onClick={onNavigateToHistory}
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flex: 1,
                  minWidth: '140px',
                  '--box-shadow': '0 4px 12px rgba(95, 39, 205, 0.3)'
                }}
              >
                <IonIcon icon={eyeOutline} style={{ marginRight: '8px' }} />
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
                  letterSpacing: '1px'
                }}
              >
                <IonIcon icon={logOut} style={{ marginRight: '8px' }} />
                LOGOUT
              </IonButton>
            )}
            </div>
          )}

        {/* Security Modal */}
        <IonModal 
          isOpen={showSecurityModal} 
          onDidDismiss={() => setShowSecurityModal(false)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75, 1]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle style={{
                fontFamily: 'Courier New, Courier, monospace',
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                <IonIcon icon={shield} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Security Information
              </IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowSecurityModal(false)}>
                Close
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '20px' }}>
              <div style={{
                background: '#f0f0f0',
                border: '2px solid #00aa00',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <IonIcon 
                    icon={shieldCheckmark} 
                    style={{ 
                      fontSize: '32px', 
                      color: '#00aa00' 
                    }} 
                  />
                  <div>
                    <div style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#000'
                    }}>
                      SECURE CONNECTION
                    </div>
                    <div style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#666'
                    }}>
                      All security features active
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  {securityFeatures.map((feature, index) => (
                    <div key={index} style={{
                      fontFamily: 'Courier New, monospace',
                      fontSize: '11px',
                      color: '#333',
                      padding: '8px 12px',
                      background: '#e8ffe8',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ color: '#00aa00', fontSize: '12px' }}>✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#fff9e6',
                borderRadius: '8px',
                border: '1px solid #ffd700',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#000', display: 'block', marginBottom: '8px' }}>About Security</strong>
                This application implements multiple layers of security to protect your data and privacy. 
                All communications are encrypted, and your password is securely hashed using industry-standard algorithms.
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default ProfilePage

