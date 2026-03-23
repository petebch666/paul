import { useWindowDimensions } from 'react-native'

export function useBreakpoint() {
  const { width, height } = useWindowDimensions()
  const isTablet = width >= 768
  const isLandscape = width > height
  const isWide = width >= 480

  return { width, height, isTablet, isLandscape, isWide }
}
