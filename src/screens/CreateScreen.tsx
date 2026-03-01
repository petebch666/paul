import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { usePolls } from '../hooks/usePolls'

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
      // Reset form
      setTitle('')
      setOptionA('')
      setOptionB('')
      setCategory('GENERAL')
      setTimerEnabled(true)
      setTimerDuration(1440)
      Alert.alert('CREATED', 'YOUR POLL IS LIVE.')
    } catch (e) {
      setError('FAILED TO CREATE POLL. TRY AGAIN.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>CREATE POLL</Text>
          </View>

          {/* Question */}
          <Text style={styles.label}>QUESTION</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={title}
            onChangeText={setTitle}
            placeholder="WHAT DO YOU WANT TO KNOW?"
            placeholderTextColor={theme.colors.textDim}
            multiline
            numberOfLines={3}
            maxLength={200}
            returnKeyType="default"
          />
          <Text style={styles.charCount}>{title.length}/200</Text>

          {/* Options */}
          <View style={styles.optionsRow}>
            <View style={styles.optionField}>
              <Text style={styles.label}>OPTION A</Text>
              <TextInput
                style={styles.input}
                value={optionA}
                onChangeText={setOptionA}
                placeholder="OPTION A"
                placeholderTextColor={theme.colors.textDim}
                maxLength={80}
                returnKeyType="next"
              />
            </View>
            <Text style={styles.vsLabel}>VS</Text>
            <View style={styles.optionField}>
              <Text style={styles.label}>OPTION B</Text>
              <TextInput
                style={styles.input}
                value={optionB}
                onChangeText={setOptionB}
                placeholder="OPTION B"
                placeholderTextColor={theme.colors.textDim}
                maxLength={80}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Category */}
          <Text style={styles.label}>CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catChip, category === c && styles.catChipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Timer */}
          <View style={styles.timerRow}>
            <Text style={styles.label}>TIMER</Text>
            <TouchableOpacity
              style={[styles.toggle, timerEnabled && styles.toggleOn]}
              onPress={() => setTimerEnabled(t => !t)}
            >
              <Text style={[styles.toggleText, timerEnabled && styles.toggleTextOn]}>
                {timerEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {timerEnabled && (
            <View style={styles.timerChips}>
              {TIMERS.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.timerChip, timerDuration === t.value && styles.timerChipActive]}
                  onPress={() => setTimerDuration(t.value)}
                >
                  <Text style={[styles.timerChipText, timerDuration === t.value && styles.timerChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.background} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>PUBLISH POLL</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.borderMuted,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xl,
    color: theme.colors.text,
    letterSpacing: 6,
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    letterSpacing: 1,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  charCount: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    textAlign: 'right',
    letterSpacing: 1,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  optionField: {
    flex: 1,
  },
  vsLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDim,
    letterSpacing: 2,
    paddingBottom: theme.spacing.sm,
  },
  categoryScroll: {
    marginBottom: theme.spacing.xs,
  },
  catChip: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  catChipActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  catChipText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  catChipTextActive: {
    color: theme.colors.background,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  toggleOn: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  toggleText: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
  },
  toggleTextOn: {
    color: theme.colors.background,
  },
  timerChips: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  timerChip: {
    flex: 1,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
  },
  timerChipActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  timerChipText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  timerChipTextActive: {
    color: theme.colors.background,
  },
  errorBox: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.danger,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    letterSpacing: 1,
  },
  submitBtn: {
    backgroundColor: theme.colors.text,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.background,
    letterSpacing: 4,
  },
})
