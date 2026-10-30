import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PIN_KEY = 'ceksaku.pin';

interface PinRecord {
  salt: string;
  hash: string;
  updatedAt: string;
}

/**
 * SecureStore has no web implementation, so PIN records fall back to
 * AsyncStorage on web. The PIN itself is only ever stored as a salted SHA-256
 * hash, never in plain text.
 */
function canUseSecureStore() {
  return Platform.OS !== 'web';
}

async function readRaw(key: string): Promise<string | null> {
  if (canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function deleteRaw(key: string): Promise<void> {
  if (canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

async function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export const pinService = {
  async hasPin(): Promise<boolean> {
    const raw = await readRaw(PIN_KEY);
    return Boolean(raw);
  },

  async savePin(pin: string): Promise<void> {
    const salt = Crypto.randomUUID();
    const hash = await hashPin(pin, salt);
    const record: PinRecord = { salt, hash, updatedAt: new Date().toISOString() };
    await writeRaw(PIN_KEY, JSON.stringify(record));
  },

  async verifyPin(pin: string): Promise<boolean> {
    const raw = await readRaw(PIN_KEY);
    if (!raw) return false;
    try {
      const record = JSON.parse(raw) as PinRecord;
      const hash = await hashPin(pin, record.salt);
      return hash === record.hash;
    } catch {
      return false;
    }
  },

  async clearPin(): Promise<void> {
    await deleteRaw(PIN_KEY);
  },
};
