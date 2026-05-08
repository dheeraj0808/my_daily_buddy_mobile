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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Colors, Spacing, BorderRadius } from '../../constants/Colors';
import authService from '../../services/authService';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
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
      const response = await authService.login(email.trim());
      if (response.success) {
        router.push({
          pathname: '/(auth)/verify',
          params: { userId: response.body.userId, email: email.trim() },
        });
      } else {
        Alert.alert('Login Failed', response.message || 'Something went wrong');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Connection error. Is the backend running?';
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
          {/* Hero / Brand Section */}
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Text style={styles.brandIcon}>🌟</Text>
              <Text style={styles.brandName}>My Daily Buddy</Text>
              <Text style={styles.brandTagline}>Your personal productivity companion</Text>
            </View>
            <View style={styles.heroCurve} />
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in with your email to receive a one-time verification code
            </Text>

            <View style={styles.form}>
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
                style={styles.button}
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New here?</Text>
              <View style={styles.dividerLine} />
            </View>

            <CustomButton
              title="Create an Account"
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
            />
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // ── Hero ──
  heroSection: {
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  brandIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  heroCurve: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  // ── Form ──
  formSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: Spacing.md,
  },
  // ── Divider ──
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginHorizontal: Spacing.md,
  },
});
