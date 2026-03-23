import { supabase } from '@/lib/supabase';
import type { Food } from '@/types';
import { SEED_FOODS } from '@/constants/seedFoods';

export async function getFoods(): Promise<Food[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createFood(
  food: Omit<Food, 'id' | 'user_id' | 'created_at'>
): Promise<Food> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('foods')
    .insert({ ...food, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFood(
  id: string,
  updates: Partial<Omit<Food, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('foods')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteFood(id: string): Promise<void> {
  const { error } = await supabase
    .from('foods')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function seedFoodsForUser(userId: string): Promise<void> {
  // Check profile seeded flag first
  const { data: profile } = await supabase
    .from('profiles')
    .select('seeded')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.seeded) return;

  // Also check if foods already exist (handles interrupted previous seed attempts)
  const { count } = await supabase
    .from('foods')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!count || count === 0) {
    const rows = SEED_FOODS.map((f) => ({ ...f, user_id: userId }));
    const { error: insertError } = await supabase.from('foods').insert(rows);
    if (insertError) throw insertError;
  }

  // Upsert profile row so it works even if the row doesn't exist yet
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({ id: userId, seeded: true });

  if (updateError) throw updateError;
}
