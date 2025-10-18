import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { lightTheme } from '../../theme/theme';

interface CustomInputProps extends TextInputProps {
  variant?: 'outlined' | 'filled' | 'flat';
  size?: 'small' | 'medium' | 'large';
}

export default function Input({ 
  variant = 'outlined',
  size = 'medium',
  style,
  ...props 
}: CustomInputProps) {
  const getMode = () => {
    switch (variant) {
      case 'filled':
        return 'flat';
      case 'flat':
        return 'flat';
      default:
        return 'outlined';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <TextInput
      mode={getMode()}
      style={[getSizeStyle(), style]}
      outlineColor={lightTheme.colors.outline}
      activeOutlineColor={lightTheme.colors.primary}
      textColor={lightTheme.colors.onSurface}
      placeholderTextColor={lightTheme.colors.onSurfaceVariant}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    height: 40,
  },
  medium: {
    height: 48,
  },
  large: {
    height: 56,
  },
});

