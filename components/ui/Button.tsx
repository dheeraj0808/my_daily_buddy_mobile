import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import AppText from '@/components/ui/AppText';
import { gradients, palette, radius, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'md' | 'sm';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const isSm = size === 'sm';
  const heightStyle = isSm ? styles.sm : styles.md;

  if (variant === 'outline' || variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.base,
          heightStyle,
          variant === 'outline' ? styles.outline : styles.ghost,
          isDisabled && styles.disabled,
          style,
        ]}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={palette.primaryLight} size={isSm ? 'small' : 'small'} />
        ) : (
          <AppText variant={isSm ? 'label' : 'title'} color={palette.primaryLight} style={textStyle}>
            {title}
          </AppText>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'destructive') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.base, heightStyle, styles.destructive, isDisabled && styles.disabled, style]}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={palette.white} size="small" />
        ) : (
          <AppText variant={isSm ? 'label' : 'title'} color={palette.white} style={textStyle}>
            {title}
          </AppText>
        )}
      </TouchableOpacity>
    );
  }

  const colors = variant === 'primary' ? gradients.auth : (['#94A3B8', '#64748B'] as const);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, heightStyle, isDisabled && styles.disabled, style]}
      activeOpacity={0.85}
    >
      <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color={palette.white} size="small" />
        ) : (
          <AppText variant={isSm ? 'label' : 'title'} color={palette.white} style={textStyle}>
            {title}
          </AppText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.sm,
  },
  md: { height: 56 },
  sm: { height: 44, marginVertical: spacing.xs },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outline: {
    borderWidth: 2,
    borderColor: palette.primaryLight,
    backgroundColor: 'transparent',
  },
  ghost: {
    borderWidth: 0,
    backgroundColor: palette.surfaceMuted,
  },
  destructive: {
    backgroundColor: palette.error,
  },
  disabled: { opacity: 0.55 },
});
