import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PinDots, PinPad } from '@/components/pin-pad';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/services/biometrics';
import { pinService } from '@/services/secure';
import { useApp } from '@/store/app-context';

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export default function LockScreen() {
  const { settings, profile, unlock, resetApp, notify } = useApp();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const promptedRef = useRef(false);

  useEffect(() => {
    let active = true;
    isBiometricAvailable().then((available) => {
      if (active) setBiometricAvailable(available);
    });
    return () => {
      active = false;
    };
  }, []);

  const tryBiometric = async () => {
    const success = await authenticateWithBiometrics(t('biometricPrompt'));
    if (success) {
      unlock();
    } else {
      setError(t('biometricFailed'));
    }
  };

  useEffect(() => {
    if (!settings.biometricEnabled || !biometricAvailable || promptedRef.current) return;
    promptedRef.current = true;
    tryBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.biometricEnabled, biometricAvailable]);

  useEffect(() => {
    if (pin.length !== 6) return;
    let cancelled = false;

    const verify = async () => {
      if (blocked) return;
      const valid = await pinService.verifyPin(pin);
      if (cancelled) return;
      if (valid) {
        setError(null);
        unlock();
        return;
      }
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPin('');
      if (nextAttempts >= MAX_ATTEMPTS) {
        setBlocked(true);
        setAttempts(0);
        setError(t('pinLocked'));
        setTimeout(() => setBlocked(false), LOCK_SECONDS * 1000);
      } else {
        setError(t('pinWrong'));
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleDigit = (digit: string) => {
    if (blocked) return;
    setError(null);
    setPin((current) => (current.length >= 6 ? current : current + digit));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.top}>
        <View style={[styles.avatar, { backgroundColor: profile?.avatarColor ?? Palette.primary }]}>
          <Ionicons name="lock-closed" size={20} color={Palette.white} />
        </View>
        <AppText variant="heading">{profile?.name ?? t('appName')}</AppText>
        <AppText variant="title" style={styles.title}>
          {t('lockTitle')}
        </AppText>
        <AppText variant="small" color={Palette.textSecondary}>
          {t('lockSubtitle')}
        </AppText>
      </View>

      <View style={styles.dots}>
        <PinDots length={6} filled={pin.length} />
        {error ? (
          <AppText variant="small" color={Palette.warning} align="center">
            {error}
          </AppText>
        ) : (
          <AppText variant="small" color={Palette.textSecondary}>
            {attempts > 0 ? t('pinAttemptsLeft', { count: MAX_ATTEMPTS - attempts }) : ' '}
          </AppText>
        )}
      </View>

      <PinPad
        onDigit={handleDigit}
        onDelete={() => setPin((current) => current.slice(0, -1))}
        onBiometric={settings.biometricEnabled && biometricAvailable ? tryBiometric : undefined}
        disabled={blocked}
      />

      <View style={styles.footer}>
        <Pressable
          onPress={() => setForgotVisible(true)}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.forgot}>
          <AppText variant="label" color={Palette.textSecondary}>
            {t('forgotPin')}
          </AppText>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={forgotVisible}
        title={t('forgotPin')}
        message={t('forgotPinBody')}
        confirmLabel={t('resetApp')}
        destructive
        onCancel={() => setForgotVisible(false)}
        onConfirm={async () => {
          setForgotVisible(false);
          await resetApp();
          notify(t('resetDone'));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.page,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xxl,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    marginTop: Spacing.md,
  },
  dots: {
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 70,
  },
  footer: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  forgot: {
    paddingVertical: Spacing.sm,
  },
});
