import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';

interface SummaryCardProps {
  income: number;
  expense: number;
  net: number;
  change: number | null;
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function SummaryCard({
  income,
  expense,
  net,
  change,
  onAddIncome,
  onAddExpense,
}: SummaryCardProps) {
  const { t, money } = useI18n();
  const hasComparison = change !== null;
  const isUp = (change ?? 0) > 0;

  return (
    <LinearGradient
      colors={[Palette.primary, Palette.deep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <AppText variant="small" color="rgba(255,255,255,0.82)">
        {t('moneyIn')}
      </AppText>
      <AppText variant="amount" color={Palette.white} numberOfLines={1} adjustsFontSizeToFit>
        {money(income)}
      </AppText>

      <View style={styles.chip}>
        {hasComparison ? (
          <>
            <Ionicons
              name={isUp ? 'trending-up' : 'trending-down'}
              size={13}
              color={Palette.white}
            />
            <AppText variant="caption" color={Palette.white}>
              {`${isUp ? '+' : ''}${Math.round(change ?? 0)}% ${t('vsLastWeek')}`}
            </AppText>
          </>
        ) : (
          <AppText variant="caption" color={Palette.white}>
            {t('noComparison')}
          </AppText>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <AppText variant="caption" color="rgba(255,255,255,0.72)">
            {t('moneyOut')}
          </AppText>
          <AppText variant="bodyStrong" color={Palette.white} numberOfLines={1}>
            {money(expense)}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <AppText variant="caption" color="rgba(255,255,255,0.72)">
            {t('netBalance')}
          </AppText>
          <AppText variant="bodyStrong" color={Palette.white} numberOfLines={1}>
            {money(net)}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onAddIncome}
          accessibilityRole="button"
          accessibilityLabel={t('addIncome')}
          style={({ pressed }) => [styles.action, styles.actionPrimary, pressed && styles.pressed]}>
          <Ionicons name="add" size={13} color={Palette.primary} />
          <AppText variant="button" color={Palette.primary} numberOfLines={1} style={styles.actionLabel}>
            {t('addIncome').replace('+ ', '')}
          </AppText>
        </Pressable>
        <Pressable
          onPress={onAddExpense}
          accessibilityRole="button"
          accessibilityLabel={t('addExpense')}
          style={({ pressed }) => [styles.action, styles.actionGhost, pressed && styles.pressed]}>
          <Ionicons name="remove" size={13} color={Palette.white} />
          <AppText variant="button" color={Palette.white} numberOfLines={1} style={styles.actionLabel}>
            {t('addExpense').replace('− ', '')}
          </AppText>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    padding: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.floating,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.input,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  stat: {
    flex: 1,
    gap: 1,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginHorizontal: -Spacing.sm,
  },
  action: {
    flex: 1,
    height: 44,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  actionPrimary: {
    backgroundColor: Palette.white,
  },
  actionGhost: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  actionLabel: {
    fontSize: 11.5,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.82,
  },
});
