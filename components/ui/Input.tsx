import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, radius, spacing, typography } from '@/theme';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go';
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  containerStyle,
  multiline,
  autoFocus,
  onSubmitEditing,
  returnKeyType,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <AppText variant="label" style={styles.label}>{label}</AppText> : null}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={[styles.input, multiline && styles.multiline]}
          autoCapitalize="none"
          multiline={multiline}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
      </View>
      {error ? <AppText variant="caption" color={palette.error}>{error}</AppText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: spacing.sm },
  label: { marginBottom: spacing.xs, marginLeft: 4 },
  inputContainer: {
    minHeight: 56,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.regular,
    color: palette.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top', paddingVertical: spacing.sm },
  inputError: {
    borderColor: palette.error,
    backgroundColor: '#FEF2F2',
  },
});
