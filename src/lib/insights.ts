import { formatDate, formatMoney, startOfWeek } from '@/lib/format';
import {
  activeDays,
  categoryName,
  categoryTotals,
  filterTransactions,
  percentChange,
  sumTotals,
} from '@/lib/finance';
import { translate } from '@/i18n';
import type { Category, Currency, Insight, Locale, Transaction } from '@/types/models';

interface BuildInsightInput {
  transactions: Transaction[];
  categories: Category[];
  locale: Locale;
  currency: Currency;
  now?: Date;
}

const MIN_WEEKLY_TRANSACTIONS = 3;
const MIN_CATEGORY_TRANSACTIONS = 2;
const CHANGE_THRESHOLD = 5;
const UP_THRESHOLD = 15;
const TOP_CATEGORY_SHARE = 30;
const ANOMALY_RATIO = 1.5;

function weekKey(date: Date) {
  const start = startOfWeek(date);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
    start.getDate()
  ).padStart(2, '0')}`;
}

function shiftWeeks(date: Date, weeks: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

function startOfWeekFrom(date: Date, weeks: number) {
  const start = startOfWeek(shiftWeeks(date, weeks));
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfWeekFrom(date: Date, weeks: number) {
  const start = startOfWeekFrom(date, weeks);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return end;
}

function percentLabel(value: number) {
  return Math.abs(Math.round(value));
}

/**
 * Rule-based insight engine (PRD section 11.7). It produces deterministic,
 * explainable insights and refuses to invent conclusions when data is thin.
 */
export function buildInsights({
  transactions,
  categories,
  locale,
  currency,
  now = new Date(),
}: BuildInsightInput): Insight[] {
  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
  const money = (value: number) => formatMoney(value, currency, locale);
  const createdAt = now.toISOString();
  const currentStart = startOfWeekFrom(now, 0);
  const currentEnd = endOfWeekFrom(now, 0);
  const previousStart = startOfWeekFrom(now, -1);
  const previousEnd = endOfWeekFrom(now, -1);
  const key = weekKey(now);
  const insights: Insight[] = [];

  const currentWeekExpenses = filterTransactions(transactions, currentStart, currentEnd, 'expense');
  const previousWeekExpenses = filterTransactions(transactions, previousStart, previousEnd, 'expense');
  const currentTotals = sumTotals(currentWeekExpenses);
  const previousTotals = sumTotals(previousWeekExpenses);

  const recentTransactions = filterTransactions(
    transactions,
    startOfWeekFrom(now, -1),
    currentEnd
  );

  if (recentTransactions.length < MIN_WEEKLY_TRANSACTIONS) {
    return [
      {
        id: `insufficient_data:${key}`,
        type: 'insufficient_data',
        severity: 'info',
        title: t('insNotEnoughTitle'),
        body: t('insNotEnoughBody', { count: recentTransactions.length }),
        suggestion: t('insNotEnoughSuggestion'),
        periodStart: previousStart.toISOString(),
        periodEnd: currentEnd.toISOString(),
        metrics: [
          { label: t('metricTransactions'), value: String(recentTransactions.length) },
        ],
        createdAt,
      },
    ];
  }

  const change = percentChange(currentTotals.expense, previousTotals.expense);
  if (
    change !== null &&
    currentWeekExpenses.length >= MIN_WEEKLY_TRANSACTIONS &&
    previousWeekExpenses.length >= MIN_WEEKLY_TRANSACTIONS
  ) {
    const breakdown = categoryTotals(transactions, categories, currentStart, currentEnd);
    const topCategory = breakdown[0];

    if (change <= -CHANGE_THRESHOLD) {
      insights.push({
        id: `spending_change_down:${key}`,
        type: 'spending_change_down',
        severity: 'positive',
        title: t('insDownTitle'),
        body: t('insDownBody', { percent: percentLabel(change) }),
        suggestion: t('insDownSuggestion'),
        periodStart: currentStart.toISOString(),
        periodEnd: currentEnd.toISOString(),
        comparisonStart: previousStart.toISOString(),
        comparisonEnd: previousEnd.toISOString(),
        metrics: [
          { label: t('metricExpenseThisWeek'), value: money(currentTotals.expense) },
          { label: t('metricExpenseLastWeek'), value: money(previousTotals.expense) },
          { label: t('metricChange'), value: `-${percentLabel(change)}%` },
        ],
        createdAt,
      });
    } else if (change >= UP_THRESHOLD) {
      insights.push({
        id: `spending_change_up:${key}`,
        type: 'spending_change_up',
        severity: 'warning',
        title: t('insUpTitle'),
        body: t('insUpBody', { percent: percentLabel(change) }),
        suggestion: t('insUpSuggestion', {
          category: categoryName(topCategory?.category, locale, t('typeOfUse')),
        }),
        periodStart: currentStart.toISOString(),
        periodEnd: currentEnd.toISOString(),
        comparisonStart: previousStart.toISOString(),
        comparisonEnd: previousEnd.toISOString(),
        metrics: [
          { label: t('metricExpenseThisWeek'), value: money(currentTotals.expense) },
          { label: t('metricExpenseLastWeek'), value: money(previousTotals.expense) },
          { label: t('metricChange'), value: `+${percentLabel(change)}%` },
        ],
        createdAt,
      });
    }
  }

  const breakdown = categoryTotals(transactions, categories, currentStart, currentEnd);
  const top = breakdown[0];
  if (top && top.count >= MIN_CATEGORY_TRANSACTIONS && top.percent >= TOP_CATEGORY_SHARE) {
    const label = categoryName(top.category, locale);
    insights.push({
      id: `top_category:${key}:${top.category.id}`,
      type: 'top_category',
      severity: 'info',
      title: t('insTopTitle', { category: label }),
      body: t('insTopBody', {
        category: label,
        percent: Math.round(top.percent),
        amount: money(top.total),
      }),
      suggestion: t('insTopSuggestion', { category: label }),
      periodStart: currentStart.toISOString(),
      periodEnd: currentEnd.toISOString(),
      metrics: [
        { label: t('metricCategoryTotal'), value: money(top.total) },
        { label: t('metricTotalExpense'), value: money(currentTotals.expense) },
        { label: t('metricTransactions'), value: String(top.count) },
      ],
      createdAt,
    });
  }

  let anomalyCandidate: { label: string; total: number; ratio: number; id: string } | null = null;
  breakdown.forEach((item) => {
    if (item.count < MIN_CATEGORY_TRANSACTIONS) return;
    let previousSum = 0;
    for (let week = 1; week <= 3; week += 1) {
      const start = startOfWeekFrom(now, -week);
      const end = endOfWeekFrom(now, -week);
      previousSum += filterTransactions(transactions, start, end, 'expense')
        .filter((transaction) => transaction.categoryId === item.category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    }
    const average = previousSum / 3;
    if (average <= 0) return;
    const ratio = item.total / average;
    if (ratio >= ANOMALY_RATIO && (!anomalyCandidate || ratio > anomalyCandidate.ratio)) {
      anomalyCandidate = {
        label: categoryName(item.category, locale),
        total: item.total,
        ratio,
        id: item.category.id,
      };
    }
  });

  if (anomalyCandidate) {
    const anomaly = anomalyCandidate as {
      label: string;
      total: number;
      ratio: number;
      id: string;
    };
    insights.push({
      id: `category_anomaly:${key}:${anomaly.id}`,
      type: 'category_anomaly',
      severity: 'warning',
      title: t('insAnomalyTitle', { category: anomaly.label }),
      body: t('insAnomalyBody', {
        category: anomaly.label,
        amount: money(anomaly.total),
        ratio: anomaly.ratio.toFixed(1).replace('.', locale === 'id' ? ',' : '.'),
      }),
      suggestion: t('insAnomalySuggestion', { category: anomaly.label }),
      periodStart: currentStart.toISOString(),
      periodEnd: currentEnd.toISOString(),
      comparisonStart: startOfWeekFrom(now, -3).toISOString(),
      comparisonEnd: previousEnd.toISOString(),
      metrics: [
        { label: t('metricCategoryTotal'), value: money(anomaly.total) },
        { label: t('metricPrevAvg'), value: money(anomaly.total / anomaly.ratio) },
      ],
      createdAt,
    });
  }

  const recordingWindowStart = new Date(now);
  recordingWindowStart.setDate(recordingWindowStart.getDate() - 6);
  recordingWindowStart.setHours(0, 0, 0, 0);
  const days = activeDays(transactions, recordingWindowStart, now);
  if (days.length >= 3) {
    insights.push({
      id: `recording_streak:${key}`,
      type: 'recording_streak',
      severity: 'positive',
      title: t('insStreakTitle'),
      body: t('insStreakBody', { days: days.length }),
      suggestion: t('insStreakSuggestion'),
      periodStart: recordingWindowStart.toISOString(),
      periodEnd: now.toISOString(),
      metrics: [{ label: t('metricActiveDays'), value: String(days.length) }],
      createdAt,
    });
  }

  const severityOrder: Record<Insight['severity'], number> = { warning: 0, positive: 1, info: 2 };
  return insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function describePeriod(startIso: string, endIso: string, locale: Locale) {
  return `${formatDate(startIso, locale)} – ${formatDate(endIso, locale)}`;
}
