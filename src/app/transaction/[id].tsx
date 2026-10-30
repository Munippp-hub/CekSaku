import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { CategoryIcon } from '@/components/category-icon';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { categoryName } from '@/lib/finance';
import { formatDateLong, formatTime } from '@/lib/format';
import { useApp } from '@/store/app-context';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, categories, deleteTransaction, notify } = useApp();
  const { t, money, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const transaction = transactions.find((item) => item.id === id);
  const category = categories.find((item) => item.id === transaction?.categoryId);

  if (!transaction) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
        <PageHeader title={t('transactionDetail')} showBack backHref="/history" />
        <EmptyState
          icon="receipt-outline"
          title={t('noResultsTitle')}
          message={t('noResultsBody')}
        />
      </View>
    );
  }

  const isIncome = transaction.type === 'income';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/history');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}>
        <View style={styles.inner}>
          <PageHeader title={t('transactionDetail')} showBack backHref="/history" />

          <View style={styles.amountCard}>
            <View style={[styles.typeBadge, isIncome ? styles.badgeIncome : styles.badgeExpense]}>
              <Ionicons
                name={isIncome ? 'arrow-down' : 'arrow-up'}
                size={14}
                color={isIncome ? Palette.primary : Palette.warning}
              />
              <AppText variant="caption" color={isIncome ? Palette.primary : Palette.warning}>
                {isIncome ? t('income') : t('expense')}
              </AppText>
            </View>
            <AppText variant="amount" numberOfLines={1} adjustsFontSizeToFit>
              {`${isIncome ? '+' : '−'}${money(transaction.amount)}`}
            </AppText>
            <AppText variant="subheading" color={Palette.textSecondary} align="center">
              {transaction.description}
            </AppText>
          </View>

          <View style={styles.detailsCard}>
            <DetailRow
              icon="pricetag-outline"
              label={t('category')}
              value={
                <View style={styles.categoryValue}>
                  <CategoryIcon category={category} size={12} boxSize={22} />
                  <AppText variant="body">
                    {categoryName(category, locale, transaction.categoryId)}
                  </AppText>
                </View>
              }
            />
            <DetailRow
              icon="calendar-outline"
              label={t('date')}
              value={<AppText variant="body">{formatDateLong(transaction.transactionDate, locale)}</AppText>}
            />
            <DetailRow
              icon="time-outline"
              label={t('time')}
              value={<AppText variant="body">{formatTime(transaction.transactionDate)}</AppText>}
            />
            {transaction.note ? (
              <DetailRow
                icon="document-text-outline"
                label={t('note')}
                value={<AppText variant="body">{transaction.note}</AppText>}
              />
            ) : null}
            <DetailRow
              icon="create-outline"
              label={t('createdAt')}
              value={
                <AppText variant="body" color={Palette.textSecondary}>
                  {`${formatDateLong(transaction.createdAt, locale)} · ${formatTime(
                    transaction.createdAt
                  )}`}
                </AppText>
              }
            />
            {transaction.updatedAt !== transaction.createdAt ? (
              <DetailRow
                icon="refresh-outline"
                label={t('updatedAt')}
                value={
                  <AppText variant="body" color={Palette.textSecondary}>
                    {`${formatDateLong(transaction.updatedAt, locale)} · ${formatTime(
                      transaction.updatedAt
                    )}`}
                  </AppText>
                }
              />
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/transaction/edit/[id]', params: { id: transaction.id } })
              }
              accessibilityRole="button"
              style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
              <Ionicons name="create-outline" size={17} color={Palette.white} />
              <AppText variant="button" color={Palette.white}>
                {t('edit')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => setConfirmVisible(true)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
              <Ionicons name="trash-outline" size={17} color={Palette.warning} />
              <AppText variant="button" color={Palette.warning}>
                {t('delete')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title={t('deleteTitle')}
        message={t('deleteBody', { desc: transaction.description })}
        confirmLabel={t('delete')}
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          deleteTransaction(transaction.id);
          notify(t('transactionDeleted'));
          goBack();
        }}
      />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Ionicons name={icon} size={16} color={Palette.textSecondary} />
        <AppText variant="small" color={Palette.textSecondary}>
          {label}
        </AppText>
      </View>
      <View style={styles.detailValue}>{value}</View>
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
  amountCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.large,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.card,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  badgeIncome: {
    backgroundColor: Palette.lightBlue,
  },
  badgeExpense: {
    backgroundColor: Palette.warningSoft,
  },
  detailsCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 118,
  },
  detailValue: {
    flex: 1,
    alignItems: 'flex-start',
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  editButton: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Palette.warningSoft,
    borderWidth: 1,
    borderColor: '#F7D5CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
