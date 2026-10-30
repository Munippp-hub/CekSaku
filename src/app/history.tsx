import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { BottomNav } from '@/components/bottom-nav';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { SegmentedControl } from '@/components/segmented-control';
import { TransactionRow } from '@/components/transaction-row';
import { Layout, Palette, Radius, Spacing, Typography } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { categoryName, sortByNewest } from '@/lib/finance';
import { formatDate } from '@/lib/format';
import { useApp } from '@/store/app-context';
import type { TransactionType } from '@/types/models';

type Filter = 'all' | TransactionType;
const PAGE_SIZE = 20;

export default function HistoryScreen() {
  const { transactions, categories, customCategories } = useApp();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<Filter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const usedCategories = useMemo(() => {
    const ids = new Set(transactions.map((transaction) => transaction.categoryId));
    return [...categories, ...customCategories].filter((category) => ids.has(category.id));
  }, [transactions, categories, customCategories]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sortByNewest(transactions).filter((transaction) => {
      if (filter !== 'all' && transaction.type !== filter) return false;
      if (categoryFilter !== 'all' && transaction.categoryId !== categoryFilter) return false;
      if (!search) return true;
      const category = categories.find((item) => item.id === transaction.categoryId);
      const haystack = [
        transaction.description,
        transaction.note ?? '',
        categoryName(category, locale, ''),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [transactions, filter, categoryFilter, query, categories, locale]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visible.length;

  return (
    <View style={styles.root}>
      <View style={[styles.inner, { paddingTop: insets.top + 12 }]}>
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Layout.navHeight + insets.bottom + 40 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <PageHeader
                title={t('historyTitle')}
                subtitle={t('historySubtitle', { count: filtered.length })}
                showBell
              />

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color={Palette.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={(text) => {
                    setQuery(text);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder={t('searchPlaceholder')}
                  placeholderTextColor={Palette.navInactive}
                  style={styles.searchInput}
                  accessibilityLabel={t('search')}
                  returnKeyType="search"
                />
                {query ? (
                  <Pressable
                    onPress={() => setQuery('')}
                    accessibilityRole="button"
                    accessibilityLabel={t('close')}
                    hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={Palette.navInactive} />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.filters}>
                <SegmentedControl
                  value={filter}
                  onChange={(next) => {
                    setFilter(next);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  options={[
                    { value: 'all', label: t('all') },
                    { value: 'income', label: t('filterIncome') },
                    { value: 'expense', label: t('filterExpense') },
                  ]}
                />
              </View>

              <View style={styles.categoryFilters}>
                <SegmentedControl
                  scrollable
                  value={categoryFilter}
                  onChange={(next) => {
                    setCategoryFilter(next);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  options={[
                    { value: 'all', label: t('allCategories') },
                    ...usedCategories.map((category) => ({
                      value: category.id,
                      label: categoryName(category, locale),
                    })),
                  ]}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const category = categories.find((entry) => entry.id === item.categoryId);
            return (
              <TransactionRow
                transaction={item}
                category={category}
                showDate={formatDate(item.transactionDate, locale)}
                onPress={() =>
                  router.push({ pathname: '/transaction/[id]', params: { id: item.id } })
                }
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <EmptyState
                icon={transactions.length === 0 ? 'receipt-outline' : 'search-outline'}
                title={
                  transactions.length === 0 ? t('emptyHistoryTitle') : t('noResultsTitle')
                }
                message={
                  transactions.length === 0 ? t('emptyHistoryBody') : t('noResultsBody')
                }
              />
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <Pressable
                onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]}>
                <AppText variant="label" color={Palette.primary}>
                  {t('loadMore')}
                </AppText>
                <Ionicons name="chevron-down" size={15} color={Palette.primary} />
              </Pressable>
            ) : undefined
          }
        />
      </View>
      <BottomNav active="history" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.page,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Layout.pagePadding,
  },
  headerBlock: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 46,
    borderRadius: Radius.input,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: Typography.body.fontSize,
    paddingVertical: Spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryFilters: {
    marginHorizontal: -Spacing.xs,
  },
  separator: {
    height: Spacing.md,
  },
  emptyWrap: {
    paddingTop: Spacing.xl,
  },
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 46,
    marginTop: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  pressed: {
    opacity: 0.8,
  },
});
