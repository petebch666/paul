import React, { useState } from 'react'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSpinner
} from '@ionic/react'
import { shieldOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons'
import { Poll } from '../types'
import UnifiedPollzAPI from '../database/unified-api'
import './DeathmatchAcceptModal.css'

const PollzAPI = UnifiedPollzAPI

interface DeathmatchAcceptModalProps {
  isOpen: boolean
  poll: Poll | null
  onClose: () => void
  onAccepted: () => void
}

const DeathmatchAcceptModal: React.FC<DeathmatchAcceptModalProps> = ({
  isOpen,
  poll,
  onClose,
  onAccepted
}) => {
  const [modifiedOptionB, setModifiedOptionB] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!poll) return null

  // Initialize with current option B text
  React.useEffect(() => {
    if (poll && isOpen) {
      setModifiedOptionB(poll.arguments?.optionB || '')
      setError(null)
    }
  }, [poll, isOpen])

  const handleAccept = async () => {
    if (!poll) return

    setIsAccepting(true)
    setError(null)

    try {
      // Get current user from localStorage or auth
      const userData = localStorage.getItem('paul-user')
      if (!userData) {
        throw new Error('You must be logged in to accept this deathmatch')
      }
      const user = JSON.parse(userData)
      
      if (user.id !== poll.optionBOwnerId) {
        throw new Error('You are not authorized to accept this deathmatch')
      }

      await PollzAPI.acceptDeathmatchPoll(
        poll.id,
        user.id,
        modifiedOptionB !== poll.arguments?.optionB ? modifiedOptionB : undefined
      )

      onAccepted()
      onClose()
    } catch (err) {
      console.error('Error accepting deathmatch:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept deathmatch')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!poll) return

    const confirmed = window.confirm(
      '⚠️ REJECT DEATHMATCH?\n\n' +
      'Are you sure you want to reject this deathmatch? This cannot be undone.'
    )

    if (!confirmed) return

    setIsRejecting(true)
    setError(null)

    try {
      // Get current user from localStorage or auth
      const userData = localStorage.getItem('paul-user')
      if (!userData) {
        throw new Error('You must be logged in to reject this deathmatch')
      }
      const user = JSON.parse(userData)
      
      if (user.id !== poll.optionBOwnerId) {
        throw new Error('You are not authorized to reject this deathmatch')
      }

      await PollzAPI.rejectDeathmatchPoll(poll.id, user.id)

      onAccepted() // Refresh notifications
      onClose()
    } catch (err) {
      console.error('Error rejecting deathmatch:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject deathmatch')
    } finally {
      setIsRejecting(false)
    }
  }

  const hasChanges = modifiedOptionB !== (poll.arguments?.optionB || '')

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>🥊 DEATHMATCH CHALLENGE</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="deathmatch-accept-container">
          <div className="deathmatch-header">
            <IonIcon icon={shieldOutline} className="deathmatch-icon" />
            <h2>You've been challenged!</h2>
            <p className="deathmatch-subtitle">Review and accept or modify your option</p>
          </div>

          {/* Poll Details */}
          <div className="poll-details-card">
            <div className="poll-title-section">
              <IonText>
                <h3>{poll.title}</h3>
              </IonText>
              {poll.description && (
                <IonText color="medium">
                  <p>{poll.description}</p>
                </IonText>
              )}
            </div>

            {/* Option A (Already set) */}
            <div className="option-card option-a-card">
              <div className="option-header">
                <span className="option-label">OPTION A</span>
                {poll.optionAOwner && (
                  <div className="option-owner">
                    <img src={poll.optionAOwner.avatar} alt={poll.optionAOwner.name} className="owner-avatar" />
                    <span>{poll.optionAOwner.name} defends</span>
                  </div>
                )}
              </div>
              <div className="option-text">{poll.arguments?.optionA}</div>
            </div>

            {/* VS Divider */}
            <div className="vs-divider">
              <span>VS</span>
            </div>

            {/* Option B (Can be modified) */}
            <div className="option-card option-b-card">
              <div className="option-header">
                <span className="option-label">OPTION B</span>
                <div className="option-owner">
                  <img src={poll.optionBOwner?.avatar || ''} alt="You" className="owner-avatar" />
                  <span>You defend</span>
                </div>
              </div>
              
              <IonItem lines="none" className="option-edit-item">
                <IonLabel position="stacked">
                  <strong>Your Option (You can modify this)</strong>
                </IonLabel>
                <IonTextarea
                  value={modifiedOptionB}
                  onIonInput={(e) => setModifiedOptionB(e.detail.value!)}
                  placeholder="Enter your option..."
                  rows={3}
                  className="option-edit-input"
                />
              </IonItem>

              {hasChanges && (
                <div className="changes-hint">
                  ✏️ You've modified the option text
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <IonButton
                expand="block"
                color="success"
                onClick={handleAccept}
                disabled={isAccepting || isRejecting || !modifiedOptionB.trim()}
                className="accept-button"
              >
                {isAccepting ? (
                  <>
                    <IonSpinner name="circular" style={{ marginRight: '8px' }} />
                    ACCEPTING...
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    {hasChanges ? 'ACCEPT WITH MODIFICATIONS' : 'ACCEPT CHALLENGE'}
                  </>
                )}
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                color="danger"
                onClick={handleReject}
                disabled={isAccepting || isRejecting}
                className="reject-button"
              >
                <IonIcon icon={closeCircleOutline} slot="start" />
                REJECT
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  )
}

export default DeathmatchAcceptModal

