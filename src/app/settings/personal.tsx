import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { initials } from '@/components/profile-header';
import { SubScreen } from '@/components/sub-screen';
import { AvatarColors, Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { formatDateLong } from '@/lib/format';
import { useApp } from '@/store/app-context';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PersonalInformationScreen() {
  const { profile, updateProfile, notify } = useApp();
  const { t, locale } = useI18n();

  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor ?? Palette.primary);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSave = () => {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t('nameRequired');
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = t('emailInvalid');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    updateProfile({ name, email, avatarColor });
    notify(t('profileSaved'));
  };

  return (
    <SubScreen>
      <PageHeader title={t('personalInfoTitle')} showBack backHref="/settings" />

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <AppText variant="title" color={Palette.white}>
            {initials(name || profile?.name || 'Montrack')}
          </AppText>
        </View>
        <AppText variant="caption" color={Palette.textSecondary} align="center">
          {t('avatarNote')}
        </AppText>
        <View style={styles.swatches}>
          {AvatarColors.map((color) => {
            const active = color === avatarColor;
            return (
              <Pressable
                key={color}
                onPress={() => setAvatarColor(color)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  active && styles.swatchActive,
                ]}>
                {active ? <Ionicons name="checkmark" size={16} color={Palette.white} /> : null}
              </Pressable>
            );
          })}
        </View>
        {profile ? (
          <AppText variant="small" color={Palette.textSecondary}>
            {t('memberSince', { date: formatDateLong(profile.createdAt, locale) })}
          </AppText>
        ) : null}
      </Card>

      <Field
        label={t('nameLabel')}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrors((current) => ({ ...current, name: undefined }));
        }}
        placeholder={t('namePlaceholder')}
        autoCapitalize="words"
        error={errors.name}
      />

      <Field
        label={`${t('emailLabel')} (${t('optional')})`}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((current) => ({ ...current, email: undefined }));
        }}
        placeholder={t('emailPlaceholder')}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />

      <Pressable
        onPress={handleSave}
        accessibilityRole="button"
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
        <AppText variant="button" color={Palette.white}>
          {t('saveProfile')}
        </AppText>
      </Pressable>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatches: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: Palette.textPrimary,
  },
  saveButton: {
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
