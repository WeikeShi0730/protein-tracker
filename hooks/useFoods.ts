import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFoods, createFood, updateFood, deleteFood, seedFoodsForUser } from '@/lib/api/foods';
import type { Food, Profile } from '@/types';

export function useFoods(profile: Profile | null, profileLoading: boolean = false) {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      console.log('[useFoods] no user, skipping load');
      return;
    }
    try {
      setLoading(true);
      console.log('[useFoods] loading, profile:', profile, 'user:', user.id);

      // Seed on first load if not yet seeded (also handles missing profile row)
      if (!profile || !profile.seeded) {
        console.log('[useFoods] seeding foods...');
        await seedFoodsForUser(user.id);
        console.log('[useFoods] seeding done');
      }

      const data = await getFoods();
      console.log('[useFoods] getFoods returned:', data.length, 'items');
      setFoods(data);
    } catch (e: any) {
      console.error('[useFoods] error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (!profileLoading) {
      load();
    }
  }, [load, profileLoading]);

  async function addFood(food: Omit<Food, 'id' | 'user_id' | 'created_at'>) {
    const created = await createFood(food);
    setFoods((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function editFood(id: string, updates: Partial<Omit<Food, 'id' | 'user_id' | 'created_at'>>) {
    await updateFood(id, updates);
    setFoods((prev) =>
      prev
        .map((f) => (f.id === id ? { ...f, ...updates } : f))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function removeFood(id: string) {
    await deleteFood(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  return { foods, loading, error, addFood, editFood, removeFood, reload: load };
}
