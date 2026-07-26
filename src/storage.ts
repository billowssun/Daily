import AsyncStorage from '@react-native-async-storage/async-storage';

import { initialState } from './data/mock';
import type { RixuState } from './types';

export const STORAGE_KEY = 'rixu-web-state-v1';

const isValidState = (value: unknown): value is RixuState => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as RixuState;
  return Array.isArray(candidate.notes) && Array.isArray(candidate.tasks);
};

export const loadRixuState = async (): Promise<RixuState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw && typeof globalThis.localStorage !== 'undefined') {
      const legacy = globalThis.localStorage.getItem(STORAGE_KEY);
      if (legacy) {
        const migrated = JSON.parse(legacy);
        if (isValidState(migrated)) {
          await AsyncStorage.setItem(STORAGE_KEY, legacy);
          return migrated;
        }
      }
    }
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed : initialState;
  } catch {
    return initialState;
  }
};

export const saveRixuState = async (state: RixuState) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the in-memory app usable when storage is unavailable.
  }
};
