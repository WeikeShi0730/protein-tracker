import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import type { DayGroup, LogEntry } from '@/types';
import DailyLogTable from './DailyLogTable';
import GoalsProgressBar from './GoalsProgressBar';
import { C, R } from '@/constants/ClaudeTheme';

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
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setOpen((prev) => !prev);
  }

  const hasGoals = dayGroup.proteinGoal != null && dayGroup.calorieGoal != null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{dayGroup.label}</Text>
          <View style={styles.totalsRow}>
            <View style={styles.totalChip}>
              <Text style={styles.totalProtein}>{Math.round(dayGroup.totalProtein)}g</Text>
              <Text style={styles.totalChipLabel}>protein</Text>
            </View>
            <View style={styles.totalChipDivider} />
            <View style={styles.totalChip}>
              <Text style={styles.totalCal}>{Math.round(dayGroup.totalCalories)}</Text>
              <Text style={styles.totalChipLabel}>kcal</Text>
            </View>
          </View>
        </View>
        <View style={[styles.chevronWrap, open && styles.chevronWrapOpen]}>
          <Text style={styles.chevron}>›</Text>
        </View>
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
                color={C.accent}
              />
              <GoalsProgressBar
                consumed={dayGroup.totalCalories}
                goal={dayGroup.calorieGoal!}
                label="Calories"
                unit=" kcal"
                color={C.success}
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
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  headerLeft: { flex: 1 },
  dateLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 5 },
  totalsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  totalChip: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  totalProtein: { fontSize: 13, fontWeight: '600', color: C.accent },
  totalCal: { fontSize: 13, fontWeight: '500', color: C.textSecondary },
  totalChipLabel: { fontSize: 11, color: C.textMuted },
  totalChipDivider: { width: 1, height: 12, backgroundColor: C.border, marginHorizontal: 6 },

  chevronWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  chevronWrapOpen: {
    transform: [{ rotate: '90deg' }],
  },
  chevron: { fontSize: 16, color: C.textSecondary, lineHeight: 16, includeFontPadding: false },

  body: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4 },
  goals: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 10,
  },
});
