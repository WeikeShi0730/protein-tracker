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
  food_id: string;
  servings: number;
  logged_at?: string;
  notes?: string | null;
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

export async function deleteLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
