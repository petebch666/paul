import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { usePolls } from '../hooks/usePolls'
import { Poll } from '../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35
const SWIPE_OUT_DURATION = 280

// ─────────────────────────────────────────────
// Pixel bar — text-based progress bar
// ─────────────────────────────────────────────
function PixelBar({ pct, label }: { pct: number; label: string }) {
  const filled = Math.round(pct / 10)
  const empty = 10 - filled
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <Text style={barStyles.bar}>
        {'█'.repeat(filled)}{'░'.repeat(empty)}
      </Text>
      <Text style={barStyles.pct}>{Math.round(pct)}%</Text>
    </View>
  )
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    width: 24,
    letterSpacing: 1,
  },
  bar: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    flex: 1,
    letterSpacing: 1,
  },
  pct: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    width: 36,
    textAlign: 'right',
  },
})

// ─────────────────────────────────────────────
// Swipe Poll Card
// ─────────────────────────────────────────────
function SwipePollCard({
  poll,
  onVote,
  onAdvance,
  onSkip,
}: {
  poll: Poll
  onVote: (option: 'A' | 'B') => void
  onAdvance: () => void
  onSkip: () => void
}) {
  const pan = useRef(new Animated.ValueXY()).current
  const [voted, setVoted] = useState(poll.isVoted)
  const [localPoll, setLocalPoll] = useState(poll)
  const swipedRef = useRef(false)

  // Always-current callbacks — avoids stale panResponder closure
  const callbacksRef = useRef({ onVote, onAdvance })
  callbacksRef.current = { onVote, onAdvance }

  // Reset when poll changes
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 })
    setVoted(poll.isVoted)
    setLocalPoll(poll)
    swipedRef.current = false
  }, [poll.id])

  // Stable reference — panResponder captures this once, reads callbacks via ref
  const swipeOut = useCallback((direction: 'left' | 'right', option: 'A' | 'B') => {
    if (swipedRef.current) return
    swipedRef.current = true
    const toX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5
    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 })
      setVoted(true)
      callbacksRef.current.onVote(option)
      setTimeout(() => {
        callbacksRef.current.onAdvance()
        swipedRef.current = false
      }, 500)
    })
  // pan, swipedRef, setVoted, callbacksRef are all stable refs/constants
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !swipedRef.current && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (swipedRef.current) return
        if (g.dx > SWIPE_THRESHOLD) {
          swipeOut('right', 'A')
        } else if (g.dx < -SWIPE_THRESHOLD) {
          swipeOut('left', 'B')
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 8,
          }).start()
        }
      },
    })
  ).current

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-5deg', '0deg', '5deg'],
    extrapolate: 'clamp',
  })

  const aOpacity = pan.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const bOpacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  const pctA = localPoll.votes > 0 ? (localPoll.votesOptionA / localPoll.votes) * 100 : 50
  const pctB = localPoll.votes > 0 ? (localPoll.votesOptionB / localPoll.votes) * 100 : 50

  if (voted) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.category}>{localPoll.category}</Text>
        <Text style={cardStyles.title}>{localPoll.title}</Text>
        <View style={cardStyles.divider} />
        <PixelBar pct={pctA} label="A" />
        <PixelBar pct={pctB} label="B" />
        <Text style={cardStyles.voteCount}>{localPoll.votes} VOTES</Text>
        <View style={cardStyles.divider} />
        <View style={cardStyles.optionRow}>
          <Text style={cardStyles.optionLabel} numberOfLines={2}>{localPoll.optionA}</Text>
          <Text style={cardStyles.vs}>VS</Text>
          <Text style={[cardStyles.optionLabel, cardStyles.optionRight]} numberOfLines={2}>
            {localPoll.optionB}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          transform: [{ translateX: pan.x }, { rotate }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Swipe hint overlays */}
      <Animated.View style={[cardStyles.overlay, cardStyles.overlayRight, { opacity: aOpacity }]}>
        <Text style={cardStyles.overlayText}>VOTE A</Text>
      </Animated.View>
      <Animated.View style={[cardStyles.overlay, cardStyles.overlayLeft, { opacity: bOpacity }]}>
        <Text style={cardStyles.overlayText}>VOTE B</Text>
      </Animated.View>

      <Text style={cardStyles.category}>{localPoll.category}</Text>

      {localPoll.isDeathmatch && (
        <Text style={cardStyles.deathTag}>⚔ DEATHMATCH</Text>
      )}
      {localPoll.isConfession && (
        <Text style={cardStyles.deathTag}>🔒 CONFESSION</Text>
      )}

      <Text style={cardStyles.title}>{localPoll.title}</Text>

      <View style={cardStyles.divider} />

      <View style={cardStyles.optionRow}>
        <View style={cardStyles.optionBox}>
          <Text style={cardStyles.optionBoxLabel}>A</Text>
          <Text style={cardStyles.optionBoxText} numberOfLines={3}>{localPoll.optionA}</Text>
        </View>
        <Text style={cardStyles.vs}>VS</Text>
        <View style={[cardStyles.optionBox, cardStyles.optionBoxRight]}>
          <Text style={cardStyles.optionBoxLabel}>B</Text>
          <Text style={cardStyles.optionBoxText} numberOfLines={3}>{localPoll.optionB}</Text>
        </View>
      </View>

      <View style={cardStyles.divider} />

      <View style={cardStyles.footer}>
        <Text style={cardStyles.footerText}>← VOTE B</Text>
        <Text style={cardStyles.footerMeta}>
          {localPoll.timeLeft !== 'EXPIRED' ? `⏱ ${localPoll.timeLeft}` : 'EXPIRED'}
        </Text>
        <Text style={cardStyles.footerText}>VOTE A →</Text>
      </View>

      {localPoll.authorUsername && (
        <Text style={cardStyles.author}>@{localPoll.authorUsername}</Text>
      )}
    </Animated.View>
  )
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    minHeight: 380,
    justifyContent: 'space-between',
  },
  overlay: {
    position: 'absolute',
    top: theme.spacing.lg,
    zIndex: 10,
    borderWidth: 2,
    borderColor: theme.colors.text,
    padding: theme.spacing.sm,
  },
  overlayRight: {
    right: theme.spacing.md,
  },
  overlayLeft: {
    left: theme.spacing.md,
  },
  overlayText: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  category: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 3,
    marginBottom: theme.spacing.xs,
  },
  deathTag: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    letterSpacing: 1,
    lineHeight: 26,
    marginVertical: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderMuted,
    marginVertical: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
  },
  optionBox: {
    flex: 1,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.sm,
  },
  optionBoxRight: {
    alignItems: 'flex-end',
  },
  optionBoxLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    letterSpacing: 2,
  },
  optionBoxText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
    lineHeight: 16,
  },
  vs: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDim,
    letterSpacing: 2,
    paddingHorizontal: theme.spacing.xs,
  },
  optionLabel: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  optionRight: {
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  footerText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
  },
  footerMeta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  author: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  voteCount: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
    marginTop: theme.spacing.xs,
  },
})

