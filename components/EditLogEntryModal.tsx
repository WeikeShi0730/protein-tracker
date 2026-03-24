import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import PlatformModal from '@/components/PlatformModal';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { LogEntry } from '@/types';
import { C, R } from '@/constants/ClaudeTheme';

interface Props {
  visible: boolean;
  entry: LogEntry | null;
  onClose: () => void;
  onSave: (id: string, updates: { servings: number; notes: string | null }) => Promise<void>;
}

export default function EditLogEntryModal({ visible, entry, onClose, onSave }: Props) {
  const [servings, setServings] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setServings(String(entry.servings));
      setNotes(entry.notes ?? '');
      setError(null);
    }
  }, [entry]);

  async function handleSave() {
    if (!entry) return;
    const s = parseFloat(servings);
    if (isNaN(s) || s <= 0) {
      setError('Enter a valid serving amount.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSave(entry.id, { servings: s, notes: notes.trim() || null });
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const previewProtein = entry && servings && !isNaN(parseFloat(servings))
    ? Math.round(parseFloat(servings) * entry.foods.protein_per_serving)
    : null;
  const previewCal = entry && servings && !isNaN(parseFloat(servings))
    ? Math.round(parseFloat(servings) * entry.foods.calories_per_serving)
    : null;

  return (
    <PlatformModal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <View style={styles.headerDrag} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>Edit Entry</Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.body}>
            {entry && (
              <View style={styles.foodCard}>
                <Text style={styles.foodCardLabel}>Editing</Text>
                <Text style={styles.foodCardName}>{entry.foods.name}</Text>
              </View>
            )}

            {error && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <Text style={styles.label}>
              Servings{entry ? ` (${entry.foods.serving_unit})` : ''}
            </Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              keyboardType="decimal-pad"
              autoFocus
              placeholderTextColor={C.textPlaceholder}
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. post-workout"
              placeholderTextColor={C.textPlaceholder}
            />

            {previewProtein !== null && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.preview}>
                <Text style={styles.previewLabel}>Preview</Text>
                <View style={styles.previewRow}>
                  <View style={styles.previewChip}>
                    <Text style={styles.previewChipValue}>{previewProtein}g</Text>
                    <Text style={styles.previewChipLabel}>protein</Text>
                  </View>
                  <View style={styles.previewDivider} />
                  <View style={styles.previewChip}>
                    <Text style={styles.previewChipValue}>{previewCal}</Text>
                    <Text style={styles.previewChipLabel}>kcal</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.disabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PlatformModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgElevated },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 14,
  },
  headerDrag: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  cancelBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  cancelBtnText: { fontSize: 15, color: C.textSecondary, fontWeight: '500' },

  body: { padding: 20, flex: 1 },

  foodCard: {
    backgroundColor: C.accentLight,
    borderRadius: R.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.accentMid,
  },
  foodCardLabel: { fontSize: 11, fontWeight: '600', color: C.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  foodCardName: { fontSize: 16, fontWeight: '600', color: C.textPrimary },

  errorBanner: {
    backgroundColor: C.errorBg,
    padding: 10,
    borderRadius: R.sm,
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
    marginBottom: 16,
  },

  preview: {
    backgroundColor: C.accentLight,
    borderRadius: R.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.accentMid,
    alignItems: 'center',
  },
  previewLabel: { fontSize: 11, fontWeight: '600', color: C.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  previewChip: { alignItems: 'center' },
  previewChipValue: { fontSize: 22, fontWeight: '700', color: C.textPrimary },
  previewChipLabel: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  previewDivider: { width: 1, height: 32, backgroundColor: C.accentMid },

  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: R.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  disabled: { opacity: 0.5 },
});
