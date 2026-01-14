import React from 'react'
import { IonChip, IonIcon, IonLabel } from '@ionic/react'
import { checkmarkCircle, closeCircle, timeOutline } from 'ionicons/icons'
import { Poll } from '../types'

interface ValidationStatusBadgeProps {
  poll: Poll
  showReason?: boolean
}

const ValidationStatusBadge: React.FC<ValidationStatusBadgeProps> = ({ 
  poll, 
  showReason = false 
}) => {
  const status = poll.validationStatus || 'pending'

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          color: 'success',
          icon: checkmarkCircle,
          label: 'Approved',
          textColor: '#2dd36f'
        }
      case 'rejected':
        return {
          color: 'danger',
          icon: closeCircle,
          label: 'Rejected',
          textColor: '#eb445a'
        }
      case 'pending':
      default:
        return {
          color: 'warning',
          icon: timeOutline,
          label: 'Pending',
          textColor: '#ffc409'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px',
      alignItems: 'flex-start'
    }}>
      <IonChip 
        color={config.color as any}
        style={{
          fontFamily: 'Courier New, Courier, monospace',
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0
        }}
      >
        <IonIcon icon={config.icon} style={{ fontSize: '14px' }} />
        <IonLabel>{config.label}</IonLabel>
      </IonChip>
      
      {showReason && poll.validationReason && (
        <div style={{
          fontSize: '11px',
          color: config.textColor,
          fontFamily: 'Courier New, Courier, monospace',
          paddingLeft: '4px',
          maxWidth: '300px',
          lineHeight: '1.3'
        }}>
          {poll.validationReason}
        </div>
      )}
    </div>
  )
}

export default ValidationStatusBadge

