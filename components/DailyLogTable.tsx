import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import type { LogEntry } from '@/types';

interface Props {
  entries: LogEntry[];
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

export default function DailyLogTable({ entries, onEdit, onDelete }: Props) {
  const [deletingEntry, setDeletingEntry] = useState<LogEntry | null>(null);

  if (entries.length === 0) {
    return <Text style={styles.empty}>No entries yet.</Text>;
  }

  return (
    <View>
      {entries.map((entry) => {
        const protein = entry.servings * entry.foods.protein_per_serving;
        const calories = entry.servings * entry.foods.calories_per_serving;
        return (
          <View key={entry.id} style={styles.row}>
            <View style={styles.rowMain}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName} numberOfLines={1}>
                  {entry.foods.name}
                </Text>
                <Text style={styles.servings}>
                  {entry.servings} × {entry.foods.serving_unit}
                </Text>
                {entry.notes ? <Text style={styles.notes}>{entry.notes}</Text> : null}
              </View>
              <View style={styles.macros}>
                <Text style={styles.macroText}>{Math.round(protein)}g P</Text>
                <Text style={styles.macroText}>{Math.round(calories)} kcal</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => onEdit(entry)}
              >
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => setDeletingEntry(entry)}
              >
                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Modal visible={!!deletingEntry} transparent animationType="fade" onRequestClose={() => setDeletingEntry(null)}>
        <Pressable style={styles.overlay} onPress={() => setDeletingEntry(null)}>
          <Pressable style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete Entry</Text>
            <Text style={styles.dialogMessage}>
              Remove "{deletingEntry?.foods.name}" from your log?
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.dialogCancel} onPress={() => setDeletingEntry(null)}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogDelete}
                onPress={() => {
                  if (deletingEntry) onDelete(deletingEntry.id);
                  setDeletingEntry(null);
                }}
              >
                <Text style={styles.dialogDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
  row: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 8,
    padding: 12,
  },
  rowMain: { flexDirection: 'row', justifyContent: 'space-between' },
  foodInfo: { flex: 1, marginRight: 8 },
  foodName: { fontSize: 15, fontWeight: '600', color: '#111' },
  servings: { fontSize: 13, color: '#555', marginTop: 2 },
  notes: { fontSize: 12, color: '#888', marginTop: 2, fontStyle: 'italic' },
  macros: { alignItems: 'flex-end' },
  macroText: { fontSize: 13, color: '#374151', fontWeight: '500' },

  actions: { flexDirection: 'row', marginTop: 8, gap: 8, justifyContent: 'flex-end' },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtn: { backgroundColor: '#e5e7eb' },
  deleteBtn: { backgroundColor: '#fee2e2' },
  actionBtnText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  deleteBtnText: { color: '#dc2626' },
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
});
