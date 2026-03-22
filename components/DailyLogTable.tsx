import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { LogEntry } from '@/types';

interface Props {
  entries: LogEntry[];
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

export default function DailyLogTable({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return <Text style={styles.empty}>No entries yet.</Text>;
  }

  return (
    <View>
      {entries.map((entry) => {
        const protein = entry.servings * entry.foods.protein_per_serving;
        const calories = entry.servings * entry.foods.calories_per_serving;
        const time = new Date(entry.logged_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });

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
                <Text style={styles.timeText}>{time}</Text>
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
                onPress={() => onDelete(entry.id)}
              >
                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
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
  timeText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 8, gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtn: { backgroundColor: '#e5e7eb' },
  deleteBtn: { backgroundColor: '#fee2e2' },
  actionBtnText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  deleteBtnText: { color: '#dc2626' },
});
