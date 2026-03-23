import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated'
import { Flame, List, LayoutGrid } from 'lucide-react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { usePolls } from '../hooks/usePolls'
import { Poll } from '../types'
import { CATEGORIES } from '../constants/categories'
import { Screen, TabBar, PixelBar, Button, Card, Divider, Chip, PollRow } from '../components/ui'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35

const AnimScrollView = Reanimated.createAnimatedComponent(ScrollView)

const FILTER_TABS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'TRENDING', value: 'TRENDING' },
  { label: '🔥', value: 'EXPIRING' },
  { label: 'EXPIRED', value: 'EXPIRED' },
  { label: 'VOTED', value: 'VOTED' },
]

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  ALL: 'NO POLLS YET',
  TRENDING: 'NO TRENDING POLLS YET',
  EXPIRING: 'NO POLLS EXPIRING SOON',
  EXPIRED: 'NO EXPIRED POLLS',
  VOTED: 'YOU HAVEN\'T VOTED YET',
}

function isExpiringSoon(poll: Poll): boolean {
  if (poll.isExpired || !poll.timerEnabled) return false
  const hoursLeft = (new Date(poll.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursLeft > 0 && hoursLeft < 2
}

// ─────────────────────────────────────────────
// Carousel Card
// ─────────────────────────────────────────────
interface CarouselCardProps {
  poll: Poll
  index: number
  scrollY: Reanimated.SharedValue<number>
  slotHeight: number
  isFocused: boolean
  onVote: (option: 'A' | 'B') => void
  onAdvance: () => void
  onAuthorPress: (authorId: string) => void
}

function CarouselCard({ poll, index, scrollY, slotHeight, isFocused, onVote, onAdvance, onAuthorPress }: CarouselCardProps) {
  const translateX = useSharedValue(0)
  const isSwiped = useSharedValue(false)
  const [voted, setVoted] = useState(poll.isVoted)
  const [localPoll, setLocalPoll] = useState(poll)
  const [voteError, setVoteError] = useState<string | null>(null)

  const callbacksRef = useRef({ onVote, onAdvance })
  callbacksRef.current = { onVote, onAdvance }

  useEffect(() => {
    translateX.value = 0
    isSwiped.value = false
    setVoted(poll.isVoted)
    setLocalPoll(poll)
    setVoteError(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.id])

  function doVote(option: 'A' | 'B') {
    setVoted(true)
    callbacksRef.current.onVote(option)
    setTimeout(() => {
      callbacksRef.current.onAdvance()
    }, 500)
  }

  function doVoteWithError(option: 'A' | 'B') {
    setVoted(true)
    Promise.resolve(callbacksRef.current.onVote(option)).catch(() => {
      setVoted(false)
      setVoteError('VOTE FAILED — TRY AGAIN')
    })
    setTimeout(() => {
      callbacksRef.current.onAdvance()
    }, 500)
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .enabled(isFocused && !voted)
    .onUpdate(e => {
      if (!isSwiped.value) translateX.value = e.translationX
    })
    .onEnd(e => {
      if (isSwiped.value) return
      if (e.translationX > SWIPE_THRESHOLD) {
        isSwiped.value = true
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: theme.animation.normal }, () => {
          runOnJS(doVoteWithError)('A')
        })
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        isSwiped.value = true
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: theme.animation.normal }, () => {
          runOnJS(doVoteWithError)('B')
        })
      } else {
        translateX.value = withSpring(0, theme.animation.spring)
      }
    })

  const animStyle = useAnimatedStyle(() => {
    if (slotHeight === 0) return {}
    const distance = scrollY.value - index * slotHeight
    const scale = interpolate(distance, [-slotHeight, 0, slotHeight], [0.88, 1, 0.88], Extrapolation.CLAMP)
    const opacity = interpolate(distance, [-slotHeight, 0, slotHeight], [0.35, 1, 0.35], Extrapolation.CLAMP)
    return { transform: [{ scale }], opacity }
  })

  const cardInnerStyle = useAnimatedStyle(() => {
    const rotate = `${interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-5, 0, 5], Extrapolation.CLAMP)}deg`
    return { transform: [{ translateX: translateX.value }, { rotate }] }
  })

  const aOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SCREEN_WIDTH * 0.2], [0, 1], Extrapolation.CLAMP),
  }))

  const bOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SCREEN_WIDTH * 0.2, 0], [1, 0], Extrapolation.CLAMP),
  }))

  const pctA = localPoll.votes > 0 ? (localPoll.votesOptionA / localPoll.votes) * 100 : 50
  const pctB = localPoll.votes > 0 ? (localPoll.votesOptionB / localPoll.votes) * 100 : 50
  const expiring = isExpiringSoon(localPoll)

  return (
    <View style={{ height: slotHeight, justifyContent: 'center', paddingVertical: 24 }}>
      <Reanimated.View style={[{ flex: 1 }, animStyle]}>
        <GestureDetector gesture={panGesture}>
          <Card
            animatedStyle={cardInnerStyle}
            style={{ flex: 1, margin: theme.spacing.md, justifyContent: 'space-between' }}
          >
            {/* Vote overlays */}
            <Reanimated.View style={[{
              position: 'absolute', top: theme.spacing.lg, right: theme.spacing.md, zIndex: 10,
              borderWidth: 2, borderColor: theme.colors.text, padding: theme.spacing.sm,
            }, aOverlayStyle]}>
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.text, letterSpacing: 2 }}>VOTE A</Text>
            </Reanimated.View>
            <Reanimated.View style={[{
              position: 'absolute', top: theme.spacing.lg, left: theme.spacing.md, zIndex: 10,
              borderWidth: 2, borderColor: theme.colors.text, padding: theme.spacing.sm,
            }, bOverlayStyle]}>
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.text, letterSpacing: 2 }}>VOTE B</Text>
            </Reanimated.View>

            {/* Category + flame */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 3 }}>
                {localPoll.category}
              </Text>
              {expiring && <Flame size={11} color="#FF6B00" />}
            </View>

            {localPoll.isDeathmatch && (
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.text, letterSpacing: 2, marginTop: theme.spacing.xs }}>
                ⚔ DEATHMATCH
              </Text>
            )}
            {localPoll.isConfession && (
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.text, letterSpacing: 2, marginTop: theme.spacing.xs }}>
                🔒 CONFESSION
              </Text>
            )}

            {voteError && (
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.danger, letterSpacing: 1, marginTop: theme.spacing.xs }}>
                {voteError}
              </Text>
            )}

            {voted ? (
              <>
                <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 1, lineHeight: 26, marginVertical: theme.spacing.md }}>
                  {localPoll.title}
                </Text>
                <Divider />
                <PixelBar pct={pctA} label="A" />
                <PixelBar pct={pctB} label="B" />
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2, marginTop: theme.spacing.xs }}>
                  {localPoll.votes} VOTES
                </Text>
                <Divider />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginVertical: theme.spacing.sm }}>
                  <Text style={{ flex: 1, fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1 }} numberOfLines={2}>
                    {localPoll.optionA}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.textDim, letterSpacing: 2, paddingHorizontal: theme.spacing.xs }}>VS</Text>
                  <Text style={{ flex: 1, fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1, textAlign: 'right' }} numberOfLines={2}>
                    {localPoll.optionB}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 1, lineHeight: 26, marginVertical: theme.spacing.md }}>
                  {localPoll.title}
                </Text>
                <Divider />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginVertical: theme.spacing.sm }}>
                  <View style={{ flex: 1, borderWidth: theme.borderWidth, borderColor: theme.colors.borderMuted, padding: theme.spacing.sm }}>
                    <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 2 }}>A</Text>
                    <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 4, lineHeight: 16 }} numberOfLines={3}>
                      {localPoll.optionA}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.textDim, letterSpacing: 2, paddingHorizontal: theme.spacing.xs }}>VS</Text>
                  <View style={{ flex: 1, borderWidth: theme.borderWidth, borderColor: theme.colors.borderMuted, padding: theme.spacing.sm, alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 2 }}>B</Text>
                    <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 4, lineHeight: 16 }} numberOfLines={3}>
                      {localPoll.optionB}
                    </Text>
                  </View>
                </View>
                <Divider />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xs }}>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>← VOTE B</Text>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textMuted, letterSpacing: 1 }}>
                    {localPoll.timeLeft !== 'EXPIRED' ? `⏱ ${localPoll.timeLeft}` : 'EXPIRED'}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>VOTE A →</Text>
                </View>
                {localPoll.authorUsername && (
                  <Pressable onPress={() => onAuthorPress(localPoll.authorId)}>
                    <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1, textAlign: 'right', marginTop: theme.spacing.xs, textDecorationLine: 'underline' }}>
                      @{localPoll.authorUsername}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </Card>
        </GestureDetector>
      </Reanimated.View>
    </View>
  )
}

