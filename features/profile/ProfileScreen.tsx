import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import Screen from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateProfilePayload, UserProfile } from '@/services/profileAPI';
import {
    getProfile,
    loadProfileImageUri,
    saveProfileImageUri,
    updateProfile,
    uploadProfileImage,
} from '@/services/profileAPI';
import type { Plan, UserSubscription } from '@/services/subscriptionAPI';
import {
    changePlan,
    getAllPlans,
    getMySubscription,
} from '@/services/subscriptionAPI';
import { getErrorMessage } from '@/utils/errors';
import styles from './profile.styles';

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
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
    }

    setSubscription(subRes.status === 'fulfilled' ? subRes.value : null);
    setPlans(plansRes.status === 'fulfilled' ? plansRes.value : []);
    setAvatarUri(avatarRes.status === 'fulfilled' ? avatarRes.value : null);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived values ────────────────────────────────────────────────────────
  const initials = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .map((s) => s![0].toUpperCase())
    .join('') || profile?.email?.[0].toUpperCase() || '?';

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    'Your Profile';

  const freePlan = plans.find(
    (p) => p.plan_code === 'FREE_PLAN' || p.name.toLowerCase().includes('free')
  );

  const isOnFreePlan =
    !subscription || subscription.plan?.plan_code === 'FREE_PLAN';

  const displayPlans = plans
    .filter((p) => p.is_active)
    .sort((a, b) => Number(a.price) - Number(b.price));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to update your profile picture.'
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
      setIsEditing(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFirstName(profile?.first_name ?? '');
    setEditLastName(profile?.last_name ?? '');
    setEditPhone(profile?.phone ?? '');
    setPhoneError(null);
    setSaveError(null);
    setIsEditing(false);
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
      ]
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

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen scroll={false}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        header={
          <LinearGradient colors={['#8b5cf6', '#6366f1']} style={styles.header}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handlePickImage}
              activeOpacity={0.85}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarInitialsCircle}>
                  <Text style={styles.avatarInitialsText}>{initials}</Text>
                </View>
              )}
              {uploadingImage ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.headerName}>{displayName}</Text>
            <Text style={styles.headerEmail}>{profile?.email}</Text>

            {profile?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#86efac" />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}

            {!isEditing && (
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.editProfileBtnText}>✏️ Edit Profile</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        }
      >
        {/* ── Edit Profile Form ───────────────────────────────────────────── */}
        {isEditing && (
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <View style={styles.sectionCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholder="First name"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editLastName}
                  onChangeText={setEditLastName}
                  placeholder="Last name"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={[styles.textInput, phoneError ? { borderColor: '#ef4444' } : null]}
                  value={editPhone}
                  onChangeText={(t: string) => { setEditPhone(t); setPhoneError(null); }}
                  placeholder="+919876543210"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
                {phoneError && <Text style={styles.inputError}>{phoneError}</Text>}
              </View>
              {saveError && <Text style={styles.saveErrorText}>{saveError}</Text>}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancelEdit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  activeOpacity={0.85}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Account Info ────────────────────────────────────────────────── */}
        {!isEditing && (
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionCard}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBg, { backgroundColor: '#ede9fe' }]}>
                  <Ionicons name="mail-outline" size={18} color="#6366f1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile?.email}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBg, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="call-outline" size={18} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  {profile?.phone ? (
                    <Text style={styles.infoValue}>{profile.phone}</Text>
                  ) : (
                    <Text style={styles.infoValueMuted}>Not added</Text>
                  )}
                </View>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <View style={[styles.infoIconBg, { backgroundColor: '#fef9c3' }]}>
                  <Ionicons name="calendar-outline" size={18} color="#ca8a04" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {profile?.createdAt ? formatDate(profile.createdAt.split('T')[0]) : '—'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Subscription ────────────────────────────────────────────────── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.sectionCard}>
            {subscription ? (
              <>
                <View style={styles.subPlanRow}>
                  <View>
                    <Text style={styles.subPlanName}>{subscription.plan.name}</Text>
                    <View style={styles.subPriceRow}>
                      <Text style={styles.subPlanPrice}>
                        {Number(subscription.plan.price) === 0
                          ? 'Free'
                          : `₹${Number(subscription.plan.price).toFixed(2)}`}
                      </Text>
                      {Number(subscription.plan.compare_at_price) > Number(subscription.plan.price) && (
                        <Text style={styles.subOldPrice}>
                          ₹{Number(subscription.plan.compare_at_price).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>● Active</Text>
                  </View>
                </View>

                <View style={styles.subDivider} />

                <View style={styles.subDatesRow}>
                  <View style={styles.subDateBlock}>
                    <Text style={styles.subDateLabel}>Start Date</Text>
                    <Text style={styles.subDateValue}>{formatDate(subscription.start_date)}</Text>
                  </View>
                  <View style={styles.subDateBlock}>
                    <Text style={styles.subDateLabel}>Valid Until</Text>
                    <Text style={styles.subDateValue}>{formatDate(subscription.end_date)}</Text>
                  </View>
                </View>

                <View style={styles.subActionsRow}>
                  <TouchableOpacity
                    style={styles.changePlanBtn}
                    onPress={() => { setPlanChangeError(null); setPlanModalVisible(true); }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.changePlanBtnText}>Change Plan</Text>
                  </TouchableOpacity>
                  {!isOnFreePlan && (
                    <TouchableOpacity
                      style={styles.cancelSubBtn}
                      onPress={handleCancelSubscription}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelSubBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.emptySubCard}>
                <Ionicons name="ribbon-outline" size={36} color="#94a3b8" />
                <Text style={styles.emptySubText}>No active subscription</Text>
                <TouchableOpacity
                  style={styles.browsePlansBtn}
                  onPress={() => { setPlanChangeError(null); setPlanModalVisible(true); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.browsePlansBtnText}>Browse Plans</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── Logout ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>My Daily Buddy v1.0.0</Text>
      </Screen>

      {/* ── Plan Change Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={planModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlanModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Plan</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setPlanModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {displayPlans.length === 0 && (
                <Text style={[styles.emptySubText, { textAlign: 'center', marginTop: 24 }]}>
                  No plans available.
                </Text>
              )}

              {displayPlans.map((plan) => {
                const isCurrent = subscription?.plan_id === plan.id;
                const isFree = plan.plan_code === 'FREE_PLAN' || Number(plan.price) === 0;
                const showSwitchToFree = isFree && !isOnFreePlan;

                return (
                  <View
                    key={plan.id}
                    style={[styles.planCard, isCurrent && styles.planCardActive]}
                  >
                    <View style={styles.planCardHeader}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {isCurrent && (
                        <View style={styles.activePlanBadge}>
                          <Text style={styles.activePlanBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPrice}>
                        {Number(plan.price) === 0
                          ? 'Free'
                          : `₹${Number(plan.price).toFixed(2)}`}
                      </Text>
                      {Number(plan.compare_at_price) > Number(plan.price) && (
                        <Text style={styles.planOldPrice}>
                          ₹{Number(plan.compare_at_price).toFixed(2)}
                        </Text>
                      )}
                    </View>

                    {plan.description && (
                      <Text style={styles.planDesc}>{plan.description}</Text>
                    )}

                    <Text style={styles.planDuration}>
                      {plan.duration_days >= 99999
                        ? 'Unlimited duration'
                        : `${plan.duration_days} days`}
                    </Text>

                    {isCurrent ? null : showSwitchToFree ? (
                      <TouchableOpacity
                        style={styles.switchFreePlanBtn}
                        onPress={() => handleChangePlan(plan.id)}
                        disabled={changingPlan}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.switchFreePlanBtnText}>Switch (Cancel Premium)</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.selectPlanBtn}
                        onPress={() => handleChangePlan(plan.id)}
                        disabled={changingPlan}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.selectPlanBtnText}>Select Plan</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {changingPlan && (
                <View style={styles.planChangingOverlay}>
                  <ActivityIndicator size="small" color="#6366f1" />
                  <Text style={[styles.loadingText, { marginTop: 6 }]}>Updating plan…</Text>
                </View>
              )}

              {planChangeError && (
                <Text style={styles.planChangeError}>{planChangeError}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
