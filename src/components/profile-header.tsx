import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useInsights } from '@/hooks/use-insights';
import { useI18n } from '@/hooks/use-i18n';
import { useApp } from '@/store/app-context';

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ProfileHeader() {
  const { profile, settings } = useApp();
  const { t } = useI18n();
  const { unread } = useInsights();
  const unreadCount = settings.aiInsightEnabled ? unread.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: profile?.avatarColor ?? Palette.primary }]}>
          <AppText variant="bodyStrong" color={Palette.white} style={styles.avatarText}>
            {initials(profile?.name ?? 'Montrack')}
          </AppText>
        </View>
        <View style={styles.texts}>
          <AppText variant="small" color={Palette.textSecondary}>
            {t('greeting')}
          </AppText>
          <AppText variant="heading" numberOfLines={1}>
            {profile?.name ?? t('appName')}
          </AppText>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('notificationsTitle')}
        onPress={() => router.push('/notifications')}
        style={styles.bell}
        hitSlop={6}>
        <Ionicons name="notifications-outline" size={21} color={Palette.primary} />
        {unreadCount > 0 ? <View style={styles.dot} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
  },
  texts: {
    flex: 1,
    gap: 1,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Palette.warning,
    borderWidth: 1,
    borderColor: Palette.surface,
  },
});
