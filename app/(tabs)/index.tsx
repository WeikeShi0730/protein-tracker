import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useProfile } from '@/contexts/ProfileContext';
import { useFoods } from '@/contexts/FoodsContext';
import { useLogs } from '@/hooks/useLogs';
import GoalsProgressBar from '@/components/GoalsProgressBar';
import DailyLogTable from '@/components/DailyLogTable';
import PastDayAccordion from '@/components/PastDayAccordion';
import AddLogEntryModal from '@/components/AddLogEntryModal';
import EditLogEntryModal from '@/components/EditLogEntryModal';
import type { LogEntry } from '@/types';
import { C, R, shadow } from '@/constants/ClaudeTheme';

export default function TodayScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const { foods, loading: foodsLoading } = useFoods();
  const { todayLogs, pastDays, olderDays, olderLoading, loading: logsLoading, addLog, editLog, removeLog, reload, loadOlderDays } = useLogs(profile);

  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<LogEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showOlder, setShowOlder] = useState(false);
  const olderLoadedRef = useRef(false);

  function toggleOlder() {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    if (!olderLoadedRef.current) {
      olderLoadedRef.current = true;
      loadOlderDays();
    }
    setShowOlder((prev) => !prev);
  }

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
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.accent}
            colors={[C.accent]}
          />
        }
      >
        {/* Goals card */}
        <Animated.View entering={FadeInDown.delay(0).duration(350)} style={styles.goalsCard}>
          <View style={styles.goalsHeader}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            {totalProtein > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {Math.round((totalProtein / (profile?.daily_protein_goal ?? 150)) * 100)}%
                </Text>
              </View>
            )}
          </View>
          <GoalsProgressBar
            consumed={totalProtein}
            goal={profile?.daily_protein_goal ?? 150}
            label="Protein"
            unit="g"
            color={C.accent}
          />
          <GoalsProgressBar
            consumed={totalCalories}
            goal={profile?.daily_calorie_goal ?? 2000}
            label="Calories"
            unit=" kcal"
            color={C.success}
          />
        </Animated.View>

        {/* Add Entry Button */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnPlus}>+</Text>
            <Text style={styles.addBtnText}>Log Food Entry</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Log */}
        <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <DailyLogTable
            entries={todayLogs}
            onEdit={(entry) => setEditEntry(entry)}
            onDelete={handleDelete}
          />
        </Animated.View>

        {/* 7-Day History */}
        {pastDays.length > 0 && (
          <Animated.View entering={FadeIn.delay(240).duration(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Past 7 Days</Text>
            {pastDays.map((day) => (
              <PastDayAccordion
                key={day.date}
                dayGroup={day}
                onEdit={(entry) => setEditEntry(entry)}
                onDelete={handleDelete}
              />
            ))}
          </Animated.View>
        )}

        {/* Older History */}
        <Animated.View entering={FadeIn.delay(280).duration(350)} style={styles.section}>
          <TouchableOpacity style={styles.olderHeader} onPress={toggleOlder} activeOpacity={0.7}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Older</Text>
            <View style={[styles.chevronWrap, showOlder && styles.chevronWrapOpen]}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          {showOlder && (
            olderLoading ? (
              <ActivityIndicator size="small" color={C.accent} style={styles.olderLoader} />
            ) : olderDays.length === 0 ? (
              <Text style={styles.olderEmpty}>No older entries</Text>
            ) : (
              <View style={styles.olderContent}>
                {olderDays.map((day) => (
                  <PastDayAccordion
                    key={day.date}
                    dayGroup={day}
                    onEdit={(entry) => setEditEntry(entry)}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            )
          )}
        </Animated.View>
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
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 32 },

  goalsCard: {
    backgroundColor: C.bgElevated,
    borderRadius: R.lg,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressBadge: {
    backgroundColor: C.accentLight,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.accentMid,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.accent,
  },

  addBtn: {
    backgroundColor: C.accent,
    borderRadius: R.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
    ...shadow,
  },
  addBtnPlus: { color: 'rgba(255,255,255,0.8)', fontSize: 20, fontWeight: '300', lineHeight: 22 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15, letterSpacing: 0.2 },

  section: {
    backgroundColor: C.bgElevated,
    borderRadius: R.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    letterSpacing: 0.1,
    marginBottom: 12,
  },

  olderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  olderLoader: { marginTop: 12, marginBottom: 4 },
  olderEmpty: { fontSize: 13, color: C.textMuted, marginTop: 12 },
  olderContent: { marginTop: 12 },

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
});
