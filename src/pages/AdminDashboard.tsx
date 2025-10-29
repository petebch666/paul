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
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner
} from '@ionic/react'
import { 
  people,
  statsChart,
  code,
  refresh,
  key,
  mail,
  warning,
  shield,
  clipboard,
  construct,
  barChart,
  server,
  flame,
  checkmarkCircle,
  hourglassOutline,
  trendingUp,
  personAdd
} from 'ionicons/icons'
import { SupabasePollzAPI } from '../database/supabase-api'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../database/supabase'
import './AdminDashboard.css'

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'polls' | 'api' | 'stats' | 'tools'>('stats')
  const [loading, setLoading] = useState(false)
  
  // Real Supabase Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    expiredPolls: 0,
    avgVotesPerPoll: 0,
    topCategory: { name: '', count: 0 },
    mostActiveUser: { name: '', count: 0 },
    categoriesCount: 0,
    recentUsers: 0 // Users joined in last 7 days
  })

  // User and Poll Management State
  const [users, setUsers] = useState<any[]>([])
  const [allPolls, setAllPolls] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedPoll, setSelectedPoll] = useState<any>(null)

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading admin data from Supabase...')
      
      // Fetch all polls
      const polls = await SupabasePollzAPI.getAllPolls()
      console.log('📊 Polls:', polls.length)
      
      // Calculate stats
      const now = new Date()
      const activePolls = polls.filter(p => !p.isExpired && new Date(p.expiresAt) > now).length
      const expiredPolls = polls.filter(p => p.isExpired || new Date(p.expiresAt) <= now).length
      const totalVotes = polls.reduce((sum, poll) => sum + (poll.votes || 0), 0)
      const avgVotesPerPoll = polls.length > 0 ? totalVotes / polls.length : 0
      
      // Category stats
      const categoryMap = new Map<string, number>()
      polls.forEach(poll => {
        categoryMap.set(poll.category, (categoryMap.get(poll.category) || 0) + 1)
      })
      
      const topCategory = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0]
      
      // Author stats
      const authorMap = new Map<string, number>()
      polls.forEach(poll => {
        authorMap.set(poll.author, (authorMap.get(poll.author) || 0) + 1)
      })
      
      const mostActiveUser = Array.from(authorMap.entries())
        .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0]
      
      setStats({
        totalUsers: 0, // We'll fetch this separately if needed
        totalPolls: polls.length,
        totalVotes: totalVotes,
        activePolls: activePolls,
        expiredPolls: expiredPolls,
        avgVotesPerPoll: Math.round(avgVotesPerPoll * 10) / 10,
        topCategory: { name: topCategory[0], count: topCategory[1] },
        mostActiveUser: { name: mostActiveUser[0], count: mostActiveUser[1] },
        categoriesCount: categoryMap.size,
        recentUsers: 0
      })
      
      console.log('✅ Admin data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }


  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error loading users:', error)
        return
      }

      setUsers(data || [])
      
      // Update stats
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentUsers = data?.filter(user => new Date(user.created_at) >= sevenDaysAgo).length || 0
      
      setStats(prev => ({
        ...prev,
        totalUsers: data?.length || 0,
        recentUsers
      }))
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadPollsForManagement = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error loading polls:', error)
        return
      }

      setAllPolls(data || [])
    } catch (error) {
      console.error('Error loading polls:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      loadUsers()
    }
    if (activeTab === 'polls' && allPolls.length === 0) {
      loadPollsForManagement()
    }
  }, [activeTab])

  const renderUsersTab = () => (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '24px',
          fontWeight: '700',
          letterSpacing: '2px',
          margin: 0,
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          USERS MANAGEMENT
        </h2>
        <IonBadge color="primary" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', padding: '8px 12px' }}>
          {users.length} Users
        </IonBadge>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <IonSpinner name="crescent" />
        </div>
      ) : users.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontFamily: 'Courier New, monospace'
        }}>
          <IonIcon icon={people} style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#666' }}>
            No Users Found
          </h3>
          <p style={{ fontSize: '14px', color: '#999' }}>
            No users in the database yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {users.map((user: any) => (
            <div
              key={user.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => setSelectedUser(user)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt={user.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid #e9ecef'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '4px'
                  }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                    {user.username} • {user.email}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999' }}>
                    <span>📊 {user.poll_count || 0} polls</span>
                    <span>👥 {user.followers || 0} followers</span>
                    <span>⭐ {user.reputation || 0} rep</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {user.role === 'admin' && (
                    <IonBadge color="danger" style={{ fontSize: '10px', marginBottom: '8px' }}>
                      ADMIN
                    </IonBadge>
                  )}
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {user.join_date ? new Date(user.join_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderPollsTab = () => (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '24px',
          fontWeight: '700',
          letterSpacing: '2px',
          margin: 0,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          POLLS MANAGEMENT
        </h2>
        <IonBadge color="primary" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', padding: '8px 12px' }}>
          {allPolls.length} Polls
        </IonBadge>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <IonSpinner name="crescent" />
        </div>
      ) : allPolls.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontFamily: 'Courier New, monospace'
        }}>
          <IonIcon icon={clipboard} style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#666' }}>
            No Polls Found
          </h3>
          <p style={{ fontSize: '14px', color: '#999' }}>
            No polls in the database yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {allPolls.map((poll: any) => (
            <div
              key={poll.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => setSelectedPoll(poll)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '8px'
                  }}>
                    {poll.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    {poll.description || 'No description'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                    <span>📊 {poll.votes || 0} votes</span>
                    <span>🗳️ A: {poll.votes_option_a || 0} B: {poll.votes_option_b || 0}</span>
                    <span>🔖 {poll.category}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    by {poll.author_name} • {new Date(poll.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {poll.is_expired && (
                    <IonBadge color="warning" style={{ fontSize: '10px' }}>
                      EXPIRED
                    </IonBadge>
                  )}
                  {!poll.is_expired && (
                    <IonBadge color="success" style={{ fontSize: '10px' }}>
                      ACTIVE
                    </IonBadge>
                  )}
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {Math.round(((poll.votes_option_a + poll.votes_option_b) / Math.max(poll.votes, 1)) * 100)}% engaged
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAPITab = () => (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        fontFamily: 'Courier New, monospace'
      }}>
        <IonIcon icon={code} style={{ fontSize: '64px', color: '#30cfd0', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          API Documentation
        </h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          API endpoints documentation coming soon
        </p>
      </div>
    </div>
  )

  const renderToolsTab = () => (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '24px',
          fontWeight: '700',
          letterSpacing: '2px',
          margin: 0,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ADMIN TOOLS
        </h2>
        <IonBadge 
          color="warning" 
          style={{ 
            fontSize: '11px', 
            fontWeight: '700',
            letterSpacing: '1px',
            padding: '8px 12px'
          }}
        >
          USE WITH CAUTION
        </IonBadge>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {/* Refresh Stats */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <IonIcon icon={refresh} style={{ fontSize: '32px', color: '#667eea' }} />
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '700', 
                fontFamily: 'Courier New, monospace'
              }}>
                Refresh Statistics
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                Reload all statistics from the database
              </p>
            </div>
          </div>
          <IonButton 
            expand="block" 
            fill="solid"
            color="primary"
            onClick={loadData}
            disabled={loading}
            style={{
              fontFamily: 'Courier New, monospace',
              fontWeight: '700',
              letterSpacing: '1px'
            }}
          >
            <IonIcon icon={refresh} style={{ marginRight: '8px' }} />
            {loading ? 'REFRESHING...' : 'REFRESH NOW'}
          </IonButton>
        </div>

        {/* Database Info */}
        <div style={{
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #4dd0e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <IonIcon icon={server} style={{ fontSize: '32px', color: '#00838f' }} />
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '700', 
              fontFamily: 'Courier New, monospace',
              color: '#00838f'
            }}>
              System Information
            </h3>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>Database:</strong>
              <span>Supabase</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>Environment:</strong>
              <span>{import.meta.env.DEV ? 'Development' : 'Production'}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>Status:</strong>
              <IonBadge color="success" style={{ fontSize: '11px' }}>CONNECTED</IonBadge>
            </div>
          </div>
        </div>

        {/* Coming Soon Tools */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px dashed #e9ecef',
          textAlign: 'center'
        }}>
          <IonIcon icon={construct} style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#666' }}>
            More Tools Coming Soon
          </h3>
          <p style={{ fontSize: '13px', color: '#999' }}>
            Advanced admin tools will be available in future updates
          </p>
        </div>
      </div>
    </div>
  )

  const renderStatsTab = () => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          gap: '20px'
        }}>
          <IonSpinner name="crescent" style={{ width: '48px', height: '48px' }} />
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#666'
          }}>
            Loading statistics...
          </div>
        </div>
      )
    }

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '2px',
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            STATISTICS
          </h2>
          <IonBadge 
            color="success" 
            style={{ 
              fontSize: '11px', 
              fontWeight: '700',
              letterSpacing: '1px',
              padding: '8px 12px'
            }}
          >
            LIVE DATA
          </IonBadge>
        </div>

        {/* Main Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Polls */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <IonIcon icon={clipboard} style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.9 }} />
            <div style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Courier New, monospace', marginBottom: '4px' }}>
              {stats.totalPolls}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
              Total Polls
            </div>
          </div>

          {/* Total Votes */}
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <IonIcon icon={statsChart} style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.9 }} />
            <div style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Courier New, monospace', marginBottom: '4px' }}>
              {stats.totalVotes.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
              Total Votes
            </div>
          </div>

          {/* Active Polls */}
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 242, 254, 0.3)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <IonIcon icon={flame} style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.9 }} />
            <div style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Courier New, monospace', marginBottom: '4px' }}>
              {stats.activePolls}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
              Active Polls
            </div>
          </div>

          {/* Expired Polls */}
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(254, 225, 64, 0.3)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <IonIcon icon={checkmarkCircle} style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.9 }} />
            <div style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Courier New, monospace', marginBottom: '4px' }}>
              {stats.expiredPolls}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>
              Expired Polls
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <IonIcon icon={barChart} style={{ fontSize: '24px', color: '#667eea' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Avg Votes
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Courier New, monospace', color: '#333' }}>
              {stats.avgVotesPerPoll}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <IonIcon icon={server} style={{ fontSize: '24px', color: '#f5576c' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Categories
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Courier New, monospace', color: '#333' }}>
              {stats.categoriesCount}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {/* Top Category */}
          {stats.topCategory.name && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <IonIcon icon={trendingUp} style={{ fontSize: '28px', color: '#667eea' }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  fontFamily: 'Courier New, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Top Category
                </h3>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#333' }}>
                {stats.topCategory.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {stats.topCategory.count} polls ({stats.totalPolls > 0 ? Math.round((stats.topCategory.count / stats.totalPolls) * 100) : 0}%)
              </div>
            </div>
          )}

          {/* Most Active User */}
          {stats.mostActiveUser.name && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <IonIcon icon={personAdd} style={{ fontSize: '28px', color: '#f5576c' }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  fontFamily: 'Courier New, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Top Creator
                </h3>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#333' }}>
                {stats.mostActiveUser.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {stats.mostActiveUser.count} polls ({stats.totalPolls > 0 ? Math.round((stats.mostActiveUser.count / stats.totalPolls) * 100) : 0}%)
              </div>
            </div>
          )}
        </div>

        {/* Database Info */}
        <div style={{
          marginTop: '24px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <IonIcon icon={server} style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: '700', 
              fontFamily: 'Courier New, monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#666'
            }}>
              Database Info
            </h3>
          </div>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#666' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Storage Type:</strong>
              <span>Supabase (PostgreSQL)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Status:</strong>
              <IonBadge color="success" style={{ fontSize: '10px' }}>CONNECTED</IonBadge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>ADMIN DASHBOARD</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent fullscreen className="admin-dashboard">
          <div className="access-denied">
            <IonIcon icon={warning} style={{ fontSize: '80px', color: '#ff0000', marginBottom: '20px' }} />
            <h2>ACCESS DENIED</h2>
            <p>You must be logged in as an administrator to access this page.</p>
            {!isAuthenticated && (
              <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p>Please log in with admin credentials:</p>
                <div style={{ 
                  background: '#f0f0f0', 
                  border: '3px solid #000', 
                  padding: '16px', 
                  marginTop: '12px',
                  fontFamily: 'Courier New, monospace'
                }}>
                  <div><strong>Email:</strong> admin@pollz.app</div>
                  <div><strong>Password:</strong> Admin@123</div>
                </div>
              </div>
            )}
            {isAuthenticated && user && (
              <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p>Logged in as: <strong>{user.name}</strong> ({user.role || 'user'})</p>
                <p>This account does not have admin privileges.</p>
              </div>
            )}
            <IonButton 
              href="/home"
              style={{ 
                marginTop: '30px',
                fontFamily: 'Courier New, monospace',
                fontWeight: 700,
                letterSpacing: '2px'
              }}
            >
              GO TO HOME
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ADMIN DASHBOARD</IonTitle>
          <IonButton slot="end" fill="clear" onClick={loadData}>
            <IonIcon icon={refresh} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="admin-dashboard">
        {/* Modern Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
          gap: '8px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderBottom: '1px solid #e9ecef',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'stats' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'stats' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeTab === 'stats' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '80px'
            }}
          >
            <IonIcon 
              icon={barChart} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'stats' ? 'white' : '#667eea'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'stats' ? 'white' : '#666'
            }}>
              Stats
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'tools' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'tools' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeTab === 'tools' ? '0 4px 12px rgba(245, 87, 108, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '80px'
            }}
          >
            <IonIcon 
              icon={construct} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'tools' ? 'white' : '#f5576c'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'tools' ? 'white' : '#666'
            }}>
              Tools
            </span>
          </button>

          <button
            onClick={() => setActiveTab('polls')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'polls' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'polls' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeTab === 'polls' ? '0 4px 12px rgba(0, 242, 254, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '80px'
            }}
          >
            <IonIcon 
              icon={clipboard} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'polls' ? 'white' : '#4facfe'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'polls' ? 'white' : '#666'
            }}>
              Polls
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'users' ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'users' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeTab === 'users' ? '0 4px 12px rgba(254, 225, 64, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '80px'
            }}
          >
            <IonIcon 
              icon={people} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'users' ? 'white' : '#fa709a'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'users' ? 'white' : '#666'
            }}>
              Users
            </span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'api' ? 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' : 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: activeTab === 'api' ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeTab === 'api' ? '0 4px 12px rgba(48, 207, 208, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              minWidth: '80px'
            }}
          >
            <IonIcon 
              icon={code} 
              style={{ 
                fontSize: '28px', 
                marginBottom: '6px',
                color: activeTab === 'api' ? 'white' : '#30cfd0'
              }} 
            />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: activeTab === 'api' ? 'white' : '#666'
            }}>
              API
            </span>
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'tools' && renderToolsTab()}
          {activeTab === 'polls' && renderPollsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'api' && renderAPITab()}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AdminDashboard

