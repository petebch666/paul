import React from 'react'

interface PixelIconProps {
  type: 'last' | 'trending' | 'voted' | 'expired'
  size?: number
  active?: boolean
}

const PixelIcon: React.FC<PixelIconProps> = ({ type, size = 16, active = false }) => {
  // Pixel art icons (8x8 grid) - Retro style matching the attached image
  const icons: Record<string, string> = {
    // Clock with hands showing 3 o'clock
    last: `
      ..XXXX..
      .X....X.
      X.X..X.X
      X..XX..X
      X..XX..X
      X.XX.X.X
      .X....X.
      ..XXXX..
    `,
    // Flame with flickering edges
    trending: `
      ......X.
      .....XX.
      ....XXX.
      ..X.XX.X
      .XXX.X.X
      ..XXX.X.
      ...XX...
      ....X...
    `,
    // Profile/face icon (circular head)
    voted: `
      ..XXXX..
      .X....X.
      X.XXXX.X
      X......X
      X.X..X.X
      X.XXXX.X
      .X....X.
      ..XXXX..
    `,
    // Hourglass shape (sand timer)
    expired: `
      .XXXXXX.
      XX....XX
      X.XXXX.X
      X.XX.XX.X
      X.XX.XX.X
      X.XXXX.X
      XX....XX
      .XXXXXX.
    `
  }

  const pixelMap = icons[type].trim().split('\n').map(row => row.trim())
  const pixelSize = size / 8

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 8 8`}
      style={{ 
        imageRendering: 'crisp-edges' as any,
        imageRenderingCrispEdges: '-moz-crisp-edges',
        imageRenderingPixelated: 'pixelated'
      }}
    >
      {pixelMap.map((row, y) => 
        row.split('').map((pixel, x) => {
          if (pixel === '.') return null
          
          let fill = '#000000'
          if (active) {
            // Gradient from yellow to red for active state
            const position = y / 7
            if (position < 0.3) fill = '#FFEB3B' // Yellow
            else if (position < 0.5) fill = '#FF9800' // Orange
            else if (position < 0.7) fill = '#FF5722' // Dark Orange
            else fill = '#F44336' // Red
          } else {
            // Gray tones for inactive
            const position = y / 7
            if (position < 0.3) fill = '#CCCCCC' // Light gray
            else if (position < 0.5) fill = '#999999' // Medium gray
            else if (position < 0.7) fill = '#666666' // Dark gray
            else fill = '#333333' // Very dark gray
          }
          
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={fill}
            />
          )
        })
      )}
    </svg>
  )
}

export default PixelIcon

