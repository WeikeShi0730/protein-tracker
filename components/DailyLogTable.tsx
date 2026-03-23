import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { LogEntry } from '@/types';
import { C, R, shadow } from '@/constants/ClaudeTheme';

interface Props {
  entries: LogEntry[];
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

export default function DailyLogTable({ entries, onEdit, onDelete }: Props) {
  const [deletingEntry, setDeletingEntry] = useState<LogEntry | null>(null);

  if (entries.length === 0) {
    return <Text style={styles.empty}>No entries yet — add something nutritious.</Text>;
  }

  return (
    <View>
      {entries.map((entry, index) => {
        const protein = entry.servings * entry.foods.protein_per_serving;
        const calories = entry.servings * entry.foods.calories_per_serving;
        return (
          <Animated.View
            key={entry.id}
            entering={FadeInUp.delay(index * 40).duration(300)}
          >
            <View style={styles.row}>
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
                  <Text style={styles.macroProtein}>{Math.round(protein)}g</Text>
                  <Text style={styles.macroCal}>{Math.round(calories)} kcal</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => onEdit(entry)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setDeletingEntry(entry)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );
      })}

      <Modal
        visible={!!deletingEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingEntry(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setDeletingEntry(null)}>
          <Pressable style={styles.dialog}>
            <Text style={styles.dialogTitle}>Remove Entry</Text>
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
                <Text style={styles.dialogDeleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: C.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 14,
  },
  row: {
    backgroundColor: C.bgSubtle,
    borderRadius: R.md,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  rowMain: { flexDirection: 'row', justifyContent: 'space-between' },
  foodInfo: { flex: 1, marginRight: 8 },
  foodName: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  servings: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  notes: { fontSize: 12, color: C.textMuted, marginTop: 2, fontStyle: 'italic' },
  macros: { alignItems: 'flex-end', gap: 2 },
  macroProtein: { fontSize: 13, color: C.accent, fontWeight: '600' },
  macroCal: { fontSize: 12, color: C.textSecondary },

  actions: { flexDirection: 'row', marginTop: 10, gap: 6, justifyContent: 'flex-end' },
  editBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: R.sm,
    backgroundColor: C.bgMuted,
    borderWidth: 1,
    borderColor: C.border,
  },
  editBtnText: { fontSize: 12, fontWeight: '500', color: C.textSecondary },
  deleteBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: R.sm,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '500', color: C.error },

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
    ...shadow,
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
});
