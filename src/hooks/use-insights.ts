import { useMemo } from 'react';

import { useI18n } from '@/hooks/use-i18n';
import { buildInsights } from '@/lib/insights';
import { useApp } from '@/store/app-context';
import type { Insight } from '@/types/models';

export function useInsights() {
  const { transactions, categories, settings, readInsightIds, dismissedInsightIds } = useApp();
  const { locale, currency } = useI18n();

  const all = useMemo<Insight[]>(() => {
    if (!settings.aiInsightEnabled) return [];
    return buildInsights({ transactions, categories, locale, currency });
  }, [transactions, categories, settings.aiInsightEnabled, locale, currency]);

  const insights = useMemo(
    () => all.filter((insight) => !dismissedInsightIds.includes(insight.id)),
    [all, dismissedInsightIds]
  );

  const unread = useMemo(
    () => insights.filter((insight) => !readInsightIds.includes(insight.id)),
    [insights, readInsightIds]
  );

  /** Informational insights stay on the insight tab and do not notify. */
  const notifications = useMemo(
    () =>
      insights.filter((insight) => {
        if (insight.severity === 'info') return false;
        if (!settings.spendingAlertEnabled) return insight.severity === 'positive';
        return true;
      }),
    [insights, settings.spendingAlertEnabled]
  );

  const isRead = (id: string) => readInsightIds.includes(id);

  return { insights, unread, notifications, isRead, allInsightsCount: all.length };
}
