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
    .single();

  if (profile?.seeded) return;

  const rows = SEED_FOODS.map((f) => ({ ...f, user_id: userId }));

  const { error: insertError } = await supabase
    .from('foods')
    .upsert(rows, { onConflict: 'user_id, lower(name)', ignoreDuplicates: true });

  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ seeded: true })
    .eq('id', userId);

  if (updateError) throw updateError;
}
