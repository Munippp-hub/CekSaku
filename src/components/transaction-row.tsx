import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { categoryName } from '@/lib/finance';
import { formatTime } from '@/lib/format';
import type { Category, Transaction } from '@/types/models';

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  onPress: () => void;
  showDate?: string;
}

export function TransactionRow({ transaction, category, onPress, showDate }: TransactionRowProps) {
  const { money, locale } = useI18n();
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description} ${money(transaction.amount)}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.typeBadge, isIncome ? styles.badgeIncome : styles.badgeExpense]}>
        <Ionicons
          name={isIncome ? 'add' : 'remove'}
          size={17}
          color={isIncome ? Palette.primary : Palette.warning}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <AppText variant="subheading" numberOfLines={1} style={styles.description}>
            {transaction.description}
          </AppText>
          <AppText
            variant="amountSmall"
            color={isIncome ? Palette.primary : Palette.textPrimary}
            numberOfLines={1}>
            {`${isIncome ? '+' : '−'}${money(transaction.amount)}`}
          </AppText>
        </View>
        <View style={styles.metaLine}>
          <AppText variant="caption" color={Palette.textSecondary} numberOfLines={1} style={styles.meta}>
            {categoryName(category, locale, transaction.categoryId)}
          </AppText>
          <AppText variant="caption" color={Palette.navInactive} numberOfLines={1}>
            {[showDate ?? '', formatTime(transaction.transactionDate)].filter(Boolean).join(' · ')}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: Spacing.md + 2,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIncome: {
    backgroundColor: Palette.lightBlue,
  },
  badgeExpense: {
    backgroundColor: Palette.warningSoft,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  description: {
    flex: 1,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  meta: {
    flexShrink: 1,
  },
});
