import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { TabScreen } from '@/components/tab-screen';
import { SettingsRow, SettingsSection } from '@/components/settings-row';
import { Toggle } from '@/components/toggle';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { currencySymbol } from '@/lib/format';
import { initials } from '@/components/profile-header';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/services/biometrics';
import { useApp } from '@/store/app-context';

export default function SettingsScreen() {
  const { profile, settings, updateSettings, logout, notify } = useApp();
  const { t } = useI18n();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const handleBiometricToggle = async (next: boolean) => {
    if (next) {
      if (!settings.pinEnabled) {
        notify(t('biometricNeedsPin'));
        return;
      }
      if (!biometricAvailable) {
        notify(t('biometricUnsupported'));
        return;
      }
      const success = await authenticateWithBiometrics(t('biometricPrompt'));
      if (!success) {
        notify(t('biometricFailed'));
        return;
      }
      updateSettings({ biometricEnabled: true });
      notify(t('biometricEnabledToast'));
    } else {
      updateSettings({ biometricEnabled: false });
      notify(t('biometricDisabledToast'));
    }
  };

  return (
    <TabScreen active="settings">
      <PageHeader title={t('settingsTitle')} showBell />

      <LinearGradient
        colors={[Palette.primary, Palette.deep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}>
        <View style={styles.profileLeft}>
          <View style={[styles.avatar, { backgroundColor: profile?.avatarColor ?? Palette.primary }]}>
            <AppText variant="heading" color={Palette.white}>
              {initials(profile?.name ?? 'Montrack')}
            </AppText>
          </View>
          <View style={styles.profileTexts}>
            <AppText variant="heading" color={Palette.white} numberOfLines={1}>
              {profile?.name ?? t('appName')}
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.8)" numberOfLines={1}>
              {profile?.email || t('settingsProfileHint')}
            </AppText>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/settings/personal')}
          accessibilityRole="button"
          accessibilityLabel={t('editProfile')}
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          hitSlop={6}>
          <Ionicons name="create-outline" size={18} color={Palette.white} />
        </Pressable>
      </LinearGradient>

      <SettingsSection title={t('accountSection')}>
        <SettingsRow
          icon="person-outline"
          label={t('personalInformation')}
          showChevron
          onPress={() => router.push('/settings/personal')}
        />
        <SettingsRow
          icon="link-outline"
          label={t('linkedAccounts')}
          showChevron
          onPress={() => router.push('/settings/linked-accounts')}
        />
        <SettingsRow
          icon="globe-outline"
          label={t('languageCurrency')}
          value={`${settings.currency} · ${currencySymbol(settings.currency)}`}
          showChevron
          onPress={() => router.push('/settings/language')}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('preferencesSection')}>
        <SettingsRow
          icon="notifications-outline"
          label={t('spendingAlerts')}
          description={t('spendingAlertsDesc')}
          right={
            <Toggle
              value={settings.spendingAlertEnabled}
              onChange={(value) => updateSettings({ spendingAlertEnabled: value })}
              accessibilityLabel={t('spendingAlerts')}
            />
          }
        />
        <SettingsRow
          icon="sparkles-outline"
          label={t('aiInsightSetting')}
          description={t('aiInsightDesc')}
          right={
            <Toggle
              value={settings.aiInsightEnabled}
              onChange={(value) => updateSettings({ aiInsightEnabled: value })}
              accessibilityLabel={t('aiInsightSetting')}
            />
          }
          last
        />
      </SettingsSection>

      <SettingsSection title={t('securitySection')}>
        <SettingsRow
          icon="keypad-outline"
          label={t('changePin')}
          value={settings.pinEnabled ? t('changePinActive') : t('changePinInactive')}
          showChevron
          onPress={() => router.push('/settings/pin')}
        />
        <SettingsRow
          icon="finger-print-outline"
          label={t('biometricLogin')}
          description={
            biometricAvailable ? t('biometricAvailable') : t('biometricUnsupported')
          }
          right={
            <Toggle
              value={settings.biometricEnabled}
              onChange={handleBiometricToggle}
              disabled={!biometricAvailable || !settings.pinEnabled}
              accessibilityLabel={t('biometricLogin')}
            />
          }
          last
        />
      </SettingsSection>

      <Pressable
        onPress={() => setLogoutVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('logout')}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <Ionicons name="log-out-outline" size={18} color={Palette.warning} />
        <AppText variant="button" color={Palette.warning}>
          {t('logout')}
        </AppText>
      </Pressable>

      <ConfirmDialog
        visible={logoutVisible}
        title={t('logoutTitle')}
        message={t('logoutBody')}
        confirmLabel={t('logoutConfirm')}
        destructive
        onCancel={() => setLogoutVisible(false)}
        onConfirm={() => {
          setLogoutVisible(false);
          logout();
        }}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: Radius.large,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.floating,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileTexts: {
    flex: 1,
    gap: 2,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 50,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: '#F7D5CC',
    marginTop: Spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
});
