import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { usePolls } from '../hooks/usePolls'
import { useFriends } from '../hooks/useFriends'
import { CATEGORIES } from '../constants/categories'
import { Screen, Input, Chip, Button, ErrorBox, SectionHeader, Divider } from '../components/ui'
import { createNotification } from '../database/supabase-api'
import { User } from '../types'

const TIMERS = [
  { label: '30M', value: 30 },
  { label: '1H', value: 60 },
  { label: '6H', value: 360 },
  { label: '24H', value: 1440 },
  { label: '7D', value: 10080 },
]

export default function CreateScreen() {
  const { user } = useAuth()
  const { submitPoll } = usePolls(user!.id)
  const { mutualFollows, isLoadingMutuals, loadMutualFollows } = useFriends(user!.id)

  const [title, setTitle] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerDuration, setTimerDuration] = useState(1440)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submittedTitle, setSubmittedTitle] = useState('')
  const [isChallengeSent, setIsChallengeSent] = useState(false)

  // Deathmatch state
  const [isDeathmatch, setIsDeathmatch] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null)
  const [friendSearch, setFriendSearch] = useState('')

  useEffect(() => {
    if (isDeathmatch) {
      loadMutualFollows()
    }
  }, [isDeathmatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredFriends = mutualFollows.filter(f =>
    f.username.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.name.toLowerCase().includes(friendSearch.toLowerCase())
  )

  function validate(): string | null {
    if (!title.trim() || title.trim().length < 5) return 'QUESTION TOO SHORT (MIN 5 CHARS)'
    if (!optionA.trim() || optionA.trim().length < 1) return isDeathmatch ? 'YOUR OPTION IS REQUIRED' : 'OPTION A IS REQUIRED'
    if (!optionB.trim() || optionB.trim().length < 1) return isDeathmatch ? "OPPONENT'S OPTION IS REQUIRED" : 'OPTION B IS REQUIRED'
    if (optionA.trim().toLowerCase() === optionB.trim().toLowerCase()) return 'OPTIONS MUST BE DIFFERENT'
    if (isDeathmatch && !selectedOpponent) return 'SELECT AN OPPONENT TO CHALLENGE'
    return null
  }

  async function handleCreate() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const poll = await submitPoll(
        {
          title: title.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          category,
          timerEnabled: isDeathmatch ? true : timerEnabled,
          timerDuration: isDeathmatch ? timerDuration : (timerEnabled ? timerDuration : undefined),
          isDeathmatch,
          optionAUserId: isDeathmatch ? user!.id : undefined,
          optionBUserId: isDeathmatch && selectedOpponent ? selectedOpponent.id : undefined,
          isConfession: false,
        },
        { id: user!.id, name: user!.name, username: user!.username }
      )

      if (isDeathmatch && selectedOpponent && poll?.id) {
        await createNotification(
          selectedOpponent.id,
          poll.id,
          'deathmatch_created',
          `${user!.username.toUpperCase()} CHALLENGED YOU TO A DEATHMATCH: "${title.trim()}"`
        )
        setIsChallengeSent(true)
      }

      setSubmittedTitle(title.trim())
      setSubmitted(true)
    } catch {
      setError('FAILED TO CREATE POLL. TRY AGAIN.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCreateAnother() {
    setTitle('')
    setOptionA('')
    setOptionB('')
    setCategory('GENERAL')
    setTimerEnabled(true)
    setTimerDuration(1440)
    setError(null)
    setSubmitted(false)
    setSubmittedTitle('')
    setIsDeathmatch(false)
    setSelectedOpponent(null)
    setFriendSearch('')
    setIsChallengeSent(false)
  }

  if (submitted) {
    return (
      <Screen>
        <SectionHeader title="CREATE POLL" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xxl, gap: theme.spacing.lg }}>
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xl, color: theme.colors.text, letterSpacing: 4, textAlign: 'center' }}>
            {isChallengeSent ? 'CHALLENGE SENT' : 'UNDER REVIEW'}
          </Text>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2, textAlign: 'center', lineHeight: 18 }}>
            "{submittedTitle}"
          </Text>
          {isChallengeSent ? (
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textDim, letterSpacing: 1, textAlign: 'center', lineHeight: 18 }}>
              YOUR DEATHMATCH CHALLENGE HAS BEEN SENT TO {selectedOpponent?.username.toUpperCase()}. THE POLL GOES LIVE WHEN THEY ACCEPT.
            </Text>
          ) : (
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textDim, letterSpacing: 1, textAlign: 'center', lineHeight: 18 }}>
              YOUR POLL IS BEING REVIEWED FOR CONTENT. IT WILL GO LIVE ONCE APPROVED.
            </Text>
          )}
          <View style={{ width: '100%', gap: theme.spacing.sm }}>
            <Button variant="primary" fullWidth onPress={handleCreateAnother}>
              CREATE ANOTHER
            </Button>
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <Screen keyboardAvoiding>
      <SectionHeader title="CREATE POLL" />

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question */}
        <Input
          label="QUESTION"
          value={title}
          onChangeText={setTitle}
          placeholder="WHAT DO YOU WANT TO KNOW?"
          multiline
          numberOfLines={3}
          maxLength={200}
          charCount={{ current: title.length, max: 200 }}
        />

        {/* Options */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
          <View style={{ flex: 1 }}>
            <Input
              label={isDeathmatch ? 'YOUR OPTION' : 'OPTION A'}
              value={optionA}
              onChangeText={setOptionA}
              placeholder={isDeathmatch ? 'YOUR OPTION' : 'OPTION A'}
              maxLength={80}
              returnKeyType="next"
            />
          </View>
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.textDim, letterSpacing: 2, paddingBottom: theme.spacing.sm }}>
            VS
          </Text>
          <View style={{ flex: 1 }}>
            <Input
              label={isDeathmatch ? 'THEIR OPTION' : 'OPTION B'}
              value={optionB}
              onChangeText={setOptionB}
              placeholder={isDeathmatch ? 'THEIR OPTION' : 'OPTION B'}
              maxLength={80}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Category */}
        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
          CATEGORY
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {CATEGORIES.map(c => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Deathmatch toggle */}
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2 }}>
              DEATHMATCH
            </Text>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>
              1V1 CHALLENGE A FRIEND
            </Text>
          </View>
          <Chip
            label={isDeathmatch ? 'ON' : 'OFF'}
            selected={isDeathmatch}
            onPress={() => {
              setIsDeathmatch(d => !d)
              setSelectedOpponent(null)
              setFriendSearch('')
            }}
            size="md"
          />
        </View>

        {/* Deathmatch friend picker */}
        {isDeathmatch && (
          <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2 }}>
              CHALLENGE A FRIEND
            </Text>

            {selectedOpponent ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: theme.borderWidth,
                borderColor: theme.colors.border,
                padding: theme.spacing.sm,
                gap: theme.spacing.sm,
              }}>
                <Text style={{ fontSize: 20 }}>{selectedOpponent.avatar}</Text>
                <Text style={{ flex: 1, fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.text, letterSpacing: 1 }}>
                  @{selectedOpponent.username}
                </Text>
                <TouchableOpacity onPress={() => setSelectedOpponent(null)}>
                  <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 1 }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isLoadingMutuals ? (
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textDim, letterSpacing: 2 }}>
                LOADING FRIENDS...
              </Text>
            ) : mutualFollows.length === 0 ? (
              <View style={{ borderWidth: theme.borderWidth, borderColor: theme.colors.borderMuted, padding: theme.spacing.md }}>
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2, textAlign: 'center' }}>
                  ADD FRIENDS TO CHALLENGE THEM
                </Text>
                <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1, textAlign: 'center', marginTop: theme.spacing.xs }}>
                  MUTUAL FOLLOWS CAN BE CHALLENGED. FOLLOW SOMEONE AND HAVE THEM FOLLOW BACK.
                </Text>
              </View>
            ) : (
              <>
                <Input
                  label=""
                  value={friendSearch}
                  onChangeText={setFriendSearch}
                  placeholder="SEARCH FRIENDS..."
                />
                <View style={{ gap: theme.spacing.xs }}>
                  {filteredFriends.map(friend => (
                    <TouchableOpacity
                      key={friend.id}
                      onPress={() => {
                        setSelectedOpponent(friend)
                        setFriendSearch('')
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: theme.borderWidth,
                        borderColor: theme.colors.borderMuted,
                        padding: theme.spacing.sm,
                        gap: theme.spacing.sm,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{friend.avatar}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xs, color: theme.colors.text, letterSpacing: 1 }}>
                          @{friend.username}
                        </Text>
                        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>
                          {friend.reputation} REP
                        </Text>
                      </View>
                      <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xxs, color: theme.colors.textDim, letterSpacing: 1 }}>
                        CHALLENGE →
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {filteredFriends.length === 0 && friendSearch.length > 0 && (
                    <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textDim, letterSpacing: 2, textAlign: 'center', padding: theme.spacing.sm }}>
                      NO MATCHES
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* Timer */}
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2 }}>
            TIMER
          </Text>
          <Chip
            label={isDeathmatch || timerEnabled ? 'ON' : 'OFF'}
            selected={isDeathmatch || timerEnabled}
            onPress={() => !isDeathmatch && setTimerEnabled(t => !t)}
            size="md"
          />
        </View>

        {(timerEnabled || isDeathmatch) && (
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
            {TIMERS.map(t => (
              <Chip
                key={t.value}
                label={t.label}
                selected={timerDuration === t.value}
                onPress={() => setTimerDuration(t.value)}
                flex
              />
            ))}
          </View>
        )}

        {error ? <ErrorBox message={error} /> : null}

        <View style={{ marginTop: theme.spacing.xl }}>
          <Button variant="primary" fullWidth loading={isSubmitting} onPress={handleCreate}>
            {isDeathmatch ? 'SEND CHALLENGE' : 'PUBLISH POLL'}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  )
}
