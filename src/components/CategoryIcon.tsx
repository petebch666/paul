import React from 'react'

interface CategoryIconProps {
  category: string
  size?: number
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 24 }) => {
  const categoryLower = category.toLowerCase()

  // Food - Burger with colored layers
  if (categoryLower.includes('food')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8H4V10C4 10.5 4.2 11 4.5 11.4L6 13H18L19.5 11.4C19.8 11 20 10.5 20 10V8Z" fill="#D2691E"/>
        <path d="M18 13H6L5 15H19L18 13Z" fill="#228B22"/>
        <path d="M19 15H5L4 17H20L19 15Z" fill="#FF6B6B"/>
        <path d="M20 17H4C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17Z" fill="#8B4513"/>
        <path d="M4 6H20C20.5 6 21 6.5 21 7V8H3V7C3 6.5 3.5 6 4 6Z" fill="#DAA520"/>
      </svg>
    )
  }

  // Animals - Cat face
  if (categoryLower.includes('animal')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8L7 4L9 8V12H4V8Z" fill="#FFB366"/>
        <path d="M20 8L17 4L15 8V12H20V8Z" fill="#FFB366"/>
        <circle cx="12" cy="14" r="7" fill="#FFA500"/>
        <circle cx="10" cy="13" r="1.5" fill="#000000"/>
        <circle cx="14" cy="13" r="1.5" fill="#000000"/>
        <path d="M12 15C12.5 15 13 15.3 13.3 15.7" stroke="#FF1493" strokeWidth="1" fill="none"/>
        <path d="M9 16L10 17M15 16L14 17" stroke="#000000" strokeWidth="0.5"/>
      </svg>
    )
  }

  // Lifestyle - Heart with colors
  if (categoryLower.includes('lifestyle') || categoryLower.includes('life')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L10.5 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.2 3 10.9 3.8 12 5.1C13.1 3.8 14.8 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.5 19.7L12 21Z" fill="url(#heartGradient)"/>
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D"/>
            <stop offset="50%" stopColor="#C06C84"/>
            <stop offset="100%" stopColor="#F67280"/>
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // Technology - Laptop with blue screen
  if (categoryLower.includes('tech') || categoryLower.includes('programming')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="12" rx="1" fill="#2C3E50"/>
        <rect x="4" y="5" width="16" height="10" fill="#3498DB"/>
        <rect x="2" y="16" width="20" height="2" rx="1" fill="#34495E"/>
        <circle cx="12" cy="17" r="0.5" fill="#95A5A6"/>
        <path d="M8 8L10 10L8 12" stroke="#00FF00" strokeWidth="1" fill="none"/>
      </svg>
    )
  }

  // Social - People group
  if (categoryLower.includes('social')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3" fill="#FF6B9D"/>
        <path d="M4 18C4 15.8 5.8 14 8 14H10C12.2 14 14 15.8 14 18V20H4V18Z" fill="#FF6B9D"/>
        <circle cx="16" cy="8" r="3" fill="#A78BFA"/>
        <path d="M11 18C11 15.8 12.8 14 15 14H17C19.2 14 21 15.8 21 18V20H11V18Z" fill="#A78BFA"/>
      </svg>
    )
  }

  // Work - Briefcase
  if (categoryLower.includes('work') || categoryLower.includes('business')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="16" height="11" rx="2" fill="#5D4E37"/>
        <rect x="9" y="5" width="6" height="3" fill="#8B7355"/>
        <rect x="4" y="8" width="16" height="3" fill="#A0826D"/>
        <rect x="11" y="12" width="2" height="3" fill="#D4AF37"/>
      </svg>
    )
  }

  // Entertainment - Game controller
  if (categoryLower.includes('entertainment') || categoryLower.includes('game')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9C4.3 9 3 10.3 3 12V14C3 15.7 4.3 17 6 17H7L9 19V9H6Z" fill="#9B59B6"/>
        <path d="M18 9C19.7 9 21 10.3 21 12V14C21 15.7 19.7 17 18 17H17L15 19V9H18Z" fill="#9B59B6"/>
        <rect x="9" y="9" width="6" height="10" fill="#8E44AD"/>
        <circle cx="7" cy="12" r="1" fill="#E74C3C"/>
        <circle cx="17" cy="12" r="1" fill="#3498DB"/>
        <circle cx="17" cy="14" r="1" fill="#2ECC71"/>
        <circle cx="7" cy="14" r="1" fill="#F39C12"/>
      </svg>
    )
  }

  // Sports - Soccer ball
  if (categoryLower.includes('sport')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" fill="#FFFFFF" stroke="#000000" strokeWidth="1"/>
        <path d="M12 5L13.5 9H17.5L14.5 11.5L15.5 15.5L12 13L8.5 15.5L9.5 11.5L6.5 9H10.5L12 5Z" fill="#000000"/>
        <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
        <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="#E74C3C" strokeWidth="1.5"/>
      </svg>
    )
  }

  // Default - Globe
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#3498DB"/>
      <path d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
      <path d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
      <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
      <path d="M3 12H21" stroke="#FFFFFF" strokeWidth="1.5"/>
    </svg>
  )
}

export default CategoryIcon

