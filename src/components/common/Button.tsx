import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { lightTheme } from '../../theme/theme';

interface CustomButtonProps extends Omit<ButtonProps, 'mode'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({ 
  variant = 'primary', 
  size = 'medium',
  style,
  ...props 
}: CustomButtonProps) {
  const getMode = () => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained-tonal';
      case 'outline':
        return 'outlined';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return lightTheme.colors.primary;
      case 'secondary':
        return lightTheme.colors.secondary;
      case 'outline':
        return lightTheme.colors.primary;
      default:
        return lightTheme.colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return lightTheme.colors.onPrimary;
      case 'secondary':
        return lightTheme.colors.onSecondary;
      case 'outline':
        return lightTheme.colors.primary;
      default:
        return lightTheme.colors.onPrimary;
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
    <PaperButton
      mode={getMode()}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
      style={[getSizeStyle(), style]}
      labelStyle={styles.label}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    minWidth: 80,
    height: 36,
  },
  medium: {
    minWidth: 120,
    height: 48,
  },
  large: {
    minWidth: 160,
    height: 56,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

