import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { PinDots, PinPad } from '@/components/pin-pad';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { pinService } from '@/services/secure';
import { useApp } from '@/store/app-context';

type Phase = 'current' | 'new' | 'confirm';

export default function PinSettingsScreen() {
  const { settings, setPin, disablePin, notify } = useApp();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>(settings.pinEnabled ? 'current' : 'new');
  const [input, setInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [disableVisible, setDisableVisible] = useState(false);

  useEffect(() => {
    if (input.length !== 6) return;
    let cancelled = false;

    const advance = async () => {
      if (phase === 'current') {
        const valid = await pinService.verifyPin(input);
        if (cancelled) return;
        setInput('');
        if (!valid) {
          setError(t('pinWrong'));
          return;
        }
        setError(undefined);
        setPhase('new');
        return;
      }

      if (phase === 'new') {
        setNewPin(input);
        setInput('');
        setError(undefined);
        setPhase('confirm');
        return;
      }

      if (input !== newPin) {
        setInput('');
        setNewPin('');
        setError(t('pinMismatch'));
        setPhase('new');
        return;
      }

      await setPin(input);
      if (cancelled) return;
      notify(t('pinSaved'));
      if (router.canGoBack()) router.back();
      else router.replace('/settings');
    };

    advance();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const hint =
    phase === 'current'
      ? t('pinEnterCurrent')
      : phase === 'new'
        ? t('pinEnterNew')
        : t('pinConfirmNew');

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg },
      ]}>
      <PageHeader
        title={settings.pinEnabled ? t('pinChangeTitle') : t('pinSetupTitle')}
        showBack
        backHref="/settings"
      />

      <View style={styles.body}>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed-outline" size={22} color={Palette.primary} />
        </View>
        <AppText variant="heading" align="center">
          {hint}
        </AppText>
        <PinDots length={6} filled={input.length} />
        <AppText variant="small" color={Palette.warning} align="center" style={styles.error}>
          {error ?? ' '}
        </AppText>

        <PinPad
          onDigit={(digit) => {
            setError(undefined);
            setInput((current) => (current.length >= 6 ? current : current + digit));
          }}
          onDelete={() => setInput((current) => current.slice(0, -1))}
        />

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={17} color={Palette.primary} />
          <AppText variant="caption" color={Palette.textSecondary} style={styles.noteText}>
            {t('pinSecurityNote')}
          </AppText>
        </View>

        {settings.pinEnabled ? (
          <Pressable
            onPress={() => setDisableVisible(true)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.disable, pressed && styles.pressed]}>
            <AppText variant="button" color={Palette.warning}>
              {t('disablePin')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <ConfirmDialog
        visible={disableVisible}
        title={t('disablePinTitle')}
        message={t('disablePinBody')}
        confirmLabel={t('disablePin')}
        destructive
        onCancel={() => setDisableVisible(false)}
        onConfirm={async () => {
          setDisableVisible(false);
          await disablePin();
          notify(t('pinDisabled'));
          if (router.canGoBack()) router.back();
          else router.replace('/settings');
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
    gap: Spacing.lg,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  lockBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.card,
    backgroundColor: Palette.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    minHeight: 18,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Palette.lightBlue,
    borderRadius: Radius.input,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  noteText: {
    flex: 1,
  },
  disable: {
    paddingVertical: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
