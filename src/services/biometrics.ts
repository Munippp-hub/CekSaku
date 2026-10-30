import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/** Biometrics are unavailable on web; settings and lock screens degrade gracefully. */
export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: true,
    });
    return result.success;
  } catch {
    return false;
  }
}
