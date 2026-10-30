import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { InsightCard } from '@/components/insight-card';
import { ProfileHeader } from '@/components/profile-header';
import { SummaryCard } from '@/components/summary-card';
import { TabScreen } from '@/components/tab-screen';
import { TypeOfUseCard } from '@/components/type-of-use-card';
import { WeeklyChart } from '@/components/weekly-chart';
import { Palette, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { useInsights } from '@/hooks/use-insights';
import {
  categoryTotals,
  percentChange,
  totalsForPeriod,
  weeklyExpenseBuckets,
} from '@/lib/finance';
import { addDays, endOfWeek, startOfWeek } from '@/lib/format';
import { useApp } from '@/store/app-context';

export default function HomeScreen() {
  const { transactions, categories, settings } = useApp();
  const { t } = useI18n();
  const { insights } = useInsights();

  const now = new Date();

  const data = useMemo(() => {
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const previousStart = addDays(weekStart, -7);
    const previousEnd = addDays(weekEnd, -7);
    return {
      current: totalsForPeriod(transactions, weekStart, weekEnd),
      previous: totalsForPeriod(transactions, previousStart, previousEnd),
      buckets: weeklyExpenseBuckets(transactions, weekStart),
      breakdown: categoryTotals(transactions, categories, weekStart, weekEnd),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, categories]);

  const incomeChange = percentChange(data.current.income, data.previous.income);
  const hasTransactions = transactions.length > 0;
  const previewInsights = insights.slice(0, 2);

  const openNew = (type: 'income' | 'expense') =>
    router.push({ pathname: '/transaction/new', params: { type } });

  return (
    <TabScreen active="home">
      <ProfileHeader />

      <SummaryCard
        income={data.current.income}
        expense={data.current.expense}
        net={data.current.net}
        change={incomeChange}
        onAddIncome={() => openNew('income')}
        onAddExpense={() => openNew('expense')}
      />

      {!hasTransactions ? (
        <Card>
          <EmptyState
            icon="wallet-outline"
            title={t('emptyDashboardTitle')}
            message={t('emptyDashboardBody')}>
            <AppButton
              label={t('emptyIncomeCta')}
              icon="add"
              variant="secondary"
              onPress={() => openNew('income')}
            />
            <AppButton
              label={t('emptyExpenseCta')}
              icon="remove"
              variant="outline"
              onPress={() => openNew('expense')}
            />
          </EmptyState>
        </Card>
      ) : null}

      <Card style={styles.insightCard}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">{t('aiInsight')}</AppText>
          <Pressable
            onPress={() => router.push('/insights')}
            accessibilityRole="button"
            accessibilityLabel={t('viewAll')}
            hitSlop={8}>
            <AppText variant="label" color={Palette.primary}>
              {t('viewAll')}
            </AppText>
          </Pressable>
        </View>

        {!settings.aiInsightEnabled ? (
          <AppText variant="small" color={Palette.textSecondary}>
            {t('insightDisabledHome')}
          </AppText>
        ) : previewInsights.length === 0 ? (
          <AppText variant="small" color={Palette.textSecondary}>
            {t('noInsightYet')}
          </AppText>
        ) : (
          <View style={styles.insightList}>
            {previewInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() =>
                  router.push({ pathname: '/insight/[id]', params: { id: insight.id } })
                }
              />
            ))}
          </View>
        )}
      </Card>

      <WeeklyChart buckets={data.buckets} total={data.current.expense} />

      <TypeOfUseCard items={data.breakdown} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  insightCard: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightList: {
    gap: Spacing.md,
  },
});
