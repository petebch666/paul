import React, { useState } from 'react'
import { IonModal, IonContent, IonButton, IonTextarea, IonText } from '@ionic/react'
import './ConfirmActionModal.css'

interface ConfirmActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title: string
  message: string
  actionType: 'danger' | 'warning' | 'primary'
  confirmText?: string
  cancelText?: string
  requireReason?: boolean
  reasonPlaceholder?: string
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireReason = true,
  reasonPlaceholder = 'Enter reason for this action...'
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Reason is required')
      return
    }
    onConfirm(reason.trim())
    handleClose()
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  const getButtonColor = () => {
    switch (actionType) {
      case 'danger':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'primary':
        return 'primary'
      default:
        return 'primary'
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="confirm-action-modal">
      <IonContent className="confirm-action-content">
        <div className="confirm-action-container">
          <div className="confirm-action-header">
            <h2 style={{ fontFamily: 'Courier New, monospace', margin: 0 }}>{title}</h2>
          </div>

          <div className="confirm-action-body">
            <IonText color="medium">
              <p style={{ fontFamily: 'Courier New, monospace', fontSize: '14px' }}>{message}</p>
            </IonText>

            {requireReason && (
              <div className="reason-input-container">
                <IonTextarea
                  value={reason}
                  onIonInput={(e) => {
                    setReason(e.detail.value || '')
                    setError('')
                  }}
                  placeholder={reasonPlaceholder}
                  rows={4}
                  className="reason-textarea"
                  style={{ fontFamily: 'Courier New, monospace' }}
                />
                {error && (
                  <IonText color="danger">
                    <p className="error-text" style={{ fontFamily: 'Courier New, monospace' }}>
                      {error}
                    </p>
                  </IonText>
                )}
              </div>
            )}
          </div>

          <div className="confirm-action-footer">
            <IonButton
              expand="block"
              fill="outline"
              onClick={handleClose}
              className="cancel-button"
            >
              {cancelText}
            </IonButton>
            <IonButton
              expand="block"
              color={getButtonColor()}
              onClick={handleConfirm}
              className="confirm-button"
            >
              {confirmText}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  )
}

export default ConfirmActionModal
