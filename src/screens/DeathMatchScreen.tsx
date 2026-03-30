import React from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { useDeathmatch } from '../hooks/useDeathmatch'
import { Screen, Button, PixelBar, SectionHeader, ErrorBox, Divider } from '../components/ui'

type DeathmatchBattleRouteProp = RouteProp<RootStackParamList, 'DeathmatchBattle'>

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function DeathMatchScreen() {
  const route = useRoute<DeathmatchBattleRouteProp>()
  const navigation = useNavigation()
  const { user } = useAuth()
  const { pollId } = route.params

  const {
    poll,
    playerA,
    playerB,
    percentA,
    percentB,
    timeLeft,
    isExpired,
    hasVoted,
    userVote,
    isLoading,
    error,
    vote,
  } = useDeathmatch(pollId, user?.id || '')

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.text} />
        </View>
      </Screen>
    )
  }

  if (error || !poll || !playerA || !playerB) {
    return (
      <Screen>
        <SectionHeader title="DEATHMATCH" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md }}>
          <ErrorBox message={error || 'BATTLE NOT FOUND'} />
          <Button variant="ghost" onPress={() => navigation.goBack()}>GO BACK</Button>
        </View>
      </Screen>
    )
  }

  const total = poll.votesOptionA + poll.votesOptionB

  // Determine winner
  let winnerLabel: string | null = null
  if (isExpired) {
    if (poll.votesOptionA > poll.votesOptionB) {
      winnerLabel = `WINNER: @${playerA.username}`
    } else if (poll.votesOptionB > poll.votesOptionA) {
      winnerLabel = `WINNER: @${playerB.username}`
    } else {
      winnerLabel = 'DRAW'
    }
  }

  return (
    <Screen>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: theme.borderWidth,
        borderBottomColor: theme.colors.borderMuted,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.textDim, letterSpacing: 1 }}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.danger, letterSpacing: 4 }}>
            ⚔ DEATHMATCH
          </Text>
        </View>
        {isExpired ? (
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xs, color: theme.colors.textDim, letterSpacing: 2 }}>
            ENDED
          </Text>
        ) : (
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.md, color: timeLeft < 60 ? theme.colors.danger : theme.colors.text, letterSpacing: 2 }}>
            {formatTime(timeLeft)}
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl }}>

        {/* Poll title */}
        <Text style={{
          fontFamily: theme.fonts.bold,
          fontSize: theme.fontSize.lg,
          color: theme.colors.text,
          letterSpacing: 1,
          lineHeight: 26,
          textAlign: 'center',
        }}>
          {poll.title}
        </Text>

        <Divider />

        {/* Players head-to-head */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {/* Player A */}
          <View style={{
            flex: 1,
            borderWidth: theme.borderWidth,
            borderColor: userVote === 'A' ? theme.colors.border : theme.colors.borderMuted,
            padding: theme.spacing.md,
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}>
            <Text style={{ fontSize: 28 }}>{playerA.avatar}</Text>
            <Text style={{
              fontFamily: theme.fonts.bold,
              fontSize: theme.fontSize.xs,
              color: theme.colors.text,
              letterSpacing: 2,
            }}>
              @{playerA.username}
            </Text>
            <Text style={{
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSize.xxs,
              color: theme.colors.textDim,
              letterSpacing: 2,
              textAlign: 'center',
            }}>
              OPTION A
            </Text>
            <Text style={{
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSize.xs,
              color: theme.colors.textMuted,
              letterSpacing: 1,
              textAlign: 'center',
              lineHeight: 16,
            }}>
              {poll.optionA}
            </Text>
          </View>

          {/* VS divider */}
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xs }}>
            <Text style={{
              fontFamily: theme.fonts.bold,
              fontSize: theme.fontSize.md,
              color: theme.colors.textDim,
              letterSpacing: 2,
            }}>
              VS
            </Text>
          </View>

          {/* Player B */}
          <View style={{
            flex: 1,
            borderWidth: theme.borderWidth,
            borderColor: userVote === 'B' ? theme.colors.border : theme.colors.borderMuted,
            padding: theme.spacing.md,
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}>
            <Text style={{ fontSize: 28 }}>{playerB.avatar}</Text>
            <Text style={{
              fontFamily: theme.fonts.bold,
              fontSize: theme.fontSize.xs,
              color: theme.colors.text,
              letterSpacing: 2,
            }}>
              @{playerB.username}
            </Text>
            <Text style={{
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSize.xxs,
              color: theme.colors.textDim,
              letterSpacing: 2,
              textAlign: 'center',
            }}>
              OPTION B
            </Text>
            <Text style={{
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSize.xs,
              color: theme.colors.textMuted,
              letterSpacing: 1,
              textAlign: 'center',
              lineHeight: 16,
            }}>
              {poll.optionB}
            </Text>
          </View>
        </View>

        {/* Vote bars */}
        <View style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.text, letterSpacing: 2 }}>
              {Math.round(percentA)}%
            </Text>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 2 }}>
              {total} VOTES
            </Text>
            <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxs, color: theme.colors.text, letterSpacing: 2 }}>
              {Math.round(percentB)}%
            </Text>
          </View>
          <PixelBar pct={percentA} label="A" />
          <PixelBar pct={percentB} label="B" />
        </View>

        <Divider />

        {/* Winner banner or vote buttons */}
        {isExpired ? (
          <View style={{
            borderWidth: 2,
            borderColor: theme.colors.border,
            padding: theme.spacing.lg,
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}>
            <Text style={{
              fontFamily: theme.fonts.bold,
              fontSize: theme.fontSize.xl,
              color: theme.colors.text,
              letterSpacing: 4,
            }}>
              {winnerLabel}
            </Text>
            {winnerLabel !== 'DRAW' && (
              <Text style={{
                fontFamily: theme.fonts.regular,
                fontSize: theme.fontSize.xxs,
                color: theme.colors.textDim,
                letterSpacing: 2,
              }}>
                +10 REPUTATION
              </Text>
            )}
          </View>
        ) : hasVoted ? (
          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
            <Text style={{
              fontFamily: theme.fonts.bold,
              fontSize: theme.fontSize.sm,
              color: theme.colors.text,
              letterSpacing: 3,
            }}>
              YOU VOTED {userVote}
            </Text>
            <Text style={{
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSize.xxs,
              color: theme.colors.textDim,
              letterSpacing: 2,
            }}>
              SCOREBOARD UPDATES LIVE
            </Text>
          </View>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={{
              fontFamily: theme.fonts.regular,
              fontSize: theme.fontSize.xxs,
              color: theme.colors.textDim,
              letterSpacing: 3,
              textAlign: 'center',
            }}>
              CAST YOUR VOTE
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button variant="primary" fullWidth onPress={() => vote('A')}>
                  VOTE A
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button variant="primary" fullWidth onPress={() => vote('B')}>
                  VOTE B
                </Button>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}
