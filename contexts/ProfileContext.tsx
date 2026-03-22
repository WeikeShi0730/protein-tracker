import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile, upsertProfile } from '@/lib/api/profile';
import type { Profile } from '@/types';

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateGoals: (protein: number, calories: number) => Promise<void>;
  reload: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getProfile(user.id);
      setProfile(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateGoals(protein: number, calories: number) {
    if (!user) return;
    await upsertProfile(user.id, {
      daily_protein_goal: protein,
      daily_calorie_goal: calories,
    });
    setProfile((prev) =>
      prev ? { ...prev, daily_protein_goal: protein, daily_calorie_goal: calories } : prev
    );
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateGoals, reload: load }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
