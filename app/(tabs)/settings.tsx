import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { C, R, shadow } from '@/constants/ClaudeTheme';
import { scrollActiveInputIntoView } from '@/utils/scrollIntoView';

export default function SettingsScreen() {
  const { profile, loading, updateGoals } = useProfile();
  const { signOut } = useAuth();

  const [protein, setProtein] = useState('');
  const [calories, setCalories] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (profile) {
      setProtein(String(profile.daily_protein_goal));
      setCalories(String(profile.daily_calorie_goal));
    }
  }, [profile]);

  async function handleSave() {
    const p = parseInt(protein, 10);
    const c = parseInt(calories, 10);
    if (isNaN(p) || p <= 0) {
      setSaveError('Enter a valid protein goal (g).');
      return;
    }
    if (isNaN(c) || c <= 0) {
      setSaveError('Enter a valid calorie goal.');
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      await updateGoals(p, c);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch (e: any) {
      setShowSignOutConfirm(false);
      setSigningOut(false);
      if (Platform.OS === 'web') {
        setSaveError(e.message);
      } else {
        Alert.alert('Error', e.message);
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Goals section */}
          <Animated.View entering={FadeInDown.delay(0).duration(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            <Text style={styles.sectionSubtitle}>Set your protein and calorie targets</Text>

            {!!saveError && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.errorBanner}>
                <Text style={styles.errorText}>{saveError}</Text>
              </Animated.View>
            )}

            <Text style={styles.label}>Protein Goal (g)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              keyboardType="number-pad"
              placeholder="150"
              placeholderTextColor={C.textPlaceholder}
              onFocus={scrollActiveInputIntoView}
            />

            <Text style={styles.label}>Calorie Goal (kcal)</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              placeholder="2000"
              placeholderTextColor={C.textPlaceholder}
              onFocus={scrollActiveInputIntoView}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.savedBtn]}
              onPress={handleSave}
              disabled={saving || saved}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {saved ? '✓ Saved' : 'Save Goals'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Account section */}
          <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Text style={styles.sectionSubtitle}>Manage your session</Text>

            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => setShowSignOutConfirm(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSignOutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutConfirm(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => !signingOut && setShowSignOutConfirm(false)}
        >
          <Pressable style={styles.dialog}>
            <Text style={styles.dialogTitle}>Sign Out</Text>
            <Text style={styles.dialogMessage}>Are you sure you want to sign out?</Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancel}
                onPress={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirm, signingOut && styles.disabled]}
                onPress={confirmSignOut}
                disabled={signingOut}
              >
                {signingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.dialogConfirmText}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  section: {
    backgroundColor: C.bgElevated,
    borderRadius: R.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 2 },
  sectionSubtitle: { fontSize: 13, color: C.textMuted, marginBottom: 18 },

  errorBanner: {
    backgroundColor: C.errorBg,
    borderRadius: R.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  errorText: { color: C.error, fontSize: 13 },

  label: { fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.sm,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: C.textPrimary,
    backgroundColor: C.bgSubtle,
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: R.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    minHeight: 46,
    justifyContent: 'center',
  },
  savedBtn: { backgroundColor: C.success },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },

  signOutBtn: {
    backgroundColor: C.errorBg,
    borderRadius: R.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  signOutText: { color: C.error, fontSize: 15, fontWeight: '600' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: C.bgElevated,
    borderRadius: R.lg,
    padding: 24,
    marginHorizontal: 32,
    width: '100%',
    maxWidth: 360,
  },
  dialogTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 8 },
  dialogMessage: { fontSize: 14, color: C.textSecondary, lineHeight: 21, marginBottom: 20 },
  dialogActions: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: C.bgMuted,
    borderRadius: R.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  dialogCancelText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  dialogConfirm: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: C.error,
    borderRadius: R.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  dialogConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  disabled: { opacity: 0.5 },
});
