import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useInsights } from '@/hooks/use-insights';
import { useI18n } from '@/hooks/use-i18n';
import { useApp } from '@/store/app-context';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showBell?: boolean;
  right?: React.ReactNode;
  backHref?: Href;
}

export function PageHeader({
  title,
  subtitle,
  showBack,
  showBell,
  right,
  backHref = '/home',
}: PageHeaderProps) {
  const { t } = useI18n();
  const { settings } = useApp();
  const { unread } = useInsights();
  const unreadCount = settings.aiInsightEnabled ? unread.length : 0;

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace(backHref);
          }}
          style={styles.backButton}
          hitSlop={6}>
          <Ionicons name="arrow-back" size={20} color={Palette.textPrimary} />
        </Pressable>
      ) : null}
      <View style={styles.texts}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" color={Palette.textSecondary}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {showBell ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('notificationsTitle')}
          onPress={() => router.push('/notifications')}
          style={styles.bell}
          hitSlop={6}>
          <Ionicons name="notifications-outline" size={21} color={Palette.primary} />
          {unreadCount > 0 ? <View style={styles.dot} /> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 44,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
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
