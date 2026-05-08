import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Colors, Spacing, BorderRadius } from '../../constants/Colors';
import authService from '../../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      let response = await authService.login(email.trim());

      // If login returns success but no userId, it means the user doesn't exist or is unverified.
      // To provide a seamless flow, we auto-register them (which just sends an OTP and returns userId).
      if (response.success && !response.data?.userId) {
        response = await authService.register({ email: email.trim() });
      }

      // Now we should have a userId from either login or register
      if (response.success && response.data?.userId) {
        router.push({
          pathname: '/(auth)/verify',
          params: { userId: response.data.userId, email: email.trim() },
        });
      } else {
        Alert.alert('Login Failed', response.message || 'Something went wrong');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Connection error. Is the backend running?';
      Alert.alert('Error', msg);
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroIcon}>🌟</Text>
            <Text style={styles.heroTitle}>My Daily Buddy</Text>
            <Text style={styles.heroSub}>Your personal productivity companion</Text>
            <View style={styles.heroCurve} />
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive a one-time verification code
            </Text>

            <CustomInput
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              keyboardType="email-address"
              error={error}
            />

            <CustomButton
              title="Send Verification Code"
              onPress={handleLogin}
              loading={loading}
              disabled={!email.trim()}
              style={styles.primaryBtn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New here?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Small text link — same style as register's Sign In */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // ── Hero ──
  hero: {
    paddingTop: 56,
    paddingBottom: 48,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroIcon: {
    fontSize: 44,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroCurve: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // ── Form ──
  formSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    marginTop: Spacing.sm,
  },

  // ── Divider ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },

  // ── Register link (small — like register page's "Sign In") ──
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
