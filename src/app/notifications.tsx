import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { IconBox } from '@/components/icon-box';
import { PageHeader } from '@/components/page-header';
import { insightTheme } from '@/components/insight-card';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { useInsights } from '@/hooks/use-insights';
import { formatDate, formatTime } from '@/lib/format';
import { useApp } from '@/store/app-context';

export default function NotificationsScreen() {
  const { settings, markInsightsRead, notify } = useApp();
  const { notifications, isRead } = useInsights();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const unreadNotifications = notifications.filter((item) => !isRead(item.id));

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}>
        <View style={styles.inner}>
          <PageHeader title={t('notificationsTitle')} showBack backHref="/home" />

          {!settings.aiInsightEnabled ? (
            <Card>
              <EmptyState
                icon="notifications-off-outline"
                title={t('insightDisabledTitle')}
                message={t('notificationsDisabled')}>
                <AppButton
                  label={t('openSettings')}
                  variant="secondary"
                  onPress={() => router.push('/settings')}
                />
              </EmptyState>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <EmptyState
                icon="notifications-outline"
                title={t('emptyNotificationsTitle')}
                message={t('emptyNotificationsBody')}
              />
            </Card>
          ) : (
            <>
              <View style={styles.toolbar}>
                <AppText variant="small" color={Palette.textSecondary}>
                  {`${notifications.length} · ${unreadNotifications.length} ${t('unread').toLowerCase()}`}
                </AppText>
                {unreadNotifications.length > 0 ? (
                  <Pressable
                    onPress={() => {
                      markInsightsRead(notifications.map((item) => item.id));
                      notify(t('readAllDone'));
                    }}
                    accessibilityRole="button"
                    hitSlop={6}>
                    <AppText variant="label" color={Palette.primary}>
                      {t('markAllRead')}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.list}>
                {notifications.map((insight) => {
                  const theme = insightTheme(insight.severity);
                  const unreadItem = !isRead(insight.id);
                  return (
                    <Pressable
                      key={insight.id}
                      onPress={() => {
                        markInsightsRead([insight.id]);
                        router.push({ pathname: '/insight/[id]', params: { id: insight.id } });
                      }}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                      <IconBox
                        name={theme.icon}
                        color={theme.iconColor}
                        backgroundColor={theme.background}
                        boxSize={40}
                        size={18}
                      />
                      <View style={styles.rowTexts}>
                        <View style={styles.rowTitleLine}>
                          <AppText variant="subheading" numberOfLines={1} style={styles.rowTitle}>
                            {insight.title}
                          </AppText>
                          {unreadItem ? (
                            <View style={styles.unreadPill}>
                              <AppText variant="caption" color={Palette.primary}>
                                {t('unread')}
                              </AppText>
                            </View>
                          ) : null}
                        </View>
                        <AppText variant="small" color={Palette.textSecondary} numberOfLines={2}>
                          {insight.body}
                        </AppText>
                        <AppText variant="caption" color={Palette.navInactive}>
                          {`${formatDate(insight.createdAt, locale)} · ${formatTime(insight.createdAt)}`}
                        </AppText>
                      </View>
                      <Ionicons name="chevron-forward" size={17} color={Palette.navInactive} />
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.page,
    paddingHorizontal: Spacing.xl,
  },
  scroll: {
    paddingTop: Spacing.sm,
  },
  inner: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowTitle: {
    flexShrink: 1,
  },
  unreadPill: {
    backgroundColor: Palette.lightBlue,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
