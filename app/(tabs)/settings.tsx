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
} from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { profile, loading, updateGoals } = useProfile();
  const { signOut } = useAuth();

  const [protein, setProtein] = useState('');
  const [calories, setCalories] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      Alert.alert('Invalid Input', 'Enter a valid protein goal (g).');
      return;
    }
    if (isNaN(c) || c <= 0) {
      Alert.alert('Invalid Input', 'Enter a valid calorie goal.');
      return;
    }
    setSaving(true);
    try {
      await updateGoals(p, c);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>

            <Text style={styles.label}>Protein Goal (g)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              keyboardType="number-pad"
              placeholder="150"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Calorie Goal (kcal)</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              placeholder="2000"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.saveBtn, (saving || saved) && styles.savedBtn]}
              onPress={handleSave}
              disabled={saving || saved}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Goals'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  savedBtn: { backgroundColor: '#10b981' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  signOutBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  signOutText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
});
