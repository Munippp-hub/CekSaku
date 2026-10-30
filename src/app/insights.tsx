import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { InsightCard } from '@/components/insight-card';
import { PageHeader } from '@/components/page-header';
import { TabScreen } from '@/components/tab-screen';
import { Palette, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { useInsights } from '@/hooks/use-insights';
import { useApp } from '@/store/app-context';

export default function InsightsScreen() {
  const { settings, markInsightsRead, notify } = useApp();
  const { insights, unread } = useInsights();
  const { t } = useI18n();

  return (
    <TabScreen active="insights">
      <PageHeader title={t('insightScreenTitle')} showBell />

      {!settings.aiInsightEnabled ? (
        <Card>
          <EmptyState
            icon="sparkles-outline"
            title={t('insightDisabledTitle')}
            message={t('insightDisabledBody')}>
            <AppButton
              label={t('openSettings')}
              variant="secondary"
              onPress={() => router.push('/settings')}
            />
          </EmptyState>
        </Card>
      ) : insights.length === 0 ? (
        <Card>
          <EmptyState
            icon="sparkles-outline"
            title={t('emptyInsightTitle')}
            message={t('emptyInsightBody')}
          />
        </Card>
      ) : (
        <>
          <View style={styles.toolbar}>
            <AppText variant="small" color={Palette.textSecondary}>
              {`${insights.length} insight · ${unread.length} ${t('unread').toLowerCase()}`}
            </AppText>
            {unread.length > 0 ? (
              <Pressable
                onPress={() => {
                  markInsightsRead(insights.map((insight) => insight.id));
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
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() =>
                  router.push({ pathname: '/insight/[id]', params: { id: insight.id } })
                }
              />
            ))}
          </View>
        </>
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
});
