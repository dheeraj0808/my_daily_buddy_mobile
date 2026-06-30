import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import SettingsRow from '@/components/shared/SettingsRow';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateProfilePayload, UserProfile } from '@/services/profileAPI';
import {
  deleteAccount,
  getProfile,
  initiateEmailChange,
  loadProfileImageUri,
  requestNewEmail,
  saveProfileImageUri,
  updateProfile,
  uploadProfileImage,
  verifyCurrentEmail,
  verifyNewEmail,
} from '@/services/profileAPI';
import type { Plan, UserSubscription } from '@/services/subscriptionAPI';
import { changePlan, getAllPlans, getMySubscription } from '@/services/subscriptionAPI';
import { palette, radius, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

function InfoRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  muted,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  muted?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.infoBody}>
        <AppText variant="caption" color={palette.textMuted}>
          {label}
        </AppText>
        <AppText variant="title" color={muted ? palette.textMuted : palette.text}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [planChangeError, setPlanChangeError] = useState<string | null>(null);

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2 | 3 | 4>(1);
  const [emailOtp, setEmailOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const [profileRes, subRes, plansRes, avatarRes] = await Promise.allSettled([
      getProfile(),
      getMySubscription(),
      getAllPlans(),
      loadProfileImageUri(),
    ]);

    if (profileRes.status === 'rejected') {
      setError(getErrorMessage(profileRes.reason));
    } else {
      const p = profileRes.value;
      setProfile(p);
      setEditFirstName(p.first_name ?? '');
      setEditLastName(p.last_name ?? '');
      setEditPhone(p.phone ?? '');
      setAvatarUri(p.profile_image_url ?? (avatarRes.status === 'fulfilled' ? avatarRes.value : null));
    }

    setSubscription(subRes.status === 'fulfilled' ? subRes.value : null);
    setPlans(plansRes.status === 'fulfilled' ? plansRes.value : []);

    if (profileRes.status === 'rejected') {
      setAvatarUri(avatarRes.status === 'fulfilled' ? avatarRes.value : null);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const initials =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .map((s) => s![0].toUpperCase())
      .join('') ||
    profile?.email?.[0].toUpperCase() ||
    '?';

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Your Profile';

  const freePlan = plans.find(
    (p) => p.plan_code === 'FREE_PLAN' || p.name.toLowerCase().includes('free'),
  );

  const isOnFreePlan = !subscription || subscription.plan?.plan_code === 'FREE_PLAN';

  const displayPlans = plans
    .filter((p) => p.is_active)
    .sort((a, b) => Number(a.price) - Number(b.price));

  const openEditModal = () => {
    setEditFirstName(profile?.first_name ?? '');
    setEditLastName(profile?.last_name ?? '');
    setEditPhone(profile?.phone ?? '');
    setPhoneError(null);
    setSaveError(null);
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to update your profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const localUri = result.assets[0].uri;
    setUploadingImage(true);
    try {
      const remoteUrl = await uploadProfileImage(localUri);
      await updateProfile({ profile_image_url: remoteUrl });
      await saveProfileImageUri(remoteUrl);
      setAvatarUri(remoteUrl);
    } catch {
      Alert.alert('Upload Failed', 'Could not upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setPhoneError(null);
    setSaveError(null);

    const trimmedPhone = editPhone.trim();
    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      setPhoneError('Enter a valid phone number (e.g. +919876543210)');
      return;
    }

    setSaving(true);
    try {
      const payload: UpdateProfilePayload = {};
      if (editFirstName.trim()) payload.first_name = editFirstName.trim();
      if (editLastName.trim()) payload.last_name = editLastName.trim();
      if (trimmedPhone) payload.phone = trimmedPhone;

      const updated = await updateProfile(payload);
      setProfile(updated);
      setEditModalVisible(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setPlanChangeError(null);
    setChangingPlan(true);
    try {
      const updated = await changePlan(planId);
      setSubscription(updated);
      setPlanModalVisible(false);
      Alert.alert('Plan Updated', `You are now on the ${updated.plan.name} plan.`);
    } catch (err) {
      setPlanChangeError(getErrorMessage(err));
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!freePlan) {
      Alert.alert('Error', 'Free plan not available. Please try again later.');
      return;
    }
    Alert.alert(
      'Cancel Subscription',
      'This will switch you to the Free Plan. You will lose access to premium features. Continue?',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => handleChangePlan(freePlan.id),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {}
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const resetEmailFlow = () => {
    setEmailStep(1);
    setEmailOtp('');
    setNewEmail('');
    setEmailError(null);
  };

  const openEmailChange = () => {
    resetEmailFlow();
    setEmailModalVisible(true);
  };

  const handleEmailStep = async () => {
    setEmailError(null);
    setEmailBusy(true);
    try {
      if (emailStep === 1) {
        await initiateEmailChange();
        setEmailStep(2);
      } else if (emailStep === 2) {
        await verifyCurrentEmail(emailOtp.trim());
        setEmailOtp('');
        setEmailStep(3);
      } else if (emailStep === 3) {
        if (!newEmail.trim()) {
          setEmailError('Enter your new email address.');
          return;
        }
        await requestNewEmail(newEmail.trim());
        setEmailStep(4);
      } else {
        await verifyNewEmail(emailOtp.trim());
        setEmailModalVisible(false);
        resetEmailFlow();
        await loadData(true);
        Alert.alert('Email updated', 'Your email address has been changed.');
      }
    } catch (err) {
      setEmailError(getErrorMessage(err));
    } finally {
      setEmailBusy(false);
    }
  };

  const emailStepHint = () => {
    if (emailStep === 1) return 'We will send a verification code to your current email.';
    if (emailStep === 2) return 'Enter the OTP sent to your current email.';
    if (emailStep === 3) return 'Enter the new email address you want to use.';
    return 'Enter the OTP sent to your new email.';
  };

  const emailSubmitLabel = () => {
    if (emailStep === 1) return 'Send OTP';
    if (emailStep === 4) return 'Confirm new email';
    return 'Continue';
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently deactivate your account. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await signOut();
              router.replace('/(auth)/login');
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <Screen header={<ScreenHeader accent="profile" title="Profile" subtitle="Loading…" />}>
        <LoadingState />
      </Screen>
    );
  }

  if (error && !profile) {
    return (
      <Screen header={<ScreenHeader accent="profile" title="Profile" />}>
        <ErrorBanner message={error} onRetry={() => loadData()} />
      </Screen>
    );
  }

  return (
    <>
      <Screen
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        header={
          <ScreenHeader
            accent="profile"
            title={displayName}
            subtitle={profile?.email}
            onAdd={openEditModal}
            addLabel="Edit"
          >
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={handlePickImage}
              activeOpacity={0.85}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarInitials}>
                  <AppText variant="h1" color={palette.onPrimary}>
                    {initials}
                  </AppText>
                </View>
              )}
              {uploadingImage ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color={palette.white} />
                </View>
              ) : (
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={12} color={palette.white} />
                </View>
              )}
            </TouchableOpacity>
            {profile?.isVerified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#86efac" />
                <AppText variant="caption" color="#86efac">
                  Verified
                </AppText>
              </View>
            ) : null}
          </ScreenHeader>
        }
      >
        {error ? <ErrorBanner message={error} onRetry={() => loadData(true)} /> : null}

        <SectionHeader title="Account" />
        <Card padded>
          <InfoRow
            icon="mail-outline"
            iconColor={palette.primaryLight}
            iconBg={palette.primaryLight + '18'}
            label="Email"
            value={profile?.email ?? '—'}
          />
          <InfoRow
            icon="call-outline"
            iconColor={palette.success}
            iconBg={palette.success + '18'}
            label="Phone"
            value={profile?.phone ?? 'Not added'}
            muted={!profile?.phone}
          />
          <InfoRow
            icon="calendar-outline"
            iconColor={palette.warning}
            iconBg={palette.warning + '18'}
            label="Member since"
            value={
              profile?.createdAt ? formatDate(profile.createdAt.split('T')[0]) : '—'
            }
            isLast
          />
        </Card>

        <SectionHeader title="Subscription" />
        <Card padded>
          {subscription ? (
            <>
              <View style={styles.subHeader}>
                <View>
                  <AppText variant="h2">{subscription.plan.name}</AppText>
                  <View style={styles.priceRow}>
                    <AppText variant="title" color={palette.primaryLight}>
                      {Number(subscription.plan.price) === 0
                        ? 'Free'
                        : `₹${Number(subscription.plan.price).toFixed(2)}`}
                    </AppText>
                    {Number(subscription.plan.compare_at_price) >
                      Number(subscription.plan.price) && (
                      <AppText variant="caption" color={palette.textMuted} style={styles.strike}>
                        ₹{Number(subscription.plan.compare_at_price).toFixed(2)}
                      </AppText>
                    )}
                  </View>
                </View>
                <View style={styles.activePill}>
                  <AppText variant="caption" color={palette.success}>
                    Active
                  </AppText>
                </View>
              </View>

              <View style={styles.dateRow}>
                <View>
                  <AppText variant="caption" color={palette.textMuted}>
                    Start
                  </AppText>
                  <AppText variant="title">{formatDate(subscription.start_date)}</AppText>
                </View>
                <View>
                  <AppText variant="caption" color={palette.textMuted}>
                    Valid until
                  </AppText>
                  <AppText variant="title">{formatDate(subscription.end_date)}</AppText>
                </View>
              </View>

              <View style={styles.subActions}>
                <TouchableOpacity
                  style={styles.primaryOutlineBtn}
                  onPress={() => {
                    setPlanChangeError(null);
                    setPlanModalVisible(true);
                  }}
                >
                  <AppText variant="label" color={palette.primaryLight}>
                    Change plan
                  </AppText>
                </TouchableOpacity>
                {!isOnFreePlan ? (
                  <TouchableOpacity style={styles.textBtn} onPress={handleCancelSubscription}>
                    <AppText variant="label" color={palette.error}>
                      Cancel
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.emptySub}>
              <Ionicons name="ribbon-outline" size={32} color={palette.textMuted} />
              <AppText variant="body" color={palette.textSecondary}>
                No active subscription
              </AppText>
              <TouchableOpacity
                style={styles.primaryOutlineBtn}
                onPress={() => {
                  setPlanChangeError(null);
                  setPlanModalVisible(true);
                }}
              >
                <AppText variant="label" color={palette.primaryLight}>
                  Browse plans
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <SectionHeader title="Settings" />
        <Card padded style={styles.settingsCard}>
          <SettingsRow
            icon="notifications-outline"
            label="Notification history"
            onPress={() => router.push('/notifications')}
          />
          <SettingsRow icon="mail-outline" label="Change email" onPress={openEmailChange} />
          <SettingsRow
            icon="trash-outline"
            label="Delete account"
            destructive
            onPress={handleDeleteAccount}
            isLast
          />
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={palette.error} />
          <AppText variant="title" color={palette.error}>
            Logout
          </AppText>
        </TouchableOpacity>

        <AppText variant="caption" color={palette.textMuted} style={styles.version}>
          My Daily Buddy v1.0.0
        </AppText>
      </Screen>

      <FormModal
        visible={editModalVisible}
        title="Edit profile"
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleSaveProfile}
        submitLabel="Save changes"
        loading={saving}
      >
        <FormField
          label="First name"
          value={editFirstName}
          onChangeText={setEditFirstName}
          placeholder="First name"
        />
        <FormField
          label="Last name"
          value={editLastName}
          onChangeText={setEditLastName}
          placeholder="Last name"
        />
        <FormField
          label="Phone"
          value={editPhone}
          onChangeText={(t) => {
            setEditPhone(t);
            setPhoneError(null);
          }}
          placeholder="+919876543210"
        />
        {phoneError ? (
          <AppText variant="caption" color={palette.error}>
            {phoneError}
          </AppText>
        ) : null}
        {saveError ? (
          <AppText variant="caption" color={palette.error}>
            {saveError}
          </AppText>
        ) : null}
      </FormModal>

      <FormModal
        visible={emailModalVisible}
        title="Change email"
        onClose={() => setEmailModalVisible(false)}
        onSubmit={handleEmailStep}
        submitLabel={emailSubmitLabel()}
        loading={emailBusy}
      >
        <AppText variant="body" color={palette.textSecondary} style={styles.modalHint}>
          {emailStepHint()}
        </AppText>
        {emailStep === 2 || emailStep === 4 ? (
          <FormField
            label="OTP"
            value={emailOtp}
            onChangeText={setEmailOtp}
            placeholder="6-digit code"
          />
        ) : null}
        {emailStep === 3 ? (
          <FormField
            label="New email"
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="new@email.com"
          />
        ) : null}
        {emailError ? (
          <AppText variant="caption" color={palette.error}>
            {emailError}
          </AppText>
        ) : null}
      </FormModal>

      <FormModal
        visible={planModalVisible}
        title="Choose a plan"
        onClose={() => setPlanModalVisible(false)}
        hideSubmit
      >
        {displayPlans.length === 0 ? (
          <AppText variant="body" color={palette.textSecondary} style={styles.modalHint}>
            No plans available right now.
          </AppText>
        ) : (
          displayPlans.map((plan) => {
            const isCurrent = subscription?.plan_id === plan.id;
            const isFree = plan.plan_code === 'FREE_PLAN' || Number(plan.price) === 0;
            const showSwitchToFree = isFree && !isOnFreePlan;

            return (
              <View
                key={plan.id}
                style={[styles.planCard, isCurrent && styles.planCardCurrent]}
              >
                <View style={styles.planCardTop}>
                  <AppText variant="title">{plan.name}</AppText>
                  {isCurrent ? (
                    <View style={styles.currentPill}>
                      <AppText variant="caption" color={palette.primaryLight}>
                        Current
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.priceRow}>
                  <AppText variant="h2" color={palette.primaryLight}>
                    {Number(plan.price) === 0 ? 'Free' : `₹${Number(plan.price).toFixed(2)}`}
                  </AppText>
                  {Number(plan.compare_at_price) > Number(plan.price) ? (
                    <AppText variant="caption" color={palette.textMuted} style={styles.strike}>
                      ₹{Number(plan.compare_at_price).toFixed(2)}
                    </AppText>
                  ) : null}
                </View>
                {plan.description ? (
                  <AppText variant="body" color={palette.textSecondary}>
                    {plan.description}
                  </AppText>
                ) : null}
                <AppText variant="caption" color={palette.textMuted}>
                  {plan.duration_days >= 99999
                    ? 'Unlimited duration'
                    : `${plan.duration_days} days`}
                </AppText>
                {isCurrent ? null : (
                  <TouchableOpacity
                    style={showSwitchToFree ? styles.dangerOutlineBtn : styles.selectPlanBtn}
                    onPress={() => handleChangePlan(plan.id)}
                    disabled={changingPlan}
                  >
                    {changingPlan ? (
                      <ActivityIndicator
                        color={showSwitchToFree ? palette.error : palette.white}
                        size="small"
                      />
                    ) : (
                      <AppText
                        variant="label"
                        color={showSwitchToFree ? palette.error : palette.white}
                      >
                        {showSwitchToFree ? 'Switch to free' : 'Select plan'}
                      </AppText>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
        {planChangeError ? (
          <AppText variant="caption" color={palette.error} style={styles.modalHint}>
            {planChangeError}
          </AppText>
        ) : null}
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitials: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.white,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: { flex: 1, gap: 2 },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  strike: { textDecorationLine: 'line-through' },
  activePill: {
    backgroundColor: palette.success + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    marginBottom: spacing.md,
  },
  subActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  primaryOutlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: palette.primaryLight,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textBtn: { paddingVertical: 12, paddingHorizontal: spacing.sm },
  emptySub: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  settingsCard: { paddingVertical: spacing.xs },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.error + '40',
    backgroundColor: palette.error + '08',
  },
  version: { textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
  modalHint: { marginBottom: spacing.md },
  planCard: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  planCardCurrent: {
    borderColor: palette.primaryLight,
    backgroundColor: palette.primaryLight + '08',
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPill: {
    backgroundColor: palette.primaryLight + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  selectPlanBtn: {
    marginTop: spacing.sm,
    backgroundColor: palette.primaryLight,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerOutlineBtn: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: palette.error,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
