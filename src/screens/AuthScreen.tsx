import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { Screen, Button, Input, ErrorBox, Chip } from '../components/ui'

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
          keyboardType="email-address"
          returnKeyType="next"
        />

        <Input
          label="PASSWORD"
          value={password}
          onChangeText={setPassword}
          placeholder="PASSWORD"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {error ? <ErrorBox message={error} /> : null}

        <View style={{ marginTop: theme.spacing.xl }}>
          <Button variant="primary" fullWidth loading={isLoading} onPress={handleSubmit}>
            {mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </Button>
        </View>
      </View>
    </Screen>
  )
}
