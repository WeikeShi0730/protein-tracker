import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useFoods } from '@/hooks/useFoods';
import { useLogs } from '@/hooks/useLogs';
import GoalsProgressBar from '@/components/GoalsProgressBar';
import DailyLogTable from '@/components/DailyLogTable';
import PastDayAccordion from '@/components/PastDayAccordion';
import AddLogEntryModal from '@/components/AddLogEntryModal';
import EditLogEntryModal from '@/components/EditLogEntryModal';
import type { LogEntry } from '@/types';

export default function TodayScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { foods, loading: foodsLoading } = useFoods(profile);
  const { todayLogs, pastDays, loading: logsLoading, addLog, editLog, removeLog, reload } = useLogs();

  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<LogEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loading = profileLoading || foodsLoading || logsLoading;

  const totalProtein = todayLogs.reduce(
    (sum, e) => sum + e.servings * e.foods.protein_per_serving,
    0
  );
  const totalCalories = todayLogs.reduce(
    (sum, e) => sum + e.servings * e.foods.calories_per_serving,
    0
  );

  async function handleRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  async function handleDelete(id: string) {
    try {
      await removeLog(id);
    } catch (e: any) {
      console.error(e.message);
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goals</Text>
          <GoalsProgressBar
            consumed={totalProtein}
            goal={profile?.daily_protein_goal ?? 150}
            label="Protein"
            unit="g"
            color="#3b82f6"
          />
          <GoalsProgressBar
            consumed={totalCalories}
            goal={profile?.daily_calorie_goal ?? 2000}
            label="Calories"
            unit=" kcal"
            color="#10b981"
          />
        </View>

        {/* Today's Log */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <DailyLogTable
            entries={todayLogs}
            onEdit={(entry) => setEditEntry(entry)}
            onDelete={handleDelete}
          />
        </View>

        {/* 7-Day History */}
        {pastDays.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past 7 Days</Text>
            {pastDays.map((day) => (
              <PastDayAccordion
                key={day.date}
                dayGroup={day}
                onEdit={(entry) => setEditEntry(entry)}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddLogEntryModal
        visible={showAdd}
        foods={foods}
        onClose={() => setShowAdd(false)}
        onAdd={addLog}
      />

      <EditLogEntryModal
        visible={editEntry !== null}
        entry={editEntry}
        onClose={() => setEditEntry(null)}
        onSave={editLog}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 12 },
  addBtn: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
