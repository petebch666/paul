import React from 'react'
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Alert } from 'react-native'
import { theme } from '../../theme'
import { Poll } from '../../types'

interface PollRowProps {
  poll: Poll
  variant: 'profile' | 'admin'
  onDelete?: (pollId: string) => void
  onAuthorPress?: (authorId: string) => void
}

export function PollRow({ poll, variant, onDelete, onAuthorPress }: PollRowProps) {
  function confirmDelete() {
    Alert.alert(
      'DELETE POLL',
      `"${poll.title.substring(0, 40)}..."`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'DELETE', style: 'destructive', onPress: () => onDelete?.(poll.id) },
      ]
    )
  }

  if (variant === 'profile') {
    const pctA = poll.votes > 0 ? Math.round((poll.votesOptionA / poll.votes) * 100) : 0
    const pctB = poll.votes > 0 ? Math.round((poll.votesOptionB / poll.votes) * 100) : 0

    return (
      <View style={styles.row}>
        <View style={styles.meta}>
          <Text style={styles.category}>{poll.category}</Text>
          <Text style={styles.time}>{poll.isExpired ? 'ENDED' : poll.timeLeft}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{poll.title}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>A {pctA}%</Text>
          <Text style={styles.votes}>{poll.votes} VOTES</Text>
          <Text style={styles.stat}>B {pctB}%</Text>
        </View>
        {poll.authorUsername && onAuthorPress ? (
          <Pressable onPress={() => onAuthorPress(poll.authorId)} style={{ marginTop: 4 }}>
            <Text style={[styles.author, { textDecorationLine: 'underline' }]}>@{poll.authorUsername}</Text>
          </Pressable>
        ) : poll.authorUsername ? (
          <Text style={[styles.author, { marginTop: 4 }]}>@{poll.authorUsername}</Text>
        ) : null}
      </View>
    )
  }

  // admin variant
  return (
    <View style={styles.row}>
      <View style={styles.meta}>
        <Text style={styles.category}>{poll.category}</Text>
        <Text style={styles.votes}>{poll.votes} VOTES</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{poll.title}</Text>
      <View style={styles.adminFooter}>
        {poll.authorUsername && onAuthorPress ? (
          <Pressable onPress={() => onAuthorPress(poll.authorId)}>
            <Text style={[styles.author, { textDecorationLine: 'underline' }]}>@{poll.authorUsername}</Text>
          </Pressable>
        ) : (
          <Text style={styles.author}>@{poll.authorUsername || 'unknown'}</Text>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <Text style={styles.deleteBtnText}>DELETE</Text>
          </TouchableOpacity>
        )}
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
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 2,
  },
  time: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
  },
  title: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    letterSpacing: 1,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  stat: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    letterSpacing: 1,
  },
  votes: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  adminFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  author: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.textDim,
    letterSpacing: 1,
  },
  deleteBtn: {
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  deleteBtnText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xxs,
    color: theme.colors.danger,
    letterSpacing: 1,
  },
})
