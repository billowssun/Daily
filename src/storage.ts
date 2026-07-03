import { initialState } from './data/mock';
import type { RixuState } from './types';

export const STORAGE_KEY = 'rixu-web-state-v1';

const isBrowserStorageAvailable = () => typeof globalThis.localStorage !== 'undefined';

const isValidState = (value: unknown): value is RixuState => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as RixuState;
  return Array.isArray(candidate.notes) && Array.isArray(candidate.tasks);
};

export const loadRixuState = (): RixuState => {
  if (!isBrowserStorageAvailable()) return initialState;

  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed : initialState;
  } catch {
    return initialState;
  }
};

export const saveRixuState = (state: RixuState) => {
  if (!isBrowserStorageAvailable()) return;

  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota and privacy-mode failures; the in-memory app should keep working.
  }
};
