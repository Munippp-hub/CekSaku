import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { IconBox } from '@/components/icon-box';
import { PageHeader } from '@/components/page-header';
import { insightTheme } from '@/components/insight-card';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { useInsights } from '@/hooks/use-insights';
import { describePeriod } from '@/lib/insights';
import { formatDateLong } from '@/lib/format';
import { useApp } from '@/store/app-context';

export default function InsightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { insights, isRead } = useInsights();
  const { markInsightsRead, dismissInsight, notify } = useApp();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();

  const insight = insights.find((item) => item.id === id);

  if (!insight) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
        <PageHeader title={t('insightDetailTitle')} showBack backHref="/insights" />
        <EmptyState
          icon="sparkles-outline"
          title={t('emptyInsightTitle')}
          message={t('emptyInsightBody')}
        />
      </View>
    );
  }

  const theme = insightTheme(insight.severity);

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}>
        <View style={styles.inner}>
          <PageHeader title={t('insightDetailTitle')} showBack backHref="/insights" />

          <View style={styles.heroCard}>
            <IconBox
              name={theme.icon}
              color={theme.iconColor}
              backgroundColor={theme.background}
              boxSize={46}
              size={20}
            />
            <AppText variant="title" style={styles.heroTitle}>
              {insight.title}
            </AppText>
            <AppText variant="body" color={Palette.textSecondary}>
              {insight.body}
            </AppText>
          </View>

          <View style={styles.card}>
            <AppText variant="heading">{t('supportingData')}</AppText>
            <View style={styles.metrics}>
              {insight.metrics.map((metric) => (
                <View key={metric.label} style={styles.metric}>
                  <AppText variant="caption" color={Palette.textSecondary}>
                    {metric.label}
                  </AppText>
                  <AppText variant="subheading" numberOfLines={1} adjustsFontSizeToFit>
                    {metric.value}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.metaBlock}>
              <MetaRow
                label={t('period')}
                value={describePeriod(insight.periodStart, insight.periodEnd, locale)}
              />
              {insight.comparisonStart && insight.comparisonEnd ? (
                <MetaRow
                  label={t('comparison')}
                  value={describePeriod(insight.comparisonStart, insight.comparisonEnd, locale)}
                />
              ) : null}
              <MetaRow
                label={t('created')}
                value={formatDateLong(insight.createdAt, locale)}
              />
            </View>
          </View>

          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="bulb-outline" size={18} color={Palette.primary} />
              <AppText variant="subheading" color={Palette.primary}>
                {t('suggestion')}
              </AppText>
            </View>
            <AppText variant="body" color={Palette.textPrimary}>
              {insight.suggestion}
            </AppText>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                markInsightsRead([insight.id]);
                notify(t('insightMarkedRead'));
              }}
              disabled={isRead(insight.id)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionButton,
                styles.secondaryAction,
                isRead(insight.id) && styles.disabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name={isRead(insight.id) ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={17}
                color={Palette.primary}
              />
              <AppText variant="button" color={Palette.primary}>
                {isRead(insight.id) ? t('readBadge') : t('markAsRead')}
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => {
                dismissInsight(insight.id);
                notify(t('insightDismissed'));
                if (router.canGoBack()) router.back();
                else router.replace('/insights');
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionButton,
                styles.ghostAction,
                pressed && styles.pressed,
              ]}>
              <Ionicons name="eye-off-outline" size={17} color={Palette.textSecondary} />
              <AppText variant="button" color={Palette.textSecondary}>
                {t('dismissInsight')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <AppText variant="small" color={Palette.textSecondary}>
        {label}
      </AppText>
      <AppText variant="small" align="right" style={styles.metaValue}>
        {value}
      </AppText>
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
  heroCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.large,
    padding: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.lg,
    ...Shadows.card,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '44%',
    backgroundColor: Palette.page,
    borderRadius: Radius.input,
    padding: Spacing.md,
    gap: 2,
  },
  metaBlock: {
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  metaValue: {
    flex: 1,
  },
  suggestionCard: {
    backgroundColor: Palette.lightBlue,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryAction: {
    backgroundColor: Palette.lightBlue,
  },
  ghostAction: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.82,
  },
});
