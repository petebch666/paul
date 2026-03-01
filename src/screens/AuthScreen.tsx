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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'

type Mode = 'login' | 'signup'

export default function AuthScreen() {
  const { login, signup, isLoading, error, clearError } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function switchMode(next: Mode) {
    clearError()
    setName('')
    setUsername('')
    setEmail('')
    setPassword('')
    setMode(next)
  }

  async function handleSubmit() {
    if (mode === 'login') {
      await login(email.trim(), password)
    } else {
      await signup(name.trim(), username.trim(), email.trim(), password)
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
          {/* Logo */}
          <View style={styles.header}>
            <Text style={styles.logo}>PAUL</Text>
            <Text style={styles.tagline}>VOTE. DEBATE. WIN.</Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                LOGIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'signup' && styles.modeBtnActive]}
              onPress={() => switchMode('signup')}
            >
              <Text style={[styles.modeBtnText, mode === 'signup' && styles.modeBtnTextActive]}>
                SIGN UP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <>
                <Text style={styles.label}>NAME</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="YOUR NAME"
                  placeholderTextColor={theme.colors.textDim}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={t => setUsername(t.toLowerCase())}
                  placeholder="USERNAME"
                  placeholderTextColor={theme.colors.textDim}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </>
            )}

            <Text style={styles.label}>{mode === 'login' ? 'EMAIL OR USERNAME' : 'EMAIL'}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={mode === 'login' ? 'EMAIL OR USERNAME' : 'EMAIL ADDRESS'}
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="PASSWORD"
              placeholderTextColor={theme.colors.textDim}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.background} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xxxl,
    color: theme.colors.text,
    letterSpacing: 12,
  },
  tagline: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 4,
    marginTop: theme.spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: theme.colors.text,
  },
  modeBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 2,
  },
  modeBtnTextActive: {
    color: theme.colors.background,
  },
  form: {
    gap: theme.spacing.xs,
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
    letterSpacing: 3,
  },
})
