import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import AppText from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import { palette, radius, spacing } from '@/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  general?: string;
}

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!EMAIL_REGEX.test(email.trim())) newErrors.email = 'Enter a valid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isReady =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    !loading;

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authService.register({
        email: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      const userId = result?.data?.userId;
      if (!userId) {
        setErrors({ general: 'Registration started but user ID was missing. Please try again.' });
        return;
      }
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { userId, email: email.trim().toLowerCase(), source: 'register' },
      });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setErrors({ general: 'An account with this email already exists. Please log in instead.' });
      } else {
        setErrors({ general: getErrorMessage(err, 'Registration failed. Please try again.') });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={palette.text} />
          </TouchableOpacity>

          <AppText variant="h1" style={styles.title}>
            Create account
          </AppText>
          <AppText variant="caption" style={styles.subtitle}>
            Enter your details to get started
          </AppText>

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="First name"
                placeholder="John"
                value={firstName}
                onChangeText={(t) => {
                  setFirstName(t);
                  clearError('firstName');
                }}
                error={errors.firstName}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Last name"
                placeholder="Doe"
                value={lastName}
                onChangeText={(t) => {
                  setLastName(t);
                  clearError('lastName');
                }}
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label="Phone (optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clearError('email');
            }}
            keyboardType="email-address"
            error={errors.email}
            onSubmitEditing={handleRegister}
            returnKeyType="done"
          />

          {errors.general ? (
            <View style={styles.generalError}>
              <AppText variant="caption" color={palette.error}>
                {errors.general}
              </AppText>
            </View>
          ) : null}

          <Button
            title="Register & send OTP"
            onPress={handleRegister}
            loading={loading}
            disabled={!isReady}
          />

          <View style={styles.footer}>
            <AppText variant="body">Already have an account?</AppText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <AppText variant="label" color={palette.primaryLight}>
                Sign in
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  generalError: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
});
