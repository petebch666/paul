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
  shield
} from 'ionicons/icons'
import { PollzAPI } from '../database/api'
import { useAuth } from '../hooks/useAuth'
import './AdminDashboard.css'

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'api' | 'stats'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [polls, setPolls] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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
        setUsers(data.users || [])
        setPolls(data.polls || [])
      } else {
        console.log('⚠️ No database found in localStorage')
        setUsers([])
        setPolls([])
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

  const renderStatsTab = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2>STATISTICS</h2>
      </div>

      <div className="stats-grid">
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
            <div className="stat-value">{polls.length}</div>
            <div className="stat-label">TOTAL POLLS</div>
          </IonCardContent>
        </IonCard>

        <IonCard className="stat-card">
          <IonCardContent>
            <IonIcon icon={code} className="stat-icon" />
            <div className="stat-value">{polls.reduce((sum, poll) => sum + (poll.votes || 0), 0)}</div>
            <div className="stat-label">TOTAL VOTES</div>
          </IonCardContent>
        </IonCard>
      </div>

      <IonCard className="database-info">
        <IonCardHeader>
          <IonCardTitle>DATABASE INFO</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="db-info-row">
            <strong>Storage:</strong> localStorage (Browser)
          </div>
          <div className="db-info-row">
            <strong>Size:</strong> {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
          </div>
          <div className="db-info-row">
            <strong>Location:</strong> Browser Storage
          </div>
          <div className="db-info-row">
            <strong>Persistence:</strong> Session-based
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  )

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
          <IonSegmentButton value="users">
            <IonIcon icon={people} />
            <IonLabel>USERS</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="api">
            <IonIcon icon={code} />
            <IonLabel>API</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="stats">
            <IonIcon icon={statsChart} />
            <IonLabel>STATS</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div className="admin-content">
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'api' && renderAPITab()}
          {activeTab === 'stats' && renderStatsTab()}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default AdminDashboard

