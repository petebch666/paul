import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { theme } from '../../theme'
import { User } from '../../types'

interface UserRowProps {
  user: User
  onStatusChange: (userId: string, status: 'active' | 'suspended' | 'banned', reason: string) => void
  onRoleChange: (userId: string, role: 'user' | 'admin') => void
}

export function UserRow({ user, onStatusChange, onRoleChange }: UserRowProps) {
  function confirmStatusChange(status: 'active' | 'suspended' | 'banned') {
    Alert.prompt(
      status.toUpperCase(),
      `REASON FOR ${status.toUpperCase()}:`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'CONFIRM',
          onPress: (reason: string | undefined) => onStatusChange(user.id, status, reason || ''),
        },
      ],
      'plain-text'
    )
  }

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.avatar}>{user.avatar}</Text>
        <View>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>
            {user.role?.toUpperCase() || 'USER'} · {(user.status || 'ACTIVE').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        {user.status !== 'active' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen]}
            onPress={() => onStatusChange(user.id, 'active', 'reinstated')}
          >
            <Text style={styles.btnText}>RESTORE</Text>
          </TouchableOpacity>
        )}
        {user.status === 'active' && (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => confirmStatusChange('suspended')}
          >
            <Text style={styles.btnText}>SUSPEND</Text>
          </TouchableOpacity>
        )}
        {user.status !== 'banned' && (
          <TouchableOpacity
            style={[styles.btn, styles.btnRed]}
            onPress={() => confirmStatusChange('banned')}
          >
            <Text style={[styles.btnText, styles.btnTextRed]}>BAN</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
        >
          <Text style={styles.btnText}>
            {user.role === 'admin' ? 'DEMOTE' : 'PROMOTE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    fontSize: 24,
  },
  username: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  name: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  meta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  btn: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.borderMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  btnRed: {
    borderColor: theme.colors.danger,
  },
  btnGreen: {
    borderColor: theme.colors.success,
  },
  btnText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  btnTextRed: {
    color: theme.colors.danger,
  },
})
