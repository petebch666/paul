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
  IonLabel
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
  clipboard
} from 'ionicons/icons'
import UnifiedPollzAPI from '../database/unified-api'
import { useAuth } from '../hooks/useAuth'
import './AdminDashboard.css'

const PollzAPI = UnifiedPollzAPI

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'polls' | 'api' | 'stats' | 'tools'>('stats')
  const [users, setUsers] = useState<any[]>([])
  const [polls, setPolls] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [toolsLoading, setToolsLoading] = useState(false)

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading admin data...')
      // Load all users from localStorage
      const dbData = localStorage.getItem('paul-db')
      console.log('📦 Database data:', dbData ? 'Found' : 'Not found')
      
      if (dbData) {
        const data = JSON.parse(dbData)
        console.log('👥 Users:', data.users?.length || 0)
        console.log('📊 Polls:', data.polls?.length || 0)
        console.log('🗳️ Votes:', data.votes?.length || 0)
        setUsers(data.users || [])
        setPolls(data.polls || [])
        setVotes(data.votes || [])
      } else {
        console.log('⚠️ No database found in localStorage')
        setUsers([])
        setPolls([])
        setVotes([])
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetUserPassword = (userId: string) => {
    const newPassword = prompt('Enter new password for this user:')
    if (newPassword) {
      // In a real app, this would hash the password
      alert(`Password would be reset to: ${newPassword}\n(In production, this would be hashed)`)
    }
  }

  const handleDatabaseReset = async () => {
    const confirmed = confirm(
      '⚠️ WARNING: DATABASE RESET\n\n' +
      'This will:\n' +
      '• Clear ALL localStorage data\n' +
      '• Remove all users except admin\n' +
      '• Delete all polls and votes\n' +
      '• Reset the app to initial state\n\n' +
      'The app will reload after reset.\n\n' +
      'Are you sure you want to continue?'
    )
    
    if (!confirmed) return

    setToolsLoading(true)
    try {
      console.log('🔥 Clearing all localStorage...')
      localStorage.clear()
      sessionStorage.clear()
      
      alert('✅ Database reset complete!\n\nThe app will reload now.')
      
      // Reload the app
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    } catch (error) {
      console.error('❌ Reset failed:', error)
      alert('❌ Reset failed. Check console for details.')
      setToolsLoading(false)
    }
  }

  const handleQuickSetup = async () => {
    const confirmed = confirm(
      '🚀 QUICK SETUP\n\n' +
      'This will:\n' +
      '• Create admin user (admin@pollz.app / Admin@123)\n' +
      '• Create demo user (john@example.com)\n' +
      '• Generate 50 sample polls\n' +
      '• Reset all existing data\n\n' +
      'Continue?'
    )
    
    if (!confirmed) return

    setToolsLoading(true)
    try {
      console.log('🚀 Starting quick setup...')
      
      // Clear existing data
      localStorage.clear()
      
      // Create database structure
      const database = {
        users: [
          {
            id: 'admin-1',
            name: 'Admin',
            username: '@admin',
            email: 'admin@pollz.app',
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=ff0000&color=ffffff&size=150',
            followers: 0,
            following: 0,
            reputation: 0,
            badges: [{
              id: 'badge-admin',
              name: 'Administrator',
              description: 'System Administrator',
              icon: 'Shield',
              category: 'admin',
              rarity: 'legendary',
              earnedAt: new Date().toISOString()
            }],
            pollCount: 0,
            winRate: 0,
            joinDate: new Date().toISOString()
          },
          {
            id: 'user-john-1',
            name: 'John Doe',
            username: '@johndoe',
            email: 'john@example.com',
            password: '$2a$10$JohnDoe123HashExampleForDemoPurposesOnly',
            role: 'user',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0066ff&color=ffffff&size=150',
            followers: 42,
            following: 38,
            reputation: 156,
            badges: [],
            pollCount: 0,
            winRate: 0,
            joinDate: new Date().toISOString()
          }
        ],
        polls: [],
        votes: [],
        notifications: [],
        pollHistory: []
      }
      
      // Generate 50 polls (simplified version)
      const categories = ['Food', 'Technology', 'Lifestyle', 'Work', 'Entertainment', 'Sports', 'Travel', 'Education']
      const pollTemplates: Record<string, string[][]> = {
        Food: [
          ['Pizza vs Burgers?', 'Pizza', 'Burgers'],
          ['Coffee vs Tea?', 'Coffee', 'Tea'],
          ['Sushi vs Tacos?', 'Sushi', 'Tacos']
        ],
        Technology: [
          ['iOS vs Android?', 'iOS', 'Android'],
          ['Mac vs PC?', 'Mac', 'PC'],
          ['Dark Mode vs Light Mode?', 'Dark Mode', 'Light Mode']
        ],
        Lifestyle: [
          ['Cats vs Dogs?', 'Cats', 'Dogs'],
          ['Beach vs Mountains?', 'Beach', 'Mountains'],
          ['Summer vs Winter?', 'Summer', 'Winter']
        ],
        Work: [
          ['Work from Home vs Office?', 'Work from Home', 'Office'],
          ['Freelance vs Full-time?', 'Freelance', 'Full-time']
        ],
        Entertainment: [
          ['Netflix vs YouTube?', 'Netflix', 'YouTube'],
          ['Movies vs TV Series?', 'Movies', 'TV Series']
        ],
        Sports: [
          ['Football vs Basketball?', 'Football', 'Basketball'],
          ['Gym vs Home Workout?', 'Gym', 'Home']
        ],
        Travel: [
          ['Plane vs Train?', 'Plane', 'Train'],
          ['Hotel vs Airbnb?', 'Hotel', 'Airbnb']
        ],
        Education: [
          ['Online vs In-Person?', 'Online', 'In-Person'],
          ['STEM vs Humanities?', 'STEM', 'Humanities']
        ]
      }
      
      const polls = []
      const authors = ['Admin', 'John Doe']
      const authorIds = ['admin-1', 'user-john-1']
      
      for (let i = 0; i < 50; i++) {
        const category = categories[i % categories.length]
        const templates = pollTemplates[category]
        const template = templates[i % templates.length]
        const authorIndex = Math.floor(Math.random() * 2)
        const minutes = 60 + Math.floor(Math.random() * 10000)
        const optionA = 10 + Math.floor(Math.random() * 81)
        
        polls.push({
          id: `poll-${i + 1}`,
          title: template[0],
          description: `${template[1]} or ${template[2]}?`,
          category: category,
          authorId: authorIds[authorIndex],
          author: authors[authorIndex],
          votesOptionA: optionA,
          votesOptionB: 100 - optionA,
          votes: 100,
          timeLeft: minutes < 60 ? `${minutes}m left` : minutes < 1440 ? `${Math.floor(minutes/60)}h left` : `${Math.floor(minutes/1440)}d left`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
          isVoted: false,
          isLiked: false,
          isExpired: false,
          pollType: 'options-only',
          timerEnabled: true,
          timerDuration: minutes,
          notificationEnabled: false,
          context: `The ultimate ${category.toLowerCase()} debate`,
          arguments: {
            optionA: template[1],
            optionB: template[2]
          },
          evidence: { optionA: [], optionB: [] },
          comments: [],
          trendingScore: 50 + Math.floor(Math.random() * 250)
        })
      }
      
      database.polls = polls
      
      // Save to localStorage
      localStorage.setItem('paul-db', JSON.stringify(database))
      
      console.log('✅ Quick setup complete!')
      alert(
        '✅ SETUP COMPLETE!\n\n' +
        `📊 Created:\n` +
        `• 2 users (Admin + Demo user)\n` +
        `• ${polls.length} polls\n\n` +
        `🔐 Login credentials:\n` +
        `Email: admin@pollz.app\n` +
        `Password: Admin@123\n\n` +
        `App will reload now...`
      )
      
      // Reload to show new data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('❌ Quick setup failed:', error)
      alert('❌ Setup failed. Check console for details.')
      setToolsLoading(false)
    }
  }

  const handleCheckDatabase = () => {
    const dbData = localStorage.getItem('paul-db')
    if (!dbData) {
      alert('❌ NO DATABASE FOUND\n\nLocalStorage is empty or database has not been initialized.')
      return
    }
    
    try {
      const data = JSON.parse(dbData)
      const dbSize = (JSON.stringify(data).length / 1024).toFixed(2)
      
      let message = '💾 DATABASE CHECK\n\n'
      message += `📦 Storage Size: ${dbSize} KB\n\n`
      message += `👥 Users: ${data.users?.length || 0}\n`
      message += `📊 Polls: ${data.polls?.length || 0}\n`
      message += `🗳️ Votes: ${data.votes?.length || 0}\n`
      message += `🔔 Notifications: ${data.notifications?.length || 0}\n`
      message += `📜 Poll History: ${data.pollHistory?.length || 0}\n\n`
      
      if (data.users && data.users.length > 0) {
        message += '👥 USERS:\n'
        data.users.forEach((user: any, i: number) => {
          message += `${i + 1}. ${user.name} (${user.email})\n`
          message += `   Role: ${user.role || 'user'}\n`
        })
      }
      
      alert(message)
      console.log('📦 Full database:', data)
    } catch (error) {
      alert(`❌ ERROR PARSING DATABASE\n\n${error}`)
    }
  }

  const renderUsersTab = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2>REGISTERED USERS</h2>
        <IonBadge color="primary">{users.length} TOTAL</IonBadge>
      </div>

      {users.map((user, index) => (
        <IonCard key={user.id || index} className="user-card">
          <IonCardHeader>
            <div className="user-header">
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <div className="user-info">
                <IonCardTitle className="user-name">{user.name}</IonCardTitle>
                <div className="user-username">{user.username}</div>
              </div>
            </div>
          </IonCardHeader>
          <IonCardContent>
            <div className="user-details">
              <div className="detail-row">
                <IonIcon icon={mail} />
                <span>{user.email}</span>
              </div>
              <div className="detail-row">
                <IonIcon icon={key} />
                <span className="password-hash">
                  {user.password ? user.password.substring(0, 30) + '...' : 'No password'}
                </span>
              </div>
              <div className="detail-row">
                <strong>ID:</strong> {user.id}
              </div>
              <div className="detail-row">
                <strong>Joined:</strong> {new Date(user.joinDate).toLocaleDateString()}
              </div>
              <div className="detail-row">
                <strong>Polls:</strong> {user.pollCount || 0}
              </div>
            </div>
            <div className="user-actions">
              <IonButton size="small" fill="outline" onClick={() => resetUserPassword(user.id)}>
                RESET PASSWORD
              </IonButton>
              <IonButton size="small" fill="outline" color="danger" onClick={() => {
                if (confirm(`Delete user ${user.name}?`)) {
                  alert('User deletion would happen here')
                }
              }}>
                DELETE USER
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      ))}

      {users.length === 0 && (
        <div className="empty-state">
          <IonIcon icon={people} style={{ fontSize: '64px', color: '#ccc' }} />
          <p>NO USERS REGISTERED YET</p>
        </div>
      )}
    </div>
  )

  const renderPollsTab = () => {
    // Sort polls by creation date (newest first)
    const sortedPolls = [...polls].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Calculate category breakdown
    const categoryBreakdown = polls.reduce((acc, poll) => {
      acc[poll.category] = (acc[poll.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return (
      <div className="admin-section">
        <div className="section-header">
          <h2>ALL POLLS</h2>
          <IonBadge color="primary">{polls.length} TOTAL</IonBadge>
        </div>

        {/* Category breakdown */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>📂 Category Breakdown</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <IonBadge key={category} color="secondary" style={{ padding: '8px 12px' }}>
                    {category}: {count}
                  </IonBadge>
                ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Polls list */}
        {sortedPolls.map((poll, index) => {
          const isExpired = poll.isExpired || new Date(poll.expiresAt) < new Date()
          const totalVotes = poll.votes || 0
          const optionAPercentage = totalVotes > 0 ? Math.round((poll.votesOptionA / totalVotes) * 100) : 0
          const optionBPercentage = totalVotes > 0 ? Math.round((poll.votesOptionB / totalVotes) * 100) : 0
          
          return (
            <IonCard key={poll.id || index} style={{ 
              borderLeft: isExpired ? '4px solid #ff4444' : '4px solid #44ff44',
              opacity: isExpired ? 0.7 : 1
            }}>
              <IonCardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <IonCardTitle style={{ fontSize: '1.1em', marginBottom: '8px' }}>
                      {poll.title}
                    </IonCardTitle>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <IonBadge color={isExpired ? 'danger' : 'success'}>
                        {isExpired ? '⏱️ EXPIRED' : '🔥 ACTIVE'}
                      </IonBadge>
                      <IonBadge color="medium">{poll.category}</IonBadge>
                      <IonBadge color="tertiary">{totalVotes} votes</IonBadge>
                    </div>
                  </div>
                </div>
              </IonCardHeader>
              
              <IonCardContent>
                <div className="user-details">
                  <div className="detail-row">
                    <strong>ID:</strong> {poll.id}
                  </div>
                  <div className="detail-row">
                    <strong>Author:</strong> {poll.author} (ID: {poll.authorId})
                  </div>
                  <div className="detail-row">
                    <strong>Created:</strong> {new Date(poll.createdAt).toLocaleString()}
                  </div>
                  <div className="detail-row">
                    <strong>Expires:</strong> {new Date(poll.expiresAt).toLocaleString()} ({poll.timeLeft})
                  </div>
                  <div className="detail-row">
                    <strong>Description:</strong> {poll.description}
                  </div>
                  
                  {poll.arguments && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>Options:</strong>
                      <div style={{ 
                        display: 'grid', 
                        gap: '8px', 
                        marginTop: '8px',
                        gridTemplateColumns: '1fr 1fr'
                      }}>
                        <div style={{ 
                          padding: '12px', 
                          background: '#f0f0f0', 
                          borderRadius: '8px',
                          border: '2px solid #667eea'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            Option A: {poll.arguments.optionA}
                          </div>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {poll.votesOptionA || 0} votes ({optionAPercentage}%)
                          </div>
                          <div style={{ 
                            marginTop: '8px',
                            height: '8px',
                            background: '#ddd',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${optionAPercentage}%`,
                              height: '100%',
                              background: '#667eea',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                        
                        <div style={{ 
                          padding: '12px', 
                          background: '#f0f0f0', 
                          borderRadius: '8px',
                          border: '2px solid #764ba2'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            Option B: {poll.arguments.optionB}
                          </div>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {poll.votesOptionB || 0} votes ({optionBPercentage}%)
                          </div>
                          <div style={{ 
                            marginTop: '8px',
                            height: '8px',
                            background: '#ddd',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${optionBPercentage}%`,
                              height: '100%',
                              background: '#764ba2',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {poll.context && (
                    <div className="detail-row" style={{ marginTop: '8px' }}>
                      <strong>Context:</strong> {poll.context}
                    </div>
                  )}
                </div>

                <div className="user-actions" style={{ marginTop: '12px' }}>
                  <IonButton 
                    size="small" 
                    fill="outline"
                    onClick={() => {
                      console.log('Poll details:', poll)
                      alert(`Poll ID: ${poll.id}\n\nFull details logged to console`)
                    }}
                  >
                    VIEW DETAILS
                  </IonButton>
                  <IonButton 
                    size="small" 
                    fill="outline" 
                    color="danger"
                    onClick={() => {
                      if (confirm(`Delete poll "${poll.title}"?`)) {
                        // TODO: Implement delete functionality
                        alert('Poll deletion would happen here')
                      }
                    }}
                  >
                    DELETE POLL
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          )
        })}

        {polls.length === 0 && (
          <div className="empty-state">
            <IonIcon icon={statsChart} style={{ fontSize: '64px', color: '#ccc' }} />
            <p>NO POLLS FOUND</p>
          </div>
        )}
      </div>
    )
  }

  const renderAPITab = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2>API ENDPOINTS</h2>
        <IonBadge color="success">SWAGGER-LIKE</IonBadge>
      </div>

      <IonCard className="api-card">
        <IonCardHeader>
          <IonCardTitle className="api-title">🔐 AUTHENTICATION</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/auth/login</div>
            <div className="description">User login with email and password</div>
          </div>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/auth/signup</div>
            <div className="description">Create new user account</div>
          </div>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/auth/reset-password</div>
            <div className="description">Request password reset email</div>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="api-card">
        <IonCardHeader>
          <IonCardTitle className="api-title">👤 USERS</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="api-endpoint">
            <div className="method get">GET</div>
            <div className="path">/api/users/:id</div>
            <div className="description">Get user by ID</div>
          </div>
          <div className="api-endpoint">
            <div className="method get">GET</div>
            <div className="path">/api/users/email/:email</div>
            <div className="description">Get user by email</div>
          </div>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/users</div>
            <div className="description">Create new user</div>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="api-card">
        <IonCardHeader>
          <IonCardTitle className="api-title">📊 POLLS</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="api-endpoint">
            <div className="method get">GET</div>
            <div className="path">/api/polls</div>
            <div className="description">Get all polls (with pagination)</div>
          </div>
          <div className="api-endpoint">
            <div className="method get">GET</div>
            <div className="path">/api/polls/:id</div>
            <div className="description">Get poll by ID</div>
          </div>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/polls</div>
            <div className="description">Create new poll</div>
          </div>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/polls/:id/vote</div>
            <div className="description">Vote on a poll</div>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="api-card">
        <IonCardHeader>
          <IonCardTitle className="api-title">🔔 NOTIFICATIONS</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="api-endpoint">
            <div className="method get">GET</div>
            <div className="path">/api/notifications/:userId</div>
            <div className="description">Get user notifications</div>
          </div>
          <div className="api-endpoint">
            <div className="method post">POST</div>
            <div className="path">/api/notifications</div>
            <div className="description">Create notification</div>
          </div>
          <div className="api-endpoint">
            <div className="method put">PUT</div>
            <div className="path">/api/notifications/:id/read</div>
            <div className="description">Mark notification as read</div>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  )

  const renderToolsTab = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2>ADMIN TOOLS</h2>
        <IonBadge color="danger">DANGEROUS OPERATIONS</IonBadge>
      </div>

      <IonCard className="tool-card">
        <IonCardHeader>
          <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={clipboard} />
            DATABASE CHECK
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            View detailed information about the current database state, including all users, polls, and storage size.
          </p>
          <IonButton 
            expand="block" 
            fill="outline" 
            color="primary"
            onClick={handleCheckDatabase}
            disabled={toolsLoading}
          >
            <IonIcon icon={statsChart} style={{ marginRight: '8px' }} />
            CHECK DATABASE
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonCard className="tool-card">
        <IonCardHeader>
          <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={refresh} />
            QUICK SETUP
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Reset the database and create a fresh setup with admin user, demo user, and 50 sample polls.
          </p>
          <div style={{ 
            background: '#fff3cd', 
            border: '2px solid #ffc107', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            <strong>📋 Creates:</strong><br />
            • Admin user (admin@pollz.app / Admin@123)<br />
            • Demo user (john@example.com)<br />
            • 50 sample polls across 8 categories
          </div>
          <IonButton 
            expand="block" 
            fill="solid" 
            color="success"
            onClick={handleQuickSetup}
            disabled={toolsLoading}
          >
            <IonIcon icon={code} style={{ marginRight: '8px' }} />
            {toolsLoading ? 'SETTING UP...' : 'QUICK SETUP'}
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonCard className="tool-card" style={{ borderColor: '#ff0000' }}>
        <IonCardHeader>
          <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff0000' }}>
            <IonIcon icon={warning} />
            FORCE RESET DATABASE
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            <strong style={{ color: '#ff0000' }}>⚠️ DANGER ZONE:</strong> This will completely clear all localStorage data, 
            including all users, polls, votes, and settings. The app will restart fresh.
          </p>
          <div style={{ 
            background: '#ffe6e6', 
            border: '2px solid #ff0000', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            <strong>🔥 This will delete:</strong><br />
            • ALL users (including admin)<br />
            • ALL polls and votes<br />
            • ALL notifications and history<br />
            • ALL app data and settings
          </div>
          <IonButton 
            expand="block" 
            fill="solid" 
            color="danger"
            onClick={handleDatabaseReset}
            disabled={toolsLoading}
          >
            <IonIcon icon={warning} style={{ marginRight: '8px' }} />
            {toolsLoading ? 'RESETTING...' : 'FORCE RESET'}
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>ℹ️ INFORMATION</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <p><strong>Storage Location:</strong> Browser localStorage</p>
            <p><strong>Current Size:</strong> {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV || 'production'}</p>
            <p style={{ marginTop: '12px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
              💡 <strong>Tip:</strong> These tools are designed for development and testing. 
              Always backup important data before using reset operations.
            </p>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  )

  const renderStatsTab = () => {
    const totalVotes = polls.reduce((sum, poll) => sum + (poll.votes || 0), 0)
    const activePolls = polls.filter(p => !p.isExpired && new Date(p.expiresAt) > new Date()).length
    const expiredPolls = polls.filter(p => p.isExpired || new Date(p.expiresAt) <= new Date()).length
    const avgVotesPerPoll = polls.length > 0 ? (totalVotes / polls.length).toFixed(1) : '0'
    
    // Category stats
    const categoryStats = polls.reduce((acc, poll) => {
      acc[poll.category] = (acc[poll.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0]
    
    // Most active user (by poll count)
    const userPollCounts = polls.reduce((acc, poll) => {
      acc[poll.author] = (acc[poll.author] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostActiveUser = Object.entries(userPollCounts).sort((a, b) => b[1] - a[1])[0]

    return (
      <div className="admin-section">
        <div className="section-header">
          <h2>STATISTICS OVERVIEW</h2>
          <IonBadge color="success">REAL-TIME</IonBadge>
        </div>

        <div className="stats-grid">
          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={clipboard} className="stat-icon" />
              <div className="stat-value">{polls.length}</div>
              <div className="stat-label">TOTAL POLLS</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={people} className="stat-icon" />
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">TOTAL USERS</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={statsChart} className="stat-icon" />
              <div className="stat-value">{totalVotes}</div>
              <div className="stat-label">TOTAL VOTES</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
            <IonCardContent>
              <IonIcon icon={code} className="stat-icon" />
              <div className="stat-value">{votes.length}</div>
              <div className="stat-label">VOTE RECORDS</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card" style={{ background: 'linear-gradient(135deg, #44ff44 0%, #22bb22 100%)', color: 'white' }}>
            <IonCardContent>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>🔥</div>
              <div className="stat-value" style={{ color: 'white' }}>{activePolls}</div>
              <div className="stat-label" style={{ color: 'white' }}>ACTIVE POLLS</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card" style={{ background: 'linear-gradient(135deg, #ff4444 0%, #bb2222 100%)', color: 'white' }}>
            <IonCardContent>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>⏱️</div>
              <div className="stat-value" style={{ color: 'white' }}>{expiredPolls}</div>
              <div className="stat-label" style={{ color: 'white' }}>EXPIRED POLLS</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
            <IonCardContent>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>📊</div>
              <div className="stat-value">{avgVotesPerPoll}</div>
              <div className="stat-label">AVG VOTES/POLL</div>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
            <IonCardContent>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>📂</div>
              <div className="stat-value">{Object.keys(categoryStats).length}</div>
              <div className="stat-label">CATEGORIES</div>
            </IonCardContent>
          </IonCard>
        </div>

        {topCategory && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>🏆 Top Category</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '8px' }}>
                {topCategory[0]}
              </div>
              <div style={{ color: '#666' }}>
                {topCategory[1]} polls ({Math.round((topCategory[1] / polls.length) * 100)}% of all polls)
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {mostActiveUser && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>👑 Most Active Creator</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '8px' }}>
                {mostActiveUser[0]}
              </div>
              <div style={{ color: '#666' }}>
                {mostActiveUser[1]} polls created ({Math.round((mostActiveUser[1] / polls.length) * 100)}% of all polls)
              </div>
            </IonCardContent>
          </IonCard>
        )}

        <IonCard className="database-info">
          <IonCardHeader>
            <IonCardTitle>💾 DATABASE INFO</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="db-info-row">
              <strong>Storage Type:</strong> localStorage (Browser)
            </div>
            <div className="db-info-row">
              <strong>Database Size:</strong> {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
            </div>
            <div className="db-info-row">
              <strong>Location:</strong> Browser Storage (Client-side)
            </div>
            <div className="db-info-row">
              <strong>Persistence:</strong> Session-based (cleared on browser data clear)
            </div>
            <div className="db-info-row" style={{ marginTop: '12px', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
              <strong>⚠️ Migration Recommended:</strong> Consider migrating to Supabase or a dedicated database for production use
            </div>
          </IonCardContent>
        </IonCard>
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
        <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as any)}>
          <IonSegmentButton value="stats">
            <IonIcon icon={statsChart} />
            <IonLabel>STATS</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="tools">
            <IonIcon icon={shield} />
            <IonLabel>TOOLS</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="polls">
            <IonIcon icon={clipboard} />
            <IonLabel>POLLS</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="users">
            <IonIcon icon={people} />
            <IonLabel>USERS</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="api">
            <IonIcon icon={code} />
            <IonLabel>API</IonLabel>
          </IonSegmentButton>
        </IonSegment>

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

