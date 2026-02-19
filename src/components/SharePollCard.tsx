import React, { useRef } from 'react'
import { IonButton, IonIcon } from '@ionic/react'
import { shareOutline, downloadOutline, copyOutline } from 'ionicons/icons'
import { Poll } from '../types'

interface SharePollCardProps {
  poll: Poll
  onShare?: () => void
}

const SharePollCard: React.FC<SharePollCardProps> = ({ poll, onShare }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const totalVotes = poll.votesOptionA + poll.votesOptionB
  const percentA = totalVotes > 0 ? Math.round((poll.votesOptionA / totalVotes) * 100) : 50
  const percentB = totalVotes > 0 ? Math.round((poll.votesOptionB / totalVotes) * 100) : 50
  const winner = poll.votesOptionA > poll.votesOptionB ? 'A' : poll.votesOptionB > poll.votesOptionA ? 'B' : 'TIE'

  const generateShareImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null

    try {
      // Use html2canvas if available, otherwise fallback
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true
      })

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
      })
    } catch (error) {
      console.error('Error generating image:', error)
      return null
    }
  }

  const handleShare = async () => {
    const blob = await generateShareImage()
    if (!blob) {
      // Fallback: copy poll link
      handleCopyLink()
      return
    }

    const file = new File([blob], `pollz-${poll.id}.png`, { type: 'image/png' })

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: poll.title,
          text: `Vote on this poll: ${poll.title}`
        })
        onShare?.()
      } catch (error) {
        console.log('Share cancelled or failed')
        handleDownload(blob)
      }
    } else {
      handleDownload(blob)
    }
  }

  const handleDownload = async (blob?: Blob | null) => {
    const imageBlob = blob || await generateShareImage()
    if (!imageBlob) return

    const url = URL.createObjectURL(imageBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pollz-${poll.id}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onShare?.()
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/poll/${poll.id}`
    navigator.clipboard.writeText(url)
    onShare?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Shareable Card Preview */}
      <div
        ref={cardRef}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: '#ffffff',
          fontFamily: 'Courier New, monospace',
          minWidth: '320px',
          maxWidth: '400px',
          margin: '0 auto'
        }}
      >
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '4px',
          color: '#00d4ff',
          textTransform: 'uppercase'
        }}>
          POLLZ
        </div>

        {/* Question */}
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '20px',
          lineHeight: '1.3',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {poll.title}
        </div>

        {/* Results */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {/* Option A */}
          <div style={{
            flex: 1,
            background: winner === 'A' ? 'rgba(0, 102, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            border: winner === 'A' ? '2px solid #0066ff' : '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', marginBottom: '8px', opacity: 0.8 }}>
              {poll.arguments?.optionA || 'Option A'}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: winner === 'A' ? '#0066ff' : '#ffffff'
            }}>
              {percentA}%
            </div>
            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
              {poll.votesOptionA} votes
            </div>
          </div>

          {/* VS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: '700',
            color: '#666'
          }}>
            VS
          </div>

          {/* Option B */}
          <div style={{
            flex: 1,
            background: winner === 'B' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            border: winner === 'B' ? '2px solid #ff0000' : '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', marginBottom: '8px', opacity: 0.8 }}>
              {poll.arguments?.optionB || 'Option B'}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: winner === 'B' ? '#ff0000' : '#ffffff'
            }}>
              {percentB}%
            </div>
            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
              {poll.votesOptionB} votes
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#888',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '12px',
          marginTop: '8px'
        }}>
          {totalVotes} total votes • {poll.category.toUpperCase()}
        </div>

        {/* Watermark */}
        <div style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#00d4ff',
          marginTop: '12px',
          letterSpacing: '2px'
        }}>
          pollz.app
        </div>
      </div>

      {/* Share Buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <IonButton
          color="primary"
          onClick={handleShare}
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          <IonIcon icon={shareOutline} slot="start" />
          Share
        </IonButton>
        <IonButton
          fill="outline"
          onClick={() => handleDownload()}
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          <IonIcon icon={downloadOutline} slot="start" />
          Save
        </IonButton>
        <IonButton
          fill="outline"
          onClick={handleCopyLink}
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          <IonIcon icon={copyOutline} slot="start" />
          Link
        </IonButton>
      </div>
    </div>
  )
}

export default SharePollCard
