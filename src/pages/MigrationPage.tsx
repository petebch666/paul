import React, { useState } from 'react'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonBadge,
  IonProgressBar
} from '@ionic/react'
import { cloud, cloudDone, warning, checkmarkCircle } from 'ionicons/icons'
import { migrateLocalStorageToSupabase } from '../utils/migrate-to-supabase'
import { isSupabaseConfigured } from '../database/supabase'

const MigrationPage: React.FC = () => {
  const [migrating, setMigrating] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  
  const isConfigured = isSupabaseConfigured()

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const result = await migrateLocalStorageToSupabase()
      setMigrationResult(result)
      setMigrationComplete(true)
      
      if (result.success) {
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error: any) {
      alert(`Migration failed: ${error.message}`)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Supabase Migration</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            🚀 MIGRATE TO SUPABASE
          </h1>

          {/* Configuration Status */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Configuration Status</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {isConfigured ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '24px' }} />
                  <span>✅ Supabase is configured and ready</span>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <IonIcon icon={warning} color="warning" style={{ fontSize: '24px' }} />
                    <span>⚠️ Supabase is not configured</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    Please follow these steps:
                  </p>
                  <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
                    <li>Create a `.env` file in your project root</li>
                    <li>Add your Supabase URL and anon key</li>
                    <li>Restart your dev server</li>
                    <li>See `SUPABASE-SETUP-INSTRUCTIONS.md` for details</li>
                  </ol>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Migration Instructions */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Before You Begin</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ marginBottom: '10px' }}>Make sure you have completed:</p>
              <ol style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>✅ Created a Supabase account at https://supabase.com</li>
                <li>✅ Created a new project</li>
                <li>✅ Run the SQL schema from `SUPABASE-SCHEMA.sql` in SQL Editor</li>
                <li>✅ Added your credentials to `.env` file</li>
                <li>✅ Restarted your dev server</li>
              </ol>
            </IonCardContent>
          </IonCard>

          {/* Local Data Info */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Current Local Data</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {(() => {
                const localData = localStorage.getItem('paul-db')
                if (!localData) {
                  return <p>No local data found</p>
                }
                const data = JSON.parse(localData)
                return (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <IonBadge color="primary">Users: {data.users?.length || 0}</IonBadge>
                    <IonBadge color="secondary">Polls: {data.polls?.length || 0}</IonBadge>
                    <IonBadge color="tertiary">Votes: {data.votes?.length || 0}</IonBadge>
                  </div>
                )
              })()}
            </IonCardContent>
          </IonCard>

          {/* Migration Button */}
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <IonButton
              onClick={handleMigrate}
              disabled={!isConfigured || migrating || migrationComplete}
              size="large"
              style={{
                '--background': '#667eea',
                '--border-radius': '0',
                fontFamily: 'Courier New, monospace',
                fontWeight: '700',
                letterSpacing: '2px'
              }}
            >
              <IonIcon icon={cloud} slot="start" />
              {migrating ? 'MIGRATING...' : migrationComplete ? 'MIGRATION COMPLETE' : 'START MIGRATION'}
            </IonButton>
          </div>

          {migrating && <IonProgressBar type="indeterminate" />}

          {/* Migration Result */}
          {migrationResult && (
            <IonCard color={migrationResult.success ? 'success' : 'danger'}>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={migrationResult.success ? cloudDone : warning} style={{ marginRight: '10px' }} />
                  {migrationResult.success ? 'Migration Successful!' : 'Migration Failed'}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ fontSize: '14px' }}>
                  <p><strong>Users Created:</strong> {migrationResult.details.usersCreated}</p>
                  <p><strong>Polls Created:</strong> {migrationResult.details.pollsCreated}</p>
                  <p><strong>Votes Created:</strong> {migrationResult.details.votesCreated}</p>
                  {migrationResult.details.errors.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Errors:</strong>
                      <ul style={{ fontSize: '12px', color: '#fff', marginTop: '5px' }}>
                        {migrationResult.details.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {migrationResult.success && (
                  <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
                    🎉 Your data has been migrated to Supabase!<br/>
                    Now update your app to use Supabase instead of localStorage.
                  </p>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* Warning */}
          <IonCard color="warning">
            <IonCardContent>
              <strong>⚠️ Important:</strong> This migration will create new data in Supabase.
              Your local data will not be deleted, but the app will switch to using Supabase after migration.
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MigrationPage

