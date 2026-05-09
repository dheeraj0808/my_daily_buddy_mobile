import { StyleSheet } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/constants/Colors';

const HEADER_GRADIENT_START = '#8b5cf6';
const HEADER_GRADIENT_END = '#6366f1';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 48,
  },

  // ── Loading / Error States ────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: 15,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarInitialsCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitialsText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: 14,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#86efac',
  },
  editProfileBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  editProfileBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Section wrapper ───────────────────────────────────────────────────────
  sectionWrapper: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // ── Edit Profile Form ─────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  textInputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  saveErrorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },

  // ── Info Row (email / phone display) ─────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  infoValueMuted: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // ── Subscription ──────────────────────────────────────────────────────────
  subPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  subPlanName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subPlanPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  subOldPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  subPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  subDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  subDatesRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subDateBlock: {
    flex: 1,
  },
  subDateLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  subDateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  subActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  changePlanBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  changePlanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelSubBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    alignItems: 'center',
  },
  cancelSubBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  emptySubCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  browsePlansBtn: {
    paddingVertical: 11,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  browsePlansBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // ── Plan Change Modal ─────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  modalScroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  planCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#f0f0ff',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  planOldPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  planDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  planDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  activePlanBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  activePlanBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  selectPlanBtn: {
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  selectPlanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  switchFreePlanBtn: {
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    alignItems: 'center',
  },
  switchFreePlanBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  planChangingOverlay: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  planChangeError: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: Spacing.md,
  },
});
