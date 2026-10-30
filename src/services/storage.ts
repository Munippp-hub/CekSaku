import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PersistedState } from '@/types/models';

const STORAGE_KEY = 'ceksaku:state:v1';

/**
 * Single seam for persistence. Today it is backed by AsyncStorage/localStorage;
 * swapping in an authenticated API later only requires changing this module.
 */
export const storageRepository = {
  async load(): Promise<PersistedState | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedState;
    } catch (error) {
      console.warn('[CekSaku] Failed to read local state', error);
      return null;
    }
  },

  async save(state: PersistedState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[CekSaku] Failed to persist local state', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[CekSaku] Failed to clear local state', error);
    }
  },
};
