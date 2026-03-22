import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { Food } from '@/types';

type FoodInput = Omit<Food, 'id' | 'user_id' | 'created_at'>;

interface Props {
  initial?: Partial<FoodInput>;
  onSubmit: (food: FoodInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function FoodForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [servingUnit, setServingUnit] = useState(initial?.serving_unit ?? '');
  const [calories, setCalories] = useState(
    initial?.calories_per_serving != null ? String(initial.calories_per_serving) : ''
  );
  const [protein, setProtein] = useState(
    initial?.protein_per_serving != null ? String(initial.protein_per_serving) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Food name is required.');
      return;
    }
    if (!servingUnit.trim()) {
      setError('Serving unit is required.');
      return;
    }
    const cal = parseFloat(calories);
    const prot = parseFloat(protein);
    if (isNaN(cal) || cal < 0) {
      setError('Enter a valid calorie amount.');
      return;
    }
    if (isNaN(prot) || prot < 0) {
      setError('Enter a valid protein amount.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        serving_unit: servingUnit.trim(),
        calories_per_serving: cal,
        protein_per_serving: prot,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Food Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Chicken Breast"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Serving Unit</Text>
      <TextInput
        style={styles.input}
        value={servingUnit}
        onChangeText={setServingUnit}
        placeholder="e.g. 100g, 1 cup"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Calories per Serving</Text>
      <TextInput
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        placeholder="e.g. 165"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Protein per Serving (g)</Text>
      <TextInput
        style={styles.input}
        value={protein}
        onChangeText={setProtein}
        placeholder="e.g. 31"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
      />

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Saving...' : submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  buttons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#111',
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  disabled: { opacity: 0.6 },
});
