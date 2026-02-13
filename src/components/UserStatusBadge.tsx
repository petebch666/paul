import React from 'react'
import { IonBadge } from '@ionic/react'
import './UserStatusBadge.css'

interface UserStatusBadgeProps {
  status: 'active' | 'suspended' | 'banned'
  size?: 'small' | 'medium' | 'large'
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'success'
      case 'suspended':
        return 'warning'
      case 'banned':
        return 'danger'
      default:
        return 'medium'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return '✓'
      case 'suspended':
        return '⏸'
      case 'banned':
        return '✕'
      default:
        return ''
    }
  }

  const getStatusText = () => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <IonBadge
      color={getStatusColor()}
      className={`user-status-badge user-status-badge-${size}`}
    >
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-text">{getStatusText()}</span>
    </IonBadge>
  )
}

export default UserStatusBadge
