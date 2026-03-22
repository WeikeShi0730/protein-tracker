import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import type { LogEntry } from '@/types';

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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Edit Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {entry && (
              <View style={styles.foodLabel}>
                <Text style={styles.foodName}>{entry.foods.name}</Text>
              </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.label}>
              Servings{entry ? ` (${entry.foods.serving_unit})` : ''}
            </Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              keyboardType="decimal-pad"
              autoFocus
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. post-workout"
              placeholderTextColor="#999"
            />

            {entry && !!servings && !isNaN(parseFloat(servings)) && (
              <View style={styles.preview}>
                <Text style={styles.previewText}>
                  ~{Math.round(parseFloat(servings) * entry.foods.protein_per_serving)}g protein ·{' '}
                  {Math.round(parseFloat(servings) * entry.foods.calories_per_serving)} kcal
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.disabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  closeBtn: { fontSize: 16, color: '#6b7280' },
  body: { padding: 16, flex: 1 },
  foodLabel: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  foodName: { fontSize: 16, fontWeight: '600', color: '#111' },
  error: { color: '#dc2626', marginBottom: 12, fontSize: 13 },
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
  preview: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  previewText: { fontSize: 14, color: '#166534', fontWeight: '500', textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
