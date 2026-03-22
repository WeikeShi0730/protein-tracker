import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useFoods } from '@/hooks/useFoods';
import FoodForm from '@/components/FoodForm';
import type { Food } from '@/types';

type FoodInput = Omit<Food, 'id' | 'user_id' | 'created_at'>;

export default function FoodsScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { foods, loading, error, addFood, editFood, removeFood } = useFoods(profile, profileLoading);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  function openAdd() {
    setEditingFood(null);
    setModalVisible(true);
  }

  function openEdit(food: Food) {
    setEditingFood(food);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingFood(null);
  }

  async function handleSubmit(data: FoodInput) {
    if (editingFood) {
      await editFood(editingFood.id, data);
    } else {
      await addFood(data);
    }
    closeModal();
  }

  function confirmDelete(food: Food) {
    Alert.alert(
      'Delete Food',
      `Delete "${food.name}"? Any log entries using this food will also be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeFood(food.id),
        },
      ]
    );
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
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No foods yet. Add one!</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
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
              <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add Food</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingFood ? 'Edit Food' : 'Add Food'}</Text>
          </View>
          <View style={styles.modalBody}>
            <FoodForm
              initial={editingFood ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              submitLabel={editingFood ? 'Save Changes' : 'Add Food'}
            />
          </View>
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
  cardInfo: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '600', color: '#111' },
  foodMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
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
  addBtn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  modalBody: { padding: 16, flex: 1 },
});
