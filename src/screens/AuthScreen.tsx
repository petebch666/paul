import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../database/supabase'
import { Screen, Button, Input, ErrorBox, Chip } from '../components/ui'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthScreen() {
  const { login, signup, isLoading, error, clearError } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  function switchMode(next: Mode) {
    clearError()
    setLocalError(null)
    setForgotSent(false)
    setName('')
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMode(next)
  }

  async function handleSubmit() {
    setLocalError(null)
    if (mode === 'login') {
      await login(email.trim(), password)
    } else if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('PASSWORDS DO NOT MATCH')
        return
      }
      await signup(name.trim(), username.trim(), email.trim(), password)
    }
  }

  async function handleForgotPassword() {
    const trimmed = email.trim()
    if (!trimmed) {
      setLocalError('ENTER YOUR EMAIL FIRST')
      return
    }
    setForgotLoading(true)
    setLocalError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed)
    setForgotLoading(false)
    if (err) {
      setLocalError(err.message.toUpperCase())
    } else {
      setForgotSent(true)
    }
  }

  const displayError = localError || error

  if (mode === 'forgot') {
    return (
      <Screen scroll keyboardAvoiding padding>
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
          <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxxl, color: theme.colors.text, letterSpacing: 12 }}>
            PAUL
          </Text>
        </View>

        <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.lg, color: theme.colors.text, letterSpacing: 4, marginBottom: theme.spacing.md }}>
          RESET PASSWORD
        </Text>

        {forgotSent ? (
          <View style={{ gap: theme.spacing.md }}>
            <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.sm, color: theme.colors.success, letterSpacing: 2, lineHeight: 20 }}>
              RESET LINK SENT. CHECK YOUR EMAIL.
            </Text>
            <Button variant="secondary" fullWidth onPress={() => switchMode('login')}>
              BACK TO LOGIN
            </Button>
          </View>
        ) : (
          <View style={{ gap: theme.spacing.xs }}>
            <Input
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="YOUR EMAIL ADDRESS"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleForgotPassword}
            />
            {displayError ? <ErrorBox message={displayError} /> : null}
            <View style={{ marginTop: theme.spacing.xl }}>
              <Button variant="primary" fullWidth loading={forgotLoading} onPress={handleForgotPassword}>
                SEND RESET LINK
              </Button>
            </View>
            <View style={{ marginTop: theme.spacing.sm }}>
              <Button variant="ghost" fullWidth onPress={() => switchMode('login')}>
                BACK TO LOGIN
              </Button>
            </View>
          </View>
        )}
      </Screen>
    )
  }

  return (
    <Screen scroll keyboardAvoiding padding>
      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
        <Text style={{ fontFamily: theme.fonts.bold, fontSize: theme.fontSize.xxxl, color: theme.colors.text, letterSpacing: 12 }}>
          PAUL
        </Text>
        <Text style={{ fontFamily: theme.fonts.regular, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, letterSpacing: 4, marginTop: theme.spacing.sm }}>
          VOTE. DEBATE. WIN.
        </Text>
      </View>

      {/* Mode toggle */}
      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.xl }}>
        <Chip label="LOGIN" selected={mode === 'login'} onPress={() => switchMode('login')} flex size="md" />
        <Chip label="SIGN UP" selected={mode === 'signup'} onPress={() => switchMode('signup')} flex size="md" />
      </View>

      {/* Form */}
      <View style={{ gap: theme.spacing.xs }}>
        {mode === 'signup' && (
          <>
            <Input
              label="NAME"
              value={name}
              onChangeText={setName}
              placeholder="YOUR NAME"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Input
              label="USERNAME"
              value={username}
              onChangeText={t => setUsername(t.toLowerCase())}
              placeholder="USERNAME"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </>
        )}

        <Input
          label={mode === 'login' ? 'EMAIL OR USERNAME' : 'EMAIL'}
          value={email}
          onChangeText={setEmail}
          placeholder={mode === 'login' ? 'EMAIL OR USERNAME' : 'EMAIL ADDRESS'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={mode === 'login' ? 'default' : 'email-address'}
          returnKeyType="next"
        />

        <Input
          label="PASSWORD"
          value={password}
          onChangeText={setPassword}
          placeholder="PASSWORD"
          secureTextEntry
          returnKeyType={mode === 'signup' ? 'next' : 'done'}
          onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
        />

        {mode === 'signup' && (
          <Input
            label="CONFIRM PASSWORD"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="CONFIRM PASSWORD"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        )}

        {displayError ? <ErrorBox message={displayError} /> : null}

        <View style={{ marginTop: theme.spacing.xl }}>
          <Button variant="primary" fullWidth loading={isLoading} onPress={handleSubmit}>
            {mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </Button>
        </View>

        {mode === 'login' && (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Button variant="ghost" fullWidth onPress={() => switchMode('forgot')}>
              FORGOT PASSWORD?
            </Button>
          </View>
        )}
      </View>
    </Screen>
  )
}
