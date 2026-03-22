import { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import type { Food } from '@/types';

interface Props {
  visible: boolean;
  foods: Food[];
  onClose: () => void;
  onAdd: (entry: { food_id: string; servings: number; notes?: string | null }) => Promise<void>;
}

export default function AddLogEntryModal({ visible, foods, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState('1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(
    () =>
      foods.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase())
      ),
    [foods, query]
  );

  function reset() {
    setQuery('');
    setSelectedFood(null);
    setServings('1');
    setNotes('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleAdd() {
    if (!selectedFood) {
      setError('Please select a food.');
      return;
    }
    const s = parseFloat(servings);
    if (isNaN(s) || s <= 0) {
      setError('Enter a valid serving amount.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onAdd({ food_id: selectedFood.id, servings: s, notes: notes.trim() || null });
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add Food Entry</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          {!selectedFood ? (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Search foods..."
                placeholderTextColor="#999"
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.foodRow}
                    onPress={() => setSelectedFood(item)}
                  >
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodMeta}>
                      {item.serving_unit} · {item.protein_per_serving}g P · {item.calories_per_serving} kcal
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </>
          ) : (
            <View style={styles.formArea}>
              <TouchableOpacity style={styles.selectedFood} onPress={() => setSelectedFood(null)}>
                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>

              <Text style={styles.label}>
                Servings ({selectedFood.serving_unit})
              </Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                keyboardType="decimal-pad"
                placeholder="1"
                placeholderTextColor="#999"
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

              {!!servings && !isNaN(parseFloat(servings)) && (
                <View style={styles.preview}>
                  <Text style={styles.previewText}>
                    ~{Math.round(parseFloat(servings) * selectedFood.protein_per_serving)}g protein ·{' '}
                    {Math.round(parseFloat(servings) * selectedFood.calories_per_serving)} kcal
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.addBtn, loading && styles.disabled]}
                onPress={handleAdd}
                disabled={loading}
              >
                <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Add Entry'}</Text>
              </TouchableOpacity>
            </View>
          )}
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
  error: { color: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, fontSize: 13 },
  searchInput: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
  },
  foodRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  foodName: { fontSize: 15, fontWeight: '500', color: '#111' },
  foodMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  formArea: { padding: 16, flex: 1 },
  selectedFood: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  selectedFoodName: { fontSize: 15, fontWeight: '600', color: '#111' },
  changeText: { fontSize: 13, color: '#6b7280' },
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
  addBtn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
