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
  const { data, error } = await supabase
    .from('foods')
    .insert(food)
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
  // Check if already seeded
  const { data: profile } = await supabase
    .from('profiles')
    .select('seeded')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.seeded) return;

  const rows = SEED_FOODS.map((f) => ({ ...f, user_id: userId }));

  // Plain insert — seeded flag prevents this from running twice
  const { error: insertError } = await supabase
    .from('foods')
    .insert(rows);

  if (insertError) throw insertError;

  // Upsert so it creates the profile row if it doesn't exist yet
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({ id: userId, seeded: true });

  if (updateError) throw updateError;
}