// ─────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const goToProfile = useCallback((authorId: string) => {
    navigation.navigate('PublicProfile', { userId: authorId })
  }, [navigation])
  const { user } = useAuth()
  const { polls, isLoading, isLoadingMore, error, hasMore, loadPolls, loadMore, vote } = usePolls(user!.id)
  const [filter, setFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [containerHeight, setContainerHeight] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel')
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)
  const scrollRef = useRef<any>(null)

  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y
  })

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadPolls()
    } finally {
      setRefreshing(false)
    }
  }, [loadPolls])

  const filtered = polls.filter(p => {
    const typeOk = (() => {
      if (filter === 'TRENDING') return (p.trendingScore || 0) > 0 && !p.isExpired
      if (filter === 'EXPIRED')  return p.isExpired
      if (filter === 'VOTED')    return p.isVoted
      if (filter === 'EXPIRING') return isExpiringSoon(p)
      return true
    })()
    const catOk = categoryFilter === 'ALL' || p.category === categoryFilter
    return typeOk && catOk
  })

  useEffect(() => {
    setFocusedIndex(0)
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [filter, categoryFilter])

  useEffect(() => {
    if (filtered.length > 0 && focusedIndex >= filtered.length - 3 && hasMore) {
      loadMore()
    }
  }, [focusedIndex, filtered.length, hasMore, loadMore])

  const emptyMessage = EMPTY_STATE_MESSAGES[filter] || 'NO POLLS'

  return (
    <Screen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, borderBottomWidth: theme.borderWidth, borderBottomColor: theme.colors.borderMuted }}>
        <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xl, color: theme.colors.text, letterSpacing: 8 }}>PAUL</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2 }}>
            {filtered.length > 0 && viewMode === 'carousel' ? `${focusedIndex + 1} / ${filtered.length}${hasMore ? '+' : ''}` : `${filtered.length}${hasMore ? '+' : ''}`}
          </Text>
          <TouchableOpacity onPress={() => setViewMode(m => m === 'carousel' ? 'list' : 'carousel')}>
            {viewMode === 'carousel'
              ? <List size={18} color={theme.colors.textMuted} strokeWidth={1.5} />
              : <LayoutGrid size={18} color={theme.colors.text} strokeWidth={1.5} />
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Type filter tabs */}
      <TabBar tabs={FILTER_TABS} active={filter} onSelect={f => { setFilter(f); setFocusedIndex(0) }} />

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.borderMuted }}
      >
        <Chip label="ALL" selected={categoryFilter === 'ALL'} onPress={() => setCategoryFilter('ALL')} size="sm" />
        {CATEGORIES.map(c => (
          <Chip key={c} label={c} selected={categoryFilter === c} onPress={() => setCategoryFilter(c)} size="sm" />
        ))}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md }}>
          <ActivityIndicator color={theme.colors.text} />
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4 }}>LOADING...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.lg }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.danger, letterSpacing: 2, textAlign: 'center' }}>{error}</Text>
          <Button variant="secondary" onPress={loadPolls}>RETRY</Button>
        </View>
      ) : filtered.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textDim} />}
        >
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textMuted, letterSpacing: 4 }}>{emptyMessage}</Text>
        </ScrollView>
      ) : viewMode === 'list' ? (
        // ── LIST MODE ──
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: theme.spacing.xxl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textDim} />}
          onScroll={e => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
            const nearEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 200
            if (nearEnd && hasMore) loadMore()
          }}
          scrollEventThrottle={200}
        >
          {filtered.map(p => (
            <PollRow key={p.id} poll={p} variant="profile" onAuthorPress={goToProfile} />
          ))}
          {isLoadingMore && (
            <View style={{ paddingVertical: theme.spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.textDim} size="small" />
            </View>
          )}
        </ScrollView>
      ) : (
        // ── CAROUSEL MODE ──
        <View style={{ flex: 1 }} onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}>
          {containerHeight > 0 && (
            <AnimScrollView
              ref={scrollRef}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              snapToInterval={containerHeight}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.textDim} />}
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.y / containerHeight)
                setFocusedIndex(Math.max(0, Math.min(idx, filtered.length - 1)))
              }}
            >
              {filtered.map((poll, i) => (
                <CarouselCard
                  key={poll.id}
                  poll={poll}
                  index={i}
                  scrollY={scrollY}
                  slotHeight={containerHeight}
                  isFocused={focusedIndex === i}
                  onVote={(option) => vote(poll.id, option)}
                  onAdvance={() => scrollRef.current?.scrollTo({ y: (i + 1) * containerHeight, animated: true })}
                  onAuthorPress={goToProfile}
                />
              ))}
            </AnimScrollView>
          )}
          {isLoadingMore && (
            <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.textDim} size="small" />
            </View>
          )}
        </View>
      )}
    </Screen>
  )
}