// ─────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuth()
  const { polls, isLoading, isLoadingMore, error, hasMore, loadPolls, loadMore, vote } = usePolls(user!.id)
  const [index, setIndex] = useState(0)
  const [filter, setFilter] = useState<'ALL' | 'TRENDING' | 'EXPIRED' | 'VOTED'>('ALL')

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  const filtered = polls.filter(p => {
    if (filter === 'TRENDING') return (p.trendingScore || 0) > 0 && !p.isExpired
    if (filter === 'EXPIRED')  return p.isExpired
    if (filter === 'VOTED')    return p.isVoted
    return true  // ALL: keep voted polls in deck — they show results and auto-advance
  })

  // Trigger load-more when approaching end of batch
  useEffect(() => {
    if (filtered.length > 0 && index >= filtered.length - 5 && hasMore) {
      loadMore()
    }
  }, [index, filtered.length, hasMore, loadMore])

  const currentPoll = filtered[index]

  const handleVote = useCallback((option: 'A' | 'B') => {
    if (!currentPoll || currentPoll.isExpired) return
    vote(currentPoll.id, option).catch(() => {})
  }, [currentPoll, vote])

  const handleAdvance = useCallback(() => {
    setIndex(i => i + 1)
  }, [])

  const handleSkip = useCallback(() => {
    setIndex(i => Math.min(i + 1, filtered.length - 1))
  }, [filtered.length])

  // Reset index when filter changes
  const handleFilter = (f: typeof filter) => {
    setFilter(f)
    setIndex(0)
  }

  const filters: Array<typeof filter> = ['ALL', 'TRENDING', 'EXPIRED', 'VOTED']

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>PAUL</Text>
        <Text style={styles.counter}>
          {filtered.length > 0 ? `${index + 1}/${filtered.length}${hasMore ? '+' : ''}` : '0/0'}
        </Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.text} />
          <Text style={styles.centerText}>LOADING...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPolls}>
            <Text style={styles.retryBtnText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.centerText}>NO POLLS</Text>
        </View>
      ) : index >= filtered.length ? (
        <View style={styles.center}>
          <Text style={styles.centerText}>ALL DONE</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => { setIndex(0); loadPolls() }}
          >
            <Text style={styles.retryBtnText}>REFRESH</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <SwipePollCard
            poll={filtered[index]}
            onVote={handleVote}
            onAdvance={handleAdvance}
            onSkip={handleSkip}
          />
          {isLoadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={theme.colors.textDim} size="small" />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
  },
  logo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    letterSpacing: 8,
  },
  counter: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
  },
  filterRow: {
    flexDirection: 'row',
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
  },
  filterTabText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
  },
  filterTabTextActive: {
    color: theme.colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  centerText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    letterSpacing: 4,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    letterSpacing: 2,
  },
  retryBtn: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  retryBtnText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    letterSpacing: 3,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
})
