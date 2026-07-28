import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './lib/supabase';

export type StateKind = 'planner' | 'finance';

const cacheKey = (userId: string, kind: StateKind) => `@rixu/${userId}/${kind}-v1`;
const LEGACY_OWNER_KEY = '@rixu/legacy-data-owner-v1';

export async function loadCloudState<T>(userId: string, kind: StateKind): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_states')
    .select('payload')
    .eq('user_id', userId)
    .eq('kind', kind)
    .maybeSingle();
  if (error) throw error;
  return (data?.payload as T | undefined) ?? null;
}

export async function saveCloudState<T>(userId: string, kind: StateKind, payload: T) {
  if (!supabase) return;
  const { error } = await supabase.from('user_states').upsert({
    user_id: userId,
    kind,
    payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,kind' });
  if (error) throw error;
}

export async function loadUserCache<T>(userId: string, kind: StateKind): Promise<T | null> {
  const value = await AsyncStorage.getItem(cacheKey(userId, kind));
  return value ? JSON.parse(value) as T : null;
}

export async function saveUserCache<T>(userId: string, kind: StateKind, payload: T) {
  await AsyncStorage.setItem(cacheKey(userId, kind), JSON.stringify(payload));
}

export async function claimLegacyState<T>(
  userId: string,
  loader: () => Promise<T>,
  emptyState: T,
): Promise<T> {
  const owner = await AsyncStorage.getItem(LEGACY_OWNER_KEY);
  if (owner && owner !== userId) return emptyState;
  if (!owner) await AsyncStorage.setItem(LEGACY_OWNER_KEY, userId);
  return loader();
}
