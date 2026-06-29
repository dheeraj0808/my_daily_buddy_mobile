import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AppText from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { palette, radius, spacing, typography } from '@/theme';
import { storage } from '@/utils/storage';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyOtpScreen() {
  const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();
  const { setAuthenticated, refreshProfile } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const fullOtp = otp.join('');
  const isComplete = fullOtp.length === OTP_LENGTH;

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        const next = [...otp];
        next[index - 1] = '';
        setOtp(next);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const handleVerify = useCallback(async () => {
    if (!isComplete || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await authService.verifyOtp(userId, fullOtp);
      const { access_token, refresh_token } = result?.data ?? {};
      if (access_token && refresh_token) {
        await storage.setTokens(access_token, refresh_token);
      } else if (access_token) {
        await storage.setToken(access_token);
      }
      setAuthenticated(true);
      await refreshProfile();
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Invalid OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
        setFocusedIndex(0);
      }, 100);
    } finally {
      setLoading(false);
    }
  }, [userId, fullOtp, isComplete, loading, setAuthenticated, refreshProfile]);

  useEffect(() => {
    if (isComplete && !loading) handleVerify();
  }, [isComplete, handleVerify, loading]);

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authService.resendOtp(userId);
      setTimer(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={palette.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={32} color={palette.primaryLight} />
            </View>
            <AppText variant="h1">Verify OTP</AppText>
            <AppText variant="caption" style={styles.subtitle}>
              Enter the 6-digit code sent to
            </AppText>
            <AppText variant="title" color={palette.primaryLight}>
              {maskedEmail}
            </AppText>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpBoxFocused,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={(val) => handleChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? (
            <AppText variant="caption" color={palette.error} style={styles.errorText}>
              {error}
            </AppText>
          ) : null}

          <Button
            title="Verify OTP"
            onPress={handleVerify}
            loading={loading}
            disabled={!isComplete || loading}
          />

          <View style={styles.resendRow}>
            {timer > 0 ? (
              <AppText variant="caption">
                Resend OTP in <AppText variant="label" color={palette.primaryLight}>{timer}s</AppText>
              </AppText>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator color={palette.primaryLight} size="small" />
                ) : (
                  <AppText variant="label" color={palette.primaryLight}>
                    Resend OTP
                  </AppText>
                )}
              </TouchableOpacity>
            )}
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
    paddingTop: spacing.md,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  backBtn: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', gap: spacing.sm, marginTop: 40 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: { textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.background,
    fontSize: 22,
    fontFamily: typography.fontFamily.bold,
    color: palette.text,
  },
  otpBoxFocused: { borderColor: palette.primaryLight, backgroundColor: '#EEF2FF' },
  otpBoxFilled: { borderColor: palette.primaryLight, backgroundColor: palette.surface },
  otpBoxError: { borderColor: palette.error, backgroundColor: '#FEF2F2' },
  errorText: { textAlign: 'center' },
  resendRow: { alignItems: 'center' },
});
