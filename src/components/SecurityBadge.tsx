import React, { useState } from 'react'
import { IonBadge, IonIcon } from '@ionic/react'
import { shield, shieldCheckmark, informationCircle } from 'ionicons/icons'

/**
 * SecurityBadge Component
 * Displays security status and information
 */

interface SecurityBadgeProps {
  variant?: 'compact' | 'detailed'
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ variant = 'compact' }) => {
  const [showDetails, setShowDetails] = useState(false)

  const securityFeatures = [
    '🔐 Password Hashing (bcrypt)',
    '🛡️ Input Validation',
    '🚫 XSS Protection',
    '⏱️ Rate Limiting',
    '🎯 CSRF Protection',
    '📋 Security Headers (CSP)'
  ]

  if (variant === 'compact') {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <IonIcon 
          icon={shieldCheckmark} 
          style={{ 
            fontSize: '24px',
            color: '#00ff00',
            cursor: 'pointer',
            filter: 'drop-shadow(0 0 2px rgba(0, 255, 0, 0.5))'
          }}
          onClick={() => setShowDetails(!showDetails)}
        />

        {showDetails && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            right: '0',
            marginBottom: '10px',
            background: '#1a1a1a',
            border: '2px solid #00ff00',
            padding: '16px',
            borderRadius: '4px',
            minWidth: '250px',
            fontFamily: 'Courier New, monospace',
            fontSize: '11px',
            color: '#00ff00'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff'
            }}>
              <IonIcon icon={shield} style={{ fontSize: '16px' }} />
              SECURITY FEATURES
            </div>
            {securityFeatures.map((feature, index) => (
              <div key={index} style={{ 
                marginBottom: '6px',
                paddingLeft: '8px',
                color: '#00ff00'
              }}>
                {feature}
              </div>
            ))}
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid #333',
              fontSize: '9px',
              color: '#999'
            }}>
              Click badge to toggle
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: '#f0f0f0',
      border: '2px solid #00aa00',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <IonIcon 
          icon={shieldCheckmark} 
          style={{ 
            fontSize: '32px', 
            color: '#00aa00' 
          }} 
        />
        <div>
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000'
          }}>
            SECURE CONNECTION
          </div>
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '11px',
            color: '#666'
          }}>
            All security features active
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '8px',
        marginTop: '12px'
      }}>
        {securityFeatures.map((feature, index) => (
          <div key={index} style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '11px',
            color: '#333',
            padding: '4px 8px',
            background: '#e8ffe8',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: '#00aa00', fontSize: '12px' }}>✓</span>
            {feature}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: '#fff9e6',
        borderRadius: '4px',
        border: '1px solid #ffd700',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <IonIcon icon={informationCircle} style={{ color: '#ffa500', fontSize: '16px' }} />
        <div style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '10px',
          color: '#666'
        }}>
          Run <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '2px' }}>testSecurity()</code> in console to test all features
        </div>
      </div>
    </div>
  )
}

export default SecurityBadge

