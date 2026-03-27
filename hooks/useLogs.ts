import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLogsForRange, createLog, updateLog, deleteLog } from '@/lib/api/logs';
import type { LogEntry, DayGroup, Profile } from '@/types';

function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

function localDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA'); // "YYYY-MM-DD" in local time
}

function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function computeTotals(entries: LogEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      totalProtein: acc.totalProtein + e.servings * e.foods.protein_per_serving,
      totalCalories: acc.totalCalories + e.servings * e.foods.calories_per_serving,
    }),
    { totalProtein: 0, totalCalories: 0 }
  );
}

export function useLogs(profile: Profile | null) {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [olderEntries, setOlderEntries] = useState<LogEntry[]>([]);
  const [olderLoading, setOlderLoading] = useState(false);
  const prevGoalsRef = useRef<{ protein: number; calories: number } | null>(null);

  // When goals change, update today's entries in local state to match
  useEffect(() => {
    if (!profile) return;
    const { daily_protein_goal: protein, daily_calorie_goal: calories } = profile;
    const prev = prevGoalsRef.current;
    if (prev && prev.protein === protein && prev.calories === calories) return;
    prevGoalsRef.current = { protein, calories };
    if (!prev) return; // skip on first mount — entries just loaded from DB
    const todayKey = new Date().toLocaleDateString('en-CA');
    setAllEntries((entries) =>
      entries.map((e) => {
        if (new Date(e.logged_at).toLocaleDateString('en-CA') === todayKey) {
          return { ...e, protein_goal: protein, calorie_goal: calories };
        }
        return e;
      })
    );
  }, [profile?.daily_protein_goal, profile?.daily_calorie_goal]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const to = endOfDay(new Date());
      const from = startOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const data = await getLogsForRange(from, to);
      setAllEntries(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const todayKey = localDateKey(new Date());

  const grouped = allEntries.reduce<Record<string, LogEntry[]>>((acc, entry) => {
    const key = localDateKey(new Date(entry.logged_at));
    (acc[key] ??= []).push(entry);
    return acc;
  }, {});

  const todayLogs = grouped[todayKey] ?? [];

  const pastDays: DayGroup[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    return localDateKey(d);
  })
    .filter((key) => grouped[key])
    .map((key) => {
      const entries = grouped[key];
      // Goals are snapshotted on each entry at log time. Use the first entry that has them.
      // No fallback to current profile — past goals must come from stored data only.
      const snap = entries.find((e) => e.protein_goal != null && e.calorie_goal != null);
      return {
        date: key,
        label: formatDayLabel(key),
        entries,
        ...computeTotals(entries),
        proteinGoal: snap?.protein_goal ?? undefined,
        calorieGoal: snap?.calorie_goal ?? undefined,
      };
    });

  async function addLog(entry: {
    food_id: string;
    servings: number;
    logged_at?: string;
    notes?: string | null;
  }) {
    if (!user) throw new Error('Not authenticated');
    const created = await createLog({
      ...entry,
      user_id: user.id,
      protein_goal: profile?.daily_protein_goal ?? null,
      calorie_goal: profile?.daily_calorie_goal ?? null,
    });
    setAllEntries((prev) => [created, ...prev]);
  }

  async function editLog(id: string, updates: { servings?: number; notes?: string | null }) {
    await updateLog(id, updates);
    setAllEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }

  const loadOlderDays = useCallback(async () => {
    if (!user) return;
    try {
      setOlderLoading(true);
      const to = endOfDay(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000));
      const from = new Date('2020-01-01');
      const data = await getLogsForRange(from, to);
      setOlderEntries(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setOlderLoading(false);
    }
  }, [user]);

  async function removeLog(id: string) {
    await deleteLog(id);
    setAllEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const olderGrouped = olderEntries.reduce<Record<string, LogEntry[]>>((acc, entry) => {
    const key = localDateKey(new Date(entry.logged_at));
    (acc[key] ??= []).push(entry);
    return acc;
  }, {});

  const olderDays: DayGroup[] = Object.keys(olderGrouped)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const entries = olderGrouped[key];
      const snap = entries.find((e) => e.protein_goal != null && e.calorie_goal != null);
      return {
        date: key,
        label: formatDayLabel(key),
        entries,
        ...computeTotals(entries),
        proteinGoal: snap?.protein_goal ?? undefined,
        calorieGoal: snap?.calorie_goal ?? undefined,
      };
    });

  return { todayLogs, pastDays, olderDays, olderLoading, loading, error, addLog, editLog, removeLog, reload: load, loadOlderDays };
}
