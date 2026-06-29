import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { authService } from '@/services/authService';
import AppText from '@/components/ui/AppText';
import BrandHeader from '@/components/ui/BrandHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { palette, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);

  const isReady = email.trim().length > 0 && !loading;

  const handleSendOTP = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setNotRegistered(false);
    setLoading(true);
    try {
      const result = await authService.login(trimmed);
      const userId = result?.data?.userId;
      if (!userId) {
        setError('Could not start login. Please try again or sign up first.');
        return;
      }
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { userId, email: trimmed, source: 'login' },
      });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setNotRegistered(true);
        setError('No account found. Please create one first.');
      } else if (status === 403) {
        setError('This account cannot sign in here. Use the admin portal.');
      } else {
        setError(getErrorMessage(err, 'Failed to send OTP. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          <BrandHeader subtitle="Sign in to continue your daily routine" />

          <View style={styles.form}>
            <Input
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              keyboardType="email-address"
              error={error}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
            {notRegistered ? (
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <AppText variant="label" color={palette.primaryLight}>
                  Create an account →
                </AppText>
              </TouchableOpacity>
            ) : null}

            <Button
              title="Send OTP"
              onPress={handleSendOTP}
              loading={loading}
              disabled={!isReady}
            />
          </View>

          <View style={styles.footer}>
            <AppText variant="body">Don&apos;t have an account?</AppText>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <AppText variant="label" color={palette.primaryLight}>
                Sign up
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.surface },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  form: { gap: spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
