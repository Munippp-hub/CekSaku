import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { DAY_SHORT } from '@/lib/format';
import type { WeeklyBucket } from '@/lib/finance';

interface WeeklyChartProps {
  buckets: WeeklyBucket[];
  total: number;
}

const CHART_HEIGHT = 112;

export function WeeklyChart({ buckets, total }: WeeklyChartProps) {
  const { t, money, locale } = useI18n();
  const max = Math.max(...buckets.map((bucket) => bucket.total), 0);
  const highest = buckets.reduce<WeeklyBucket | null>(
    (best, bucket) => (bucket.total > (best?.total ?? 0) ? bucket : best),
    null
  );

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <AppText variant="heading">{t('weeklySpending')}</AppText>
          <AppText variant="small" color={Palette.textSecondary}>
            {t('thisWeekTotal')}
          </AppText>
        </View>
        <AppText variant="subheading" numberOfLines={1}>
          {money(total)}
        </AppText>
      </View>

      {max === 0 ? (
        <AppText variant="small" color={Palette.textSecondary} style={styles.empty}>
          {t('emptyChart')}
        </AppText>
      ) : (
        <View style={styles.chart}>
          {buckets.map((bucket, index) => {
            const ratio = max === 0 ? 0 : bucket.total / max;
            const height = Math.max(bucket.total > 0 ? 8 : 3, ratio * CHART_HEIGHT);
            const isHighest = bucket.total > 0 && bucket.total === max;
            return (
              <View key={index} style={styles.column}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: isHighest ? Palette.primary : Palette.primary,
                        opacity: isHighest ? 1 : bucket.total > 0 ? 0.42 : 0.16,
                      },
                    ]}
                  />
                </View>
                <AppText
                  variant="caption"
                  color={isHighest ? Palette.primary : Palette.textSecondary}
                  style={styles.dayLabel}>
                  {DAY_SHORT[locale][index]}
                </AppText>
              </View>
            );
          })}
        </View>
      )}

      {highest && highest.total > 0 ? (
        <View style={styles.footer}>
          <View style={styles.footerDot} />
          <AppText variant="caption" color={Palette.textSecondary}>
            {`${t('highestDay')}: ${DAY_SHORT[locale][buckets.indexOf(highest)]} · ${money(
              highest.total
            )}`}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerTexts: {
    gap: 2,
    flex: 1,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barTrack: {
    height: CHART_HEIGHT,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '62%',
    maxWidth: 26,
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    borderBottomLeftRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
  },
  dayLabel: {
    fontSize: 10.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.page,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Palette.primary,
  },
  empty: {
    paddingVertical: Spacing.xl,
  },
});
