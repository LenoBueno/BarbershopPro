import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { tierColor } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'primary' && { backgroundColor: tierColor },
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'outline' && { borderColor: tierColor },
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? tierColor : colors.background} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'outline' && styles.outlineText,
            variant === 'outline' && { color: tierColor },
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    // backgroundColor set dynamically via style prop
  },
  secondaryButton: {
    backgroundColor: colors.surface,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // borderColor set dynamically via style prop
  },
  disabledButton: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  buttonText: {
    ...typography.button,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    // color set dynamically via style prop
  },
  disabledText: {
    color: colors.textTertiary,
  },
});
