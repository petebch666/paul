import React, { useState } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { usePolls } from '../hooks/usePolls'
import { Screen, Input, Chip, Button, ErrorBox, SectionHeader, Divider } from '../components/ui'

const CATEGORIES = [
  'GENERAL', 'SPORTS', 'MUSIC', 'TECH', 'FOOD',
  'MOVIES', 'POLITICS', 'SCIENCE', 'GAMING', 'OTHER',
]

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

  const [title, setTitle] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerDuration, setTimerDuration] = useState(1440)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    if (!title.trim() || title.trim().length < 5) return 'QUESTION TOO SHORT (MIN 5 CHARS)'
    if (!optionA.trim() || optionA.trim().length < 1) return 'OPTION A IS REQUIRED'
    if (!optionB.trim() || optionB.trim().length < 1) return 'OPTION B IS REQUIRED'
    if (optionA.trim().toLowerCase() === optionB.trim().toLowerCase()) return 'OPTIONS MUST BE DIFFERENT'
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
      await submitPoll(
        {
          title: title.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          category,
          timerEnabled,
          timerDuration: timerEnabled ? timerDuration : undefined,
          isDeathmatch: false,
          isConfession: false,
        },
        { id: user!.id, name: user!.name, username: user!.username }
      )
      setTitle('')
      setOptionA('')
      setOptionB('')
      setCategory('GENERAL')
      setTimerEnabled(true)
      setTimerDuration(1440)
      Alert.alert('CREATED', 'YOUR POLL IS LIVE.')
    } catch {
      setError('FAILED TO CREATE POLL. TRY AGAIN.')
    } finally {
      setIsSubmitting(false)
    }
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
              label="OPTION A"
              value={optionA}
              onChangeText={setOptionA}
              placeholder="OPTION A"
              maxLength={80}
              returnKeyType="next"
            />
          </View>
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.sm, color: theme.colors.textDim, letterSpacing: 2, paddingBottom: theme.spacing.sm }}>
            VS
          </Text>
          <View style={{ flex: 1 }}>
            <Input
              label="OPTION B"
              value={optionB}
              onChangeText={setOptionB}
              placeholder="OPTION B"
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

        {/* Timer */}
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 2 }}>
            TIMER
          </Text>
          <Chip
            label={timerEnabled ? 'ON' : 'OFF'}
            selected={timerEnabled}
            onPress={() => setTimerEnabled(t => !t)}
            size="md"
          />
        </View>

        {timerEnabled && (
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
            PUBLISH POLL
          </Button>
        </View>
      </ScrollView>
    </Screen>
  )
}
