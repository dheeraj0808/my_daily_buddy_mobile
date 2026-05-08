import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton } from '../../components/CustomButton';
import { Colors, Spacing, BorderRadius } from '../../constants/Colors';
import * as SecureStore from 'expo-secure-store';
import authService from '../../services/authService';

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const { userId, email } = useLocalSearchParams();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Auto-focus first input when screen mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    if (!digit && text !== '') return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === OTP_LENGTH - 1) {
      const filled = newOtp.join('');
      if (filled.length === OTP_LENGTH) {
        handleVerifyCode(filled);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyCode = async (code?: string) => {
    const otpCode = code ?? otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert('Error', `Please enter the full ${OTP_LENGTH}-digit code`);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp(userId as string, otpCode);
      console.log('Verify OTP Response:', response);
      
      if (response.success) {
        const { access_token, user } = response.data;
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', access_token || '');
          localStorage.setItem('userData', JSON.stringify(user || {}));
        } else {
          await SecureStore.setItemAsync('userToken', access_token || '');
          await SecureStore.setItemAsync('userData', JSON.stringify(user || {}));
        }
        console.log('Routing to /(tabs)...');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Invalid OTP', response.message || 'Please check the code and try again');
        setOtp(new Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      const msg = err?.response?.data?.message || err.message || 'Verification failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.resendOtp(userId as string);
      setResendCooldown(30);
      setOtp(new Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      Alert.alert('Sent ✅', 'A new OTP has been sent to your email');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#6366f1', '#a855f7']}
              style={styles.iconGradient}
            >
              <Text style={styles.iconEmoji}>✉️</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a {OTP_LENGTH}-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <CustomButton
            title={loading ? 'Verifying...' : 'Verify & Continue'}
            onPress={() => handleVerifyCode()}
            loading={loading}
            disabled={otp.join('').length !== OTP_LENGTH || loading}
            style={styles.button}
          />

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? (
              <Text style={styles.resendText}>
                Resend code in{' '}
                <Text style={styles.resendCountdown}>{resendCooldown}s</Text>
              </Text>
            ) : (
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#eef2ff',
  },
  button: {
    marginTop: Spacing.sm,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  resendCountdown: {
    color: Colors.primary,
    fontWeight: '700',
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
