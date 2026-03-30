import React, { useCallback } from 'react'
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { PollNotification, Poll } from '../types'
import { Screen, SectionHeader, Button, ErrorBox } from '../components/ui'

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffM = Math.floor(diffMs / (1000 * 60))
  const diffH = Math.floor(diffM / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffD > 0) return `${diffD}D AGO`
  if (diffH > 0) return `${diffH}H AGO`
  if (diffM > 0) return `${diffM}M AGO`
  return 'JUST NOW'
}

interface ChallengeCardProps {
  poll: Poll
  onAccept: () => void
  onReject: () => void
  isActing: boolean
}

function ChallengeCard({ poll, onAccept, onReject, isActing }: ChallengeCardProps) {
  return (
    <View style={{
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{
          fontFamily: theme.fonts.bold,
          fontSize: theme.fontSize.xxs,
          color: theme.colors.danger,
          letterSpacing: 3,
        }}>
          DEATHMATCH CHALLENGE
        </Text>
        <Text style={{
          fontFamily: theme.fonts.regular,
          fontSize: theme.fontSize.xxs,
          color: theme.colors.textDim,
          letterSpacing: 1,
        }}>
          {formatTimeAgo(poll.createdAt)}
        </Text>
      </View>
      <Text style={{
        fontFamily: theme.fonts.regular,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        letterSpacing: 1,
        lineHeight: 18,
      }}>
        {poll.title}
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        <View style={{
          flex: 1,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.borderMuted,
          padding: theme.spacing.xs,
        }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>
            THEIR OPTION
          </Text>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1, marginTop: 2 }}>
            {poll.optionA}
          </Text>
        </View>
        <View style={{
          flex: 1,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          padding: theme.spacing.xs,
        }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>
            YOUR OPTION
          </Text>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.text, letterSpacing: 1, marginTop: 2 }}>
            {poll.optionB}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            variant="primary"
            fullWidth
            loading={isActing}
            onPress={onAccept}
          >
            ACCEPT
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            variant="ghost"
            fullWidth
            loading={isActing}
            onPress={onReject}
          >
            REJECT
          </Button>
        </View>
      </View>
    </View>
  )
}

interface NotificationRowProps {
  notification: PollNotification
  onPress?: () => void
}

function NotificationRow({ notification, onPress }: NotificationRowProps) {
  const isUnread = !notification.isRead
  const inner = (
    <View style={{
      borderWidth: theme.borderWidth,
      borderColor: isUnread ? theme.colors.borderMuted : theme.colors.textDim,
      borderLeftWidth: isUnread ? 2 : 1,
      borderLeftColor: isUnread ? theme.colors.text : theme.colors.textDim,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    }}>
      <Text style={{
        flex: 1,
        fontFamily: theme.fonts.regular,
        fontSize: theme.fontSize.xs,
        color: isUnread ? theme.colors.text : theme.colors.textMuted,
        letterSpacing: 1,
        lineHeight: 16,
      }}>
        {notification.message}
      </Text>
      <Text style={{
        fontFamily: theme.fonts.regular,
        fontSize: theme.fontSize.xxs,
        color: theme.colors.textDim,
        letterSpacing: 1,
        flexShrink: 0,
      }}>
        {formatTimeAgo(notification.createdAt)}
      </Text>
    </View>
  )

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{inner}</TouchableOpacity>
  }
  return inner
}

export default function NotificationsScreen() {
  const { user } = useAuth()
  const userId = user?.id || ''
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    pendingChallenges,
    loadNotifications,
    markAllRead,
    acceptChallenge,
    rejectChallenge,
  } = useNotifications(userId)

  const [actingPollId, setActingPollId] = React.useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      if (!userId) return
      loadNotifications(true)
      const timer = setTimeout(() => markAllRead(), 800)
      return () => clearTimeout(timer)
    }, [userId, loadNotifications, markAllRead])
  )

  async function handleAccept(poll: Poll) {
    if (!poll.authorId || actingPollId) return
    setActingPollId(poll.id)
    try {
      await acceptChallenge(poll.id, poll.authorId)
      navigation.navigate('DeathmatchBattle', { pollId: poll.id })
    } finally {
      setActingPollId(null)
    }
  }

  async function handleReject(poll: Poll) {
    if (!poll.authorId || actingPollId) return
    setActingPollId(poll.id)
    try {
      await rejectChallenge(poll.id, poll.authorId)
    } finally {
      setActingPollId(null)
    }
  }

  // Filter out notifications for polls that have a pending challenge card
  const pendingPollIds = new Set(pendingChallenges.map(p => p.id))
  const regularNotifications = notifications.filter(
    n => !(n.type === 'deathmatch_created' && pendingPollIds.has(n.pollId))
  )

  const isEmpty = pendingChallenges.length === 0 && regularNotifications.length === 0

  return (
    <Screen>
      <SectionHeader title={unreadCount > 0 ? `INBOX (${unreadCount})` : 'INBOX'} />

      {isLoading && notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.text} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md }}>
          <ErrorBox message={error} />
          <Button variant="ghost" onPress={() => loadNotifications(true)}>RETRY</Button>
        </View>
      ) : isEmpty ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xxl }}>
          <Text style={{
            fontFamily: theme.fonts.regular,
            fontSize: theme.fontSize.sm,
            color: theme.colors.textMuted,
            letterSpacing: 4,
            textAlign: 'center',
          }}>
            NO NOTIFICATIONS YET
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
          onScroll={e => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
            const nearEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 200
            if (nearEnd && hasMore && !isLoading) loadNotifications()
          }}
          scrollEventThrottle={200}
        >
          {/* Pending challenge cards */}
          {pendingChallenges.length > 0 && (
            <View style={{ marginBottom: theme.spacing.md }}>
              <Text style={{
                fontFamily: theme.fonts.regular,
                fontSize: theme.fontSize.xxs,
                color: theme.colors.textDim,
                letterSpacing: 3,
                marginBottom: theme.spacing.sm,
              }}>
                CHALLENGES AWAITING RESPONSE
              </Text>
              {pendingChallenges.map(poll => (
                <ChallengeCard
                  key={poll.id}
                  poll={poll}
                  onAccept={() => handleAccept(poll)}
                  onReject={() => handleReject(poll)}
                  isActing={actingPollId === poll.id}
                />
              ))}
            </View>
          )}

          {/* Regular notifications */}
          {regularNotifications.length > 0 && (
            <View>
              {pendingChallenges.length > 0 && (
                <Text style={{
                  fontFamily: theme.fonts.regular,
                  fontSize: theme.fontSize.xxs,
                  color: theme.colors.textDim,
                  letterSpacing: 3,
                  marginBottom: theme.spacing.sm,
                }}>
                  RECENT
                </Text>
              )}
              {regularNotifications.map(n => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onPress={
                    (n.type === 'deathmatch_accepted' || n.type === 'deathmatch_result') && n.pollId
                      ? () => navigation.navigate('DeathmatchBattle', { pollId: n.pollId })
                      : undefined
                  }
                />
              ))}
              {hasMore && (
                <Button
                  variant="ghost"
                  fullWidth
                  loading={isLoading}
                  onPress={() => loadNotifications()}
                >
                  LOAD MORE
                </Button>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  )
}
