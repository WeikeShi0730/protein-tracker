import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import type { DayGroup, LogEntry } from '@/types';
import DailyLogTable from './DailyLogTable';
import GoalsProgressBar from './GoalsProgressBar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  dayGroup: DayGroup;
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

export default function PastDayAccordion({ dayGroup, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
  }

  const hasGoals = dayGroup.proteinGoal != null && dayGroup.calorieGoal != null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{dayGroup.label}</Text>
          <Text style={styles.totals}>
            {Math.round(dayGroup.totalProtein)}g protein · {Math.round(dayGroup.totalCalories)} kcal
          </Text>
        </View>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.body}>
          {hasGoals && (
            <View style={styles.goals}>
              <GoalsProgressBar
                consumed={dayGroup.totalProtein}
                goal={dayGroup.proteinGoal!}
                label="Protein"
                unit="g"
                color="#3b82f6"
              />
              <GoalsProgressBar
                consumed={dayGroup.totalCalories}
                goal={dayGroup.calorieGoal!}
                label="Calories"
                unit=" kcal"
                color="#10b981"
              />
            </View>
          )}
          <DailyLogTable entries={dayGroup.entries} onEdit={onEdit} onDelete={onDelete} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: { flex: 1 },
  dateLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  totals: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 12, color: '#9ca3af', marginLeft: 8 },
  body: { paddingHorizontal: 12, paddingBottom: 12 },
  goals: {
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 8,
  },
});
