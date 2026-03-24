import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useNavigation } from 'expo-router';
import { useFoods } from '@/contexts/FoodsContext';
import FoodForm from '@/components/FoodForm';
import type { Food } from '@/types';
import { C, R, shadow, shadowStrong } from '@/constants/ClaudeTheme';

type FoodInput = Omit<Food, 'id' | 'user_id' | 'created_at'>;

export default function FoodsScreen() {
  const { foods, loading, error, addFood, editFood, removeFood } = useFoods();

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const hasInitializedCollapse = useRef(false);

  useEffect(() => {
    if (!loading && foods.length > 0 && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setCollapsedCategories(new Set(foods.map(f => f.category || 'Other')));
    }
  }, [foods, loading]);

  function toggleCategory(cat: string) {
    LayoutAnimation.configureNext({
      duration: 240,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.85 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const openAdd = useCallback(() => {
    setEditingFood(null);
    setModalVisible(true);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerBtn} onPress={openAdd}>
          <Text style={styles.headerBtnText}>+ Add Food</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, openAdd]);

  const sections = useMemo(() => {
    const grouped: Record<string, Food[]> = {};
    for (const f of foods) {
      const cat = f.category || 'Other';
      (grouped[cat] ??= []).push(f);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({
        title,
        data: collapsedCategories.has(title) ? [] : data,
        count: data.length,
      }));
  }, [foods, collapsedCategories]);

  function openEdit(food: Food) {
    setEditingFood(food);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingFood(null);
    setShowDeleteConfirm(false);
  }

  async function handleSubmit(data: FoodInput) {
    if (editingFood) {
      await editFood(editingFood.id, data);
    } else {
      await addFood(data);
    }
    closeModal();
  }

  async function handleDelete() {
    const food = deletingFood ?? editingFood;
    if (!food) return;
    try {
      await removeFood(food.id);
      setDeletingFood(null);
      setShowDeleteConfirm(false);
      closeModal();
    } catch (e: any) {
      setShowDeleteConfirm(false);
      Alert.alert('Error', e.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: C.error, padding: 20, textAlign: 'center' }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🥗</Text>
            <Text style={styles.emptyTitle}>No foods yet</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add Food" to build your library</Text>
          </View>
        }
        renderSectionHeader={({ section: { title, count } }) => {
          const collapsed = collapsedCategories.has(title);
          return (
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleCategory(title)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionHeaderText}>{title}</Text>
              <View style={styles.sectionHeaderRight}>
                <Text style={styles.sectionHeaderCount}>{count}</Text>
                <Text style={[styles.sectionHeaderChevron, collapsed && styles.sectionHeaderChevronCollapsed]}>
                  ›
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 30).duration(280)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => openEdit(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodMeta}>
                  {item.serving_unit} · <Text style={styles.foodProtein}>{item.protein_per_serving}g protein</Text> · {item.calories_per_serving} kcal
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeletingFood(item)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {/* Delete confirm for card-level delete */}
      <Modal visible={!!deletingFood} transparent animationType="fade" onRequestClose={() => setDeletingFood(null)}>
        <Pressable style={styles.overlay} onPress={() => setDeletingFood(null)}>
          <Pressable style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete Food</Text>
            <Text style={styles.dialogMessage}>
              Delete "{deletingFood?.name}"? Any log entries using this food will also be removed.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.dialogCancel} onPress={() => setDeletingFood(null)}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogDelete} onPress={handleDelete}>
                <Text style={styles.dialogDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add / Edit modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalDrag} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{editingFood ? 'Edit Food' : 'Add Food'}</Text>
              {!!editingFood && (
                <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
                  <Text style={styles.modalDeleteBtn}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.modalBody}>
            <FoodForm
              initial={editingFood ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              submitLabel={editingFood ? 'Save Changes' : 'Add Food'}
            />
          </View>

          {/* Inline delete confirmation overlay */}
          {showDeleteConfirm && (
            <Pressable style={styles.inlineOverlay} onPress={() => setShowDeleteConfirm(false)}>
              <Pressable style={styles.dialog}>
                <Text style={styles.dialogTitle}>Delete Food</Text>
                <Text style={styles.dialogMessage}>
                  Delete "{editingFood?.name}"? Any log entries using this food will also be removed.
                </Text>
                <View style={styles.dialogActions}>
                  <TouchableOpacity style={styles.dialogCancel} onPress={() => setShowDeleteConfirm(false)}>
                    <Text style={styles.dialogCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dialogDelete} onPress={handleDelete}>
                    <Text style={styles.dialogDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  list: { padding: 16, paddingBottom: 32 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: C.textSecondary, textAlign: 'center' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 4,
    marginTop: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderCount: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
  },
  sectionHeaderChevron: {
    fontSize: 16,
    color: C.textMuted,
    transform: [{ rotate: '90deg' }],
  },
  sectionHeaderChevronCollapsed: {
    transform: [{ rotate: '0deg' }],
  },

  card: {
    backgroundColor: C.bgElevated,
    borderRadius: R.md,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  cardActions: { flexDirection: 'row', gap: 6 },
  cardInfo: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  foodMeta: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  foodProtein: { color: C.accent, fontWeight: '600' },

  editBtn: {
    backgroundColor: C.bgMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.border,
  },
  editBtnText: { fontSize: 12, fontWeight: '500', color: C.textSecondary },
  deleteBtn: {
    backgroundColor: C.errorBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '500', color: C.error },

  headerBtn: {
    backgroundColor: C.accent,
    borderRadius: R.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  headerBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

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
    ...shadowStrong,
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
  dialogDelete: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: C.error,
    borderRadius: R.md,
    alignItems: 'center',
  },
  dialogDeleteText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { flex: 1, backgroundColor: C.bgElevated },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 14,
  },
  modalDrag: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  modalDeleteBtn: { fontSize: 14, fontWeight: '600', color: C.error },
  modalBody: { padding: 20, flex: 1 },
});
