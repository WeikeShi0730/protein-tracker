import { supabase } from '@/lib/supabase';
import type { LogEntry } from '@/types';

export async function getLogsForRange(from: Date, to: Date): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, foods(name, serving_unit, calories_per_serving, protein_per_serving)')
    .gte('logged_at', from.toISOString())
    .lte('logged_at', to.toISOString())
    .order('logged_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LogEntry[];
}

export async function createLog(entry: {
  user_id: string;
  food_id: string;
  servings: number;
  logged_at?: string;
  notes?: string | null;
  protein_goal?: number | null;
  calorie_goal?: number | null;
}): Promise<LogEntry> {
  const { data, error } = await supabase
    .from('daily_logs')
    .insert({
      ...entry,
      logged_at: entry.logged_at ?? new Date().toISOString(),
    })
    .select('*, foods(name, serving_unit, calories_per_serving, protein_per_serving)')
    .single();

  if (error) throw error;
  return data as LogEntry;
}

export async function updateLog(
  id: string,
  updates: { servings?: number; notes?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function updateTodayGoals(
  userId: string,
  protein_goal: number,
  calorie_goal: number
): Promise<void> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { error } = await supabase
    .from('daily_logs')
    .update({ protein_goal, calorie_goal })
    .eq('user_id', userId)
    .gte('logged_at', start.toISOString())
    .lte('logged_at', end.toISOString());

  if (error) throw error;
}

export async function deleteLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
