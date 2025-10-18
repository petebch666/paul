import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { lightTheme } from '../../theme/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function Loading({ message = 'Loading...', size = 'large' }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={lightTheme.colors.primary}
        style={styles.spinner}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.background,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: lightTheme.colors.onBackground,
    fontFamily: 'System',
  },
});

