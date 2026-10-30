import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { PageHeader } from '@/components/page-header';
import { SubScreen } from '@/components/sub-screen';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS } from '@/i18n';
import { useApp } from '@/store/app-context';
import type { Currency, Locale } from '@/types/models';

export default function LanguageCurrencyScreen() {
  const { settings, updateSettings, notify } = useApp();
  const { t } = useI18n();

  const handleLanguage = (language: Locale) => {
    if (language === settings.language) return;
    updateSettings({ language });
    notify(t('saved'));
  };

  const handleCurrency = (currency: Currency) => {
    if (currency === settings.currency) return;
    updateSettings({ currency });
    notify(t('saved'));
  };

  return (
    <SubScreen>
      <PageHeader title={t('languageSettingTitle')} showBack backHref="/settings" />

      <View style={styles.section}>
        <AppText variant="label" color={Palette.textSecondary}>
          {t('languageLabel')}
        </AppText>
        <Card style={styles.card}>
          {LANGUAGE_OPTIONS.map((option, index) => {
            const active = settings.language === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleLanguage(option.value as Locale)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.row,
                  index < LANGUAGE_OPTIONS.length - 1 && styles.rowBorder,
                ]}>
                <View style={styles.rowTexts}>
                  <AppText variant="subheading">{option.code}</AppText>
                  <AppText variant="caption" color={Palette.textSecondary}>
                    {t(option.labelKey)}
                  </AppText>
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={22} color={Palette.primary} />
                ) : (
                  <View style={styles.radio} />
                )}
              </Pressable>
            );
          })}
        </Card>
        <AppText variant="caption" color={Palette.textSecondary}>
          {t('languageDesc')}
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color={Palette.textSecondary}>
          {t('currencyLabel')}
        </AppText>
        <Card style={styles.card}>
          {CURRENCY_OPTIONS.map((option, index) => {
            const active = settings.currency === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleCurrency(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.row, index < CURRENCY_OPTIONS.length - 1 && styles.rowBorder]}>
                <View style={styles.rowTexts}>
                  <AppText variant="subheading">{option.code}</AppText>
                  <AppText variant="caption" color={Palette.textSecondary}>
                    {option.label}
                  </AppText>
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={22} color={Palette.primary} />
                ) : (
                  <View style={styles.radio} />
                )}
              </Pressable>
            );
          })}
        </Card>
        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={17} color={Palette.primary} />
          <AppText variant="small" color={Palette.textSecondary} style={styles.noteText}>
            {t('currencyNote')}
          </AppText>
        </View>
      </View>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Palette.border,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Palette.lightBlue,
    borderRadius: Radius.input,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
  },
});
