import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (_event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
      if (_event === 'USER_UPDATED' || _event === 'SIGNED_OUT') {
        setRecoveryMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function signInWithOAuth(provider: 'google' | 'apple') {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) throw error;
  }

  async function requestPasswordReset(email: string) {
    const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin + '/reset-password'
      : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  return { session, user, loading, recoveryMode, signIn, signUp, signOut, signInWithOAuth, requestPasswordReset, updatePassword };
}
