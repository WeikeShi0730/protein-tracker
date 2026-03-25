import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import PlatformModal from '@/components/PlatformModal';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { Food } from '@/types';
import { C, R } from '@/constants/ClaudeTheme';
import DatePickerCalendar from '@/components/DatePickerCalendar';

export default function AddLogEntryModal({ visible, foods, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const searchInputRef = useRef<any>(null);

  useEffect(() => {
    if (visible && !selectedFood) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 400);
      return () => clearTimeout(t);
    }
  }, [visible, selectedFood]);
  const [servings, setServings] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sections = useMemo(() => {
    const filtered = foods.filter(
      (f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.category.toLowerCase().includes(query.toLowerCase())
    );
    const grouped: Record<string, Food[]> = {};
    for (const f of filtered) {
      const cat = f.category || 'Other';
      (grouped[cat] ??= []).push(f);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [foods, query]);

  function reset() {
    setQuery('');
    setSelectedFood(null);
    setServings('1');
    setNotes('');
    setSelectedDate(new Date().toLocaleDateString('en-CA'));
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleAdd() {
    if (!selectedFood) { setError('Please select a food.'); return; }
    const s = parseFloat(servings);
    if (isNaN(s) || s <= 0) { setError('Enter a valid serving amount.'); return; }
    setError(null);
    setLoading(true);
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      let logged_at: string;
      if (selectedDate === todayStr) {
        logged_at = new Date().toISOString();
      } else {
        const [y, m, d] = selectedDate.split('-').map(Number);
        logged_at = new Date(y, m - 1, d, 12, 0, 0).toISOString();
      }
      await onAdd({ food_id: selectedFood.id, servings: s, logged_at, notes: notes.trim() || null });
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const previewProtein = selectedFood && servings && !isNaN(parseFloat(servings))
    ? Math.round(parseFloat(servings) * selectedFood.protein_per_serving)
    : null;
  const previewCal = selectedFood && servings && !isNaN(parseFloat(servings))
    ? Math.round(parseFloat(servings) * selectedFood.calories_per_serving)
    : null;

  return (
    <PlatformModal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Add Entry</Text>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {!selectedFood ? (
            <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
              <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search foods…"
                  placeholderTextColor={C.textPlaceholder}
                  value={query}
                  onChangeText={setQuery}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.foodRow}
                    onPress={() => setSelectedFood(item)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.foodRowInner}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodMeta}>
                        {item.serving_unit} · {item.protein_per_serving}g protein · {item.calories_per_serving} kcal
                      </Text>
                    </View>
                    <Text style={styles.foodArrow}>›</Text>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(250)} style={{ flex: 1 }}>
              <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
                <View style={styles.formArea}>
                  {/* Selected food chip */}
                  <TouchableOpacity style={styles.selectedFoodCard} onPress={() => setSelectedFood(null)}>
                    <View style={styles.selectedFoodLeft}>
                      <Text style={styles.selectedFoodLabel}>Selected food</Text>
                      <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                      {!!selectedFood.category && (
                        <Text style={styles.selectedFoodCat}>{selectedFood.category}</Text>
                      )}
                    </View>
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>

                  {/* Date */}
                  <Text style={styles.label}>Log date</Text>
                  <DatePickerCalendar
                    key={`cal-${visible}`}
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                  />

                  {/* Servings */}
                  <Text style={styles.label}>Servings ({selectedFood.serving_unit})</Text>
                  <TextInput
                    style={styles.input}
                    value={servings}
                    onChangeText={setServings}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={C.textPlaceholder}
                    autoFocus
                  />

                  {/* Notes */}
                  <Text style={styles.label}>Notes (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. post-workout, with sauce…"
                    placeholderTextColor={C.textPlaceholder}
                  />

                  {/* Preview */}
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

                  {/* Submit */}
                  <TouchableOpacity
                    style={[styles.addBtn, loading && styles.disabled]}
                    onPress={handleAdd}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addBtnText}>{loading ? 'Adding…' : 'Add Entry'}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  cancelBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  cancelBtnText: { fontSize: 15, color: C.textSecondary, fontWeight: '500' },

  errorBanner: {
    backgroundColor: C.errorBg,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  errorText: { color: C.error, fontSize: 13 },

  // Search list
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    backgroundColor: C.bgSubtle,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 17, color: C.textMuted, marginRight: 6 },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: C.textPrimary,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 12, color: C.textMuted },

  sectionHeader: {
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  foodRowInner: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '500', color: C.textPrimary },
  foodMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  foodArrow: { fontSize: 20, color: C.border, marginLeft: 8 },

  // Form
  formScroll: { flex: 1 },
  formArea: { padding: 20 },

  selectedFoodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.accentLight,
    borderRadius: R.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.accentMid,
  },
  selectedFoodLeft: { flex: 1 },
  selectedFoodLabel: { fontSize: 11, fontWeight: '600', color: C.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  selectedFoodName: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  selectedFoodCat: { fontSize: 12, color: C.textSecondary, marginTop: 1 },
  changeText: { fontSize: 13, color: C.accent, fontWeight: '600' },

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
    marginBottom: 18,
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

  addBtn: {
    backgroundColor: C.accent,
    borderRadius: R.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  disabled: { opacity: 0.5 },
});
