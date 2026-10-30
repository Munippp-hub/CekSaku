import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { BrandBackdrop } from '@/components/brand-backdrop';
import { Field } from '@/components/field';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, translate } from '@/i18n';
import { useApp } from '@/store/app-context';
import type { Currency, Locale } from '@/types/models';

type Step = 'splash' | 'welcome' | 'profile';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingScreen() {
  const { profile, completeOnboarding, login } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>('splash');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<Locale>('id');
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; privacy?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(language, key, vars);

  useEffect(() => {
    if (step !== 'splash') return;
    const timer = setTimeout(() => setStep('welcome'), 1800);
    return () => clearTimeout(timer);
  }, [step]);

  const handleStart = () => {
    if (profile) {
      login();
      return;
    }
    setStep('profile');
  };

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t('nameRequired');
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = t('emailInvalid');
    if (!privacy) nextErrors.privacy = t('privacyRequired');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    await completeOnboarding({
      name,
      email,
      avatarColor: Palette.primary,
      language,
      currency,
    });
    setSubmitting(false);
  };

  if (step === 'profile') {
    return (
      <View style={styles.profileRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.profileContent,
            { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.profileInner}>
            <Pressable
              onPress={() => setStep('welcome')}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel={t('back')}>
              <Ionicons name="arrow-back" size={20} color={Palette.textPrimary} />
            </Pressable>

            <View style={styles.profileHeading}>
              <AppText variant="title">{t('onboardingProfileTitle')}</AppText>
              <AppText variant="body" color={Palette.textSecondary}>
                {t('onboardingProfileSubtitle')}
              </AppText>
            </View>

            <Field
              label={t('nameLabel')}
              value={name}
              onChangeText={setName}
              placeholder={t('namePlaceholder')}
              autoCapitalize="words"
              error={errors.name}
              returnKeyType="next"
            />

            <Field
              label={`${t('emailLabel')} (${t('optional')})`}
              value={email}
              onChangeText={setEmail}
              placeholder={t('emailPlaceholder')}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />

            <View style={styles.choiceBlock}>
              <AppText variant="label" color={Palette.textSecondary}>
                {t('languageLabel')}
              </AppText>
              <View style={styles.chipRow}>
                {LANGUAGE_OPTIONS.map((option) => {
                  const focused = option.value === language;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setLanguage(option.value)}
                      style={[styles.choiceChip, focused && styles.choiceChipActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: focused }}>
                      <AppText
                        variant="label"
                        color={focused ? Palette.white : Palette.textSecondary}>
                        {option.code} · {translate(option.value, option.labelKey)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.choiceBlock}>
              <AppText variant="label" color={Palette.textSecondary}>
                {t('currencyLabel')}
              </AppText>
              <View style={styles.chipRow}>
                {CURRENCY_OPTIONS.map((option) => {
                  const focused = option.value === currency;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setCurrency(option.value)}
                      style={[styles.choiceChip, focused && styles.choiceChipActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: focused }}>
                      <AppText
                        variant="label"
                        color={focused ? Palette.white : Palette.textSecondary}>
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={() => {
                setPrivacy((value) => !value);
                setErrors((current) => ({ ...current, privacy: undefined }));
              }}
              style={styles.privacyRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: privacy }}>
              <View style={[styles.checkbox, privacy && styles.checkboxChecked]}>
                {privacy ? <Ionicons name="checkmark" size={15} color={Palette.white} /> : null}
              </View>
              <AppText variant="body" style={styles.privacyLabel}>
                {t('privacyAgreement')}
              </AppText>
            </Pressable>
            {errors.privacy ? (
              <AppText variant="small" color={Palette.warning}>
                {errors.privacy}
              </AppText>
            ) : null}

            <AppText variant="small" color={Palette.textSecondary}>
              {t('privacyNote')}
            </AppText>

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
              <AppText variant="button" color={Palette.white}>
                {t('createProfile')}
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <BrandBackdrop>
      <View
        style={[
          styles.brandScreen,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xxl,
            paddingHorizontal: Math.min(Spacing.xxl, width * 0.06),
          },
        ]}>
        <View style={styles.brandBlock}>
          <View style={styles.logoBox}>
            <Ionicons name="wallet-outline" size={34} color={Palette.white} />
          </View>
          <AppText style={styles.wordmark}>Montrack</AppText>
          <AppText style={styles.tagline}>{t('tagline')}</AppText>
        </View>

        <View style={styles.bottomArea}>
          {profile ? (
            <AppText variant="small" color="rgba(255,255,255,0.75)" align="center">
              {`${t('greeting')} ${profile.name}`}
            </AppText>
          ) : null}
          {step === 'welcome' ? (
            <Pressable
              onPress={handleStart}
              accessibilityRole="button"
              accessibilityLabel={profile ? t('continueToDashboard') : t('getStarted')}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
              <AppText variant="button" color={Palette.primary} style={styles.startLabel}>
                {profile ? t('continueToDashboard') : t('getStarted')}
              </AppText>
              <Ionicons name="arrow-forward" size={18} color={Palette.primary} />
            </Pressable>
          ) : (
            <View style={styles.startPlaceholder} />
          )}
        </View>
      </View>
    </BrandBackdrop>
  );
}

const styles = StyleSheet.create({
  brandScreen: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  wordmark: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: Palette.white,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '400',
  },
  bottomArea: {
    gap: Spacing.md,
  },
  startButton: {
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: Palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.floating,
  },
  startLabel: {
    fontSize: 15,
  },
  startPlaceholder: {
    height: 52,
  },
  profileRoot: {
    flex: 1,
    backgroundColor: Palette.page,
  },
  profileContent: {
    paddingHorizontal: Spacing.xl,
  },
  profileInner: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeading: {
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  choiceBlock: {
    gap: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  choiceChip: {
    height: 40,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    minHeight: 44,
    paddingTop: Spacing.sm,
  },
  privacyLabel: {
    flex: 1,
    textDecorationLine: 'underline',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Palette.navInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  createButton: {
    height: 50,
    borderRadius: Radius.pill,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
