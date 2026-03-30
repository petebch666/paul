export const theme = {
  colors: {
    background: '#000000',
    surface: '#0A0A0A',
    surfaceRaised: '#111111',
    border: '#FFFFFF',
    borderMuted: '#333333',
    text: '#FFFFFF',
    textMuted: '#666666',
    textDim: '#444444',
    accent: '#FFFFFF',
    danger: '#FF3333',
    success: '#33FF33',
    warning: '#FFCC00',
    voteA: '#FFFFFF',
    voteB: '#FFFFFF',
  },
  fonts: {
    regular: 'Inter_400Regular',
    bold: 'Inter_700Bold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemibold: 'Inter_600SemiBold',
  },
  fontSize: {
    xxs: 9,
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 38,
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderWidth: 1,
  borderRadius: {
    none: 0,  // logo, overlays
    xs: 2,   // inputs (barely visible)
    sm: 4,   // buttons, cards, chips
    md: 8,   // modals, large cards
  },
  animation: {
    fast: 150,
    normal: 280,
    slow: 400,
    spring: { damping: 15, stiffness: 200, mass: 1 },
    springSnappy: { damping: 20, stiffness: 300, mass: 0.8 },
  },
  shadow: {
    sm: { shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  },
  tabBarHeight: 64,
} as const

export type Theme = typeof theme
