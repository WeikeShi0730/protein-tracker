import { supabase } from '@/lib/supabase';

export interface GoalSnapshot {
  date: string; // YYYY-MM-DD
  protein_goal: number;
  calorie_goal: number;
}

export async function getGoalHistory(): Promise<GoalSnapshot[]> {
  const { data, error } = await supabase
    .from('goal_history')
    .select('date, protein_goal, calorie_goal')
    .order('date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function upsertGoalForToday(
  userId: string,
  protein_goal: number,
  calorie_goal: number
): Promise<void> {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const { error } = await supabase
    .from('goal_history')
    .upsert(
      { user_id: userId, date: today, protein_goal, calorie_goal },
      { onConflict: 'user_id,date' }
    );
  if (error) throw error;
}
