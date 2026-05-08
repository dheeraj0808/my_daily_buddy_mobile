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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (formData.first_name && !/^[a-zA-Z\s'-]+$/.test(formData.first_name)) {
      errs.first_name = 'Only letters, spaces, hyphens and apostrophes';
    }
    if (formData.last_name && !/^[a-zA-Z\s'-]+$/.test(formData.last_name)) {
      errs.last_name = 'Only letters, spaces, hyphens and apostrophes';
    }
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      errs.phone = 'Enter a valid phone number (e.g. +919876543210)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Only send non-empty optional fields
      const payload: any = { email: formData.email.trim() };
      if (formData.first_name.trim()) payload.first_name = formData.first_name.trim();
      if (formData.last_name.trim()) payload.last_name = formData.last_name.trim();
      if (formData.phone.trim()) payload.phone = formData.phone.trim();

      const response = await authService.register(payload);
      if (response.success) {
        router.push({
          pathname: '/(auth)/verify',
          params: { userId: response.data.userId, email: formData.email.trim() },
        });
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Connection error. Is the backend running?';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
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
          {/* Header with accent bar */}
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          <View style={styles.formSection}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join My Daily Buddy and start building better habits today
              </Text>
            </View>

            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <CustomInput
                  label="First Name"
                  placeholder="John"
                  value={formData.first_name}
                  onChangeText={(t) => update('first_name', t)}
                  error={errors.first_name}
                />
              </View>
              <View style={styles.nameField}>
                <CustomInput
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChangeText={(t) => update('last_name', t)}
                  error={errors.last_name}
                />
              </View>
            </View>

            <CustomInput
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChangeText={(t) => update('email', t)}
              keyboardType="email-address"
              error={errors.email}
            />

            <CustomInput
              label="Phone Number (Optional)"
              placeholder="+919876543210"
              value={formData.phone}
              onChangeText={(t) => update('phone', t)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <CustomButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={!formData.email.trim()}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Sign In</Text>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  accentBar: {
    height: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  formSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  nameField: {
    flex: 1,
  },
  button: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
