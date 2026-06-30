import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, radius, spacing, typography } from '@/theme';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  hideSubmit?: boolean;
  children: React.ReactNode;
}

export default function FormModal({
  visible,
  title,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  loading,
  hideSubmit,
  children,
}: Props) {
  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="h2">{title}</AppText>
            <TouchableOpacity onPress={handleClose} hitSlop={12} disabled={loading}>
              <AppText variant="h2" color={palette.textMuted}>
                ×
              </AppText>
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {!hideSubmit && onSubmit ? (
            <TouchableOpacity
              style={[styles.submit, loading && styles.submitDisabled]}
              onPress={onSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <AppText variant="title" color={palette.white}>
                  {submitLabel}
                </AppText>
              )}
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <AppText variant="label" style={fieldStyles.label}>
        {label}
      </AppText>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        multiline={multiline}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.regular,
    color: palette.text,
    backgroundColor: palette.background,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submit: {
    backgroundColor: palette.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitDisabled: { opacity: 0.6 },
});
