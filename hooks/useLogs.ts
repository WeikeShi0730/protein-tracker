import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLogsForRange, createLog, updateLog, deleteLog } from '@/lib/api/logs';
import type { LogEntry, DayGroup } from '@/types';

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

export function useLogs() {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Group entries by local calendar date
  const todayKey = localDateKey(new Date());

  const grouped = allEntries.reduce<Record<string, LogEntry[]>>((acc, entry) => {
    const key = localDateKey(new Date(entry.logged_at));
    (acc[key] ??= []).push(entry);
    return acc;
  }, {});

  const todayLogs = grouped[todayKey] ?? [];

  // Build past 7 days (not including today), sorted most recent first
  const pastDays: DayGroup[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    return localDateKey(d);
  })
    .filter((key) => grouped[key])
    .map((key) => {
      const entries = grouped[key];
      return {
        date: key,
        label: formatDayLabel(key),
        entries,
        ...computeTotals(entries),
      };
    });

  async function addLog(entry: {
    food_id: string;
    servings: number;
    logged_at?: string;
    notes?: string | null;
  }) {
    if (!user) throw new Error('Not authenticated');
    const created = await createLog({ ...entry, user_id: user.id });
    setAllEntries((prev) => [created, ...prev]);
  }

  async function editLog(id: string, updates: { servings?: number; notes?: string | null }) {
    await updateLog(id, updates);
    setAllEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }

  async function removeLog(id: string) {
    await deleteLog(id);
    setAllEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return { todayLogs, pastDays, loading, error, addLog, editLog, removeLog, reload: load };
}
