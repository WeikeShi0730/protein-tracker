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
import { FOOD_CATEGORIES, DEFAULT_CATEGORY } from '@/constants/seedFoods';
import { C, R } from '@/constants/ClaudeTheme';

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
  const [category, setCategory] = useState(initial?.category || DEFAULT_CATEGORY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) { setError('Food name is required.'); return; }
    if (!servingUnit.trim()) { setError('Serving unit is required.'); return; }
    const cal = parseFloat(calories);
    const prot = parseFloat(protein);
    if (isNaN(cal) || cal < 0) { setError('Enter a valid calorie amount.'); return; }
    if (isNaN(prot) || prot < 0) { setError('Enter a valid protein amount.'); return; }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        serving_unit: servingUnit.trim(),
        calories_per_serving: cal,
        protein_per_serving: prot,
        category: category.trim(),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Food Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Chicken Breast"
        placeholderTextColor={C.textPlaceholder}
        autoFocus
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {FOOD_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipSelected]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Serving Unit</Text>
      <TextInput
        style={styles.input}
        value={servingUnit}
        onChangeText={setServingUnit}
        placeholder="e.g. 100g, 1 cup"
        placeholderTextColor={C.textPlaceholder}
      />

      <Text style={styles.label}>Calories per Serving</Text>
      <TextInput
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        placeholder="e.g. 165"
        placeholderTextColor={C.textPlaceholder}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Protein per Serving (g)</Text>
      <TextInput
        style={styles.input}
        value={protein}
        onChangeText={setProtein}
        placeholder="e.g. 31"
        placeholderTextColor={C.textPlaceholder}
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
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>{loading ? 'Saving…' : submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: C.errorBg,
    borderRadius: R.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  error: { color: C.error, fontSize: 13 },

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

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bgSubtle,
  },
  chipSelected: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },

  buttons: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    backgroundColor: C.bgMuted,
    borderRadius: R.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.textSecondary },
  submitBtn: {
    flex: 1,
    paddingVertical: 13,
    backgroundColor: C.accent,
    borderRadius: R.md,
    alignItems: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  disabled: { opacity: 0.5 },
});
