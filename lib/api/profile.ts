import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertProfile(
  userId: string,
  goals: { daily_protein_goal: number; daily_calorie_goal: number }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...goals, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}
