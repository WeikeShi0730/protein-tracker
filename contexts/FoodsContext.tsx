import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { getFoods, createFood, updateFood, deleteFood, seedFoodsForUser } from '@/lib/api/foods';
import type { Food } from '@/types';

interface FoodsContextValue {
  foods: Food[];
  loading: boolean;
  error: string | null;
  addFood: (food: Omit<Food, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editFood: (id: string, updates: Partial<Omit<Food, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const FoodsContext = createContext<FoodsContextValue | null>(null);

export function FoodsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      if (!profile || !profile.seeded) {
        await seedFoodsForUser(user.id);
      }
      const data = await getFoods();
      setFoods(data);
    } catch (e: any) {
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

  return (
    <FoodsContext.Provider value={{ foods, loading, error, addFood, editFood, removeFood, reload: load }}>
      {children}
    </FoodsContext.Provider>
  );
}

export function useFoods() {
  const ctx = useContext(FoodsContext);
  if (!ctx) throw new Error('useFoods must be used within FoodsProvider');
  return ctx;
}
