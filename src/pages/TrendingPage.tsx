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
import PollCarousel from '../components/PollCarousel'
import { Poll, User } from '../types'
import UnifiedPollzAPI from '../database/unified-api'

const PollzAPI = UnifiedPollzAPI

interface TrendingPageProps {
  polls: Poll[]
  user: User
  onVote: (pollId: string, option: 'A' | 'B') => Promise<void>
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

  const handleRefresh = async (event: CustomEvent) => {
    console.log('🔄 Refreshing trending polls...')
    try {
      // Update trending polls using API
      await PollzAPI.updateTrendingPolls()
      const updatedTrendingPolls = await PollzAPI.getTrendingPolls()
      setTrendingPolls(updatedTrendingPolls)
      console.log('✅ Trending polls refreshed')
    } catch (error) {
      console.error('Error refreshing trending polls:', error)
    } finally {
      event.detail.complete()
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

        <PollCarousel
          polls={trendingPolls}
          user={user}
          onVote={onVote}
          onLike={onLike}
        />
      </IonContent>
    </IonPage>
  )
}

export default TrendingPage

