import { useState, useMemo, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useProfile } from '@/contexts/ProfileContext';
import { useFoods } from '@/hooks/useFoods';
import FoodForm from '@/components/FoodForm';
import type { Food } from '@/types';

type FoodInput = Omit<Food, 'id' | 'user_id' | 'created_at'>;

export default function FoodsScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { foods, loading, error, addFood, editFood, removeFood } = useFoods(profile, profileLoading);

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      .map(([title, data]) => ({ title, data }));
  }, [foods]);

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#dc2626', padding: 20, textAlign: 'center' }}>Error: {error}</Text>
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
        ListEmptyComponent={<Text style={styles.empty}>No foods yet. Add one!</Text>}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.7}>
            <View style={styles.cardInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodMeta}>
                {item.serving_unit} · {item.protein_per_serving}g protein · {item.calories_per_serving} kcal
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
        )}
      />

      {/* Delete confirm for card-level delete button */}
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
            <Text style={styles.modalTitle}>{editingFood ? 'Edit Food' : 'Add Food'}</Text>
            {!!editingFood && (
              <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
                <Text style={styles.modalDeleteBtn}>Delete</Text>
              </TouchableOpacity>
            )}
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },
  sectionHeader: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 6,
    borderRadius: 6,
  },
  sectionHeaderText: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardActions: { flexDirection: 'row', gap: 8 },
  cardInfo: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '600', color: '#111' },
  foodMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  editBtn: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '500', color: '#dc2626' },
  headerBtn: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  headerBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 24, marginHorizontal: 32, width: '100%', maxWidth: 360,
  },
  dialogTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 8 },
  dialogMessage: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 20 },
  dialogActions: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1, paddingVertical: 11, backgroundColor: '#f3f4f6',
    borderRadius: 10, alignItems: 'center',
  },
  dialogCancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  dialogDelete: {
    flex: 1, paddingVertical: 11, backgroundColor: '#dc2626',
    borderRadius: 10, alignItems: 'center',
  },
  dialogDeleteText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  modalDeleteBtn: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
  modalBody: { padding: 16, flex: 1 },
});
