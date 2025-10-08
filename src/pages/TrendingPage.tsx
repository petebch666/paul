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
  IonChip,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonLabel
} from '@ionic/react'
import { trendingUp, refresh, flash } from 'ionicons/icons'
import PollCard from '../components/PollCard'
import { Poll, User } from '../types'
import { PollzAPI } from '../database/api'

interface TrendingPageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => void
  onLike: (pollId: string) => void
}

const TrendingPage: React.FC<TrendingPageProps> = ({ polls, user, onVote, onLike }) => {
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Sort polls by trending score and take top polls
    const sorted = [...polls]
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, 10)
    setTrendingPolls(sorted)
  }, [polls])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Update trending polls using API
      await PollzAPI.updateTrendingPolls()
      const updatedTrendingPolls = await PollzAPI.getTrendingPolls()
      setTrendingPolls(updatedTrendingPolls)
      console.log('🔄 Trending polls refreshed')
    } catch (error) {
      console.error('Error refreshing trending polls:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Trending</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="page-header-minimal">
          <h1>TRENDING POLLS</h1>
          <p>SEE WHAT'S HOT RIGHT NOW</p>
        </div>

        <IonCard style={{ margin: '16px' }}>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
              <IonIcon icon={trendingUp} style={{ marginRight: '8px', fontSize: '20px', color: '#ff0000' }} />
              <div>
                <h3 style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  fontWeight: '700',
                  fontSize: '12px',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: '#000000'
                }}>
                  TRENDING ALGORITHM
                </h3>
                <p style={{ 
                  fontSize: '10px',
                  color: '#666666',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Based on vote velocity, engagement rate, and category boost
                </p>
              </div>
            </div>
            <IonButton 
              expand="block" 
              fill="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <IonIcon icon={refresh} slot="start" />
              {refreshing ? 'REFRESHING...' : 'REFRESH'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <div style={{ padding: '0 16px' }}>
          {trendingPolls.map((poll, index) => (
            <IonCard key={poll.id} style={{ margin: '8px 0' }}>
              <IonCardHeader>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <IonChip color="warning">
                    <IonIcon icon={flash} />
                    <IonLabel>#{index + 1}</IonLabel>
                  </IonChip>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IonBadge color="primary">
                      {Math.round(poll.trendingScore || 0)} trending
                    </IonBadge>
                    <IonBadge color="light">
                      {poll.votes} votes
                    </IonBadge>
                    <IonChip color="medium">{poll.category}</IonChip>
                  </div>
                </div>
              </IonCardHeader>
              <IonCardContent>
                <PollCard
                  poll={poll}
                  onVote={onVote}
                  onLike={onLike}
                  currentUser={user}
                />
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <IonCard style={{ margin: '16px' }}>
          <IonCardHeader>
            <IonCardTitle>Poll Suggestions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                {trendingPolls.slice(0, 3).map((poll, index) => (
                  <IonCol size="12" key={poll.id}>
                    <IonCard style={{ margin: '8px 0' }}>
                      <IonCardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <IonIcon icon={flash} style={{ marginRight: '4px', color: '#ff6b35' }} />
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            Hot in {poll.category}
                          </span>
                        </div>
                        <h4 style={{ 
                          fontSize: '14px',
                          fontWeight: 'bold',
                          margin: '8px 0'
                        }}>
                          {poll.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <IonBadge color="light">{poll.votes} votes</IonBadge>
                          <IonBadge color="warning">{Math.round(poll.trendingScore || 0)} trending</IonBadge>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IonButton 
                            size="small" 
                            fill="outline"
                            onClick={() => onVote(poll.id, 'A')}
                            disabled={poll.isVoted}
                          >
                            Vote A
                          </IonButton>
                          <IonButton 
                            size="small" 
                            fill="outline"
                            onClick={() => onVote(poll.id, 'B')}
                            disabled={poll.isVoted}
                          >
                            Vote B
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  )
}

export default TrendingPage

