import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { AppText } from '@/components/app-text';
import { CategoryIcon } from '@/components/category-icon';
import { DatePickerModal } from '@/components/date-picker-modal';
import { Field } from '@/components/field';
import { Palette, Radius, Shadows, Spacing, Typography } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { categoryName } from '@/lib/finance';
import {
  combineDateAndTime,
  currencySymbol,
  formatDate,
  formatNumberInput,
  parseNumberInput,
  toTimeInput,
} from '@/lib/format';
import { useApp } from '@/store/app-context';
import type { TransactionInput } from '@/store/app-context';
import type { Transaction, TransactionType } from '@/types/models';

interface TransactionFormProps {
  mode: 'create' | 'edit';
  defaultType?: TransactionType;
  initial?: Transaction;
  onSubmit: (input: TransactionInput) => void;
}

const MAX_AMOUNT = 999_999_999_999;

export function TransactionForm({ mode, defaultType = 'expense', initial, onSubmit }: TransactionFormProps) {
  const { categories } = useApp();
  const { t, locale, currency } = useI18n();
  const insets = useSafeAreaInsets();

  const initialType = initial?.type ?? defaultType;
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [amountText, setAmountText] = useState(
    initial ? formatNumberInput(initial.amount, locale) : ''
  );
  const [categoryId, setCategoryId] = useState(() => {
    if (initial) return initial.categoryId;
    const first = categories.find((category) => category.type === initialType);
    return first?.id ?? '';
  });
  const [description, setDescription] = useState(initial?.description ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [date, setDate] = useState<Date>(initial ? new Date(initial.transactionDate) : new Date());
  const [time, setTime] = useState(toTimeInput(initial?.transactionDate ?? new Date().toISOString()));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; time?: string }>({});

  const typeCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const first = categories.find((category) => category.type === nextType);
    setCategoryId(first?.id ?? '');
  };

  const handleAmountChange = (text: string) => {
    const numeric = parseNumberInput(text);
    setAmountText(numeric ? formatNumberInput(numeric, locale) : '');
    setAmount(numeric);
    if (errors.amount) setErrors((current) => ({ ...current, amount: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (amount <= 0) nextErrors.amount = t('amountRequired');
    if (amount > MAX_AMOUNT) nextErrors.amount = t('amountTooLarge');
    if (!categoryId) nextErrors.category = t('categoryRequired');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) nextErrors.time = t('timeInvalid');
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const selectedCategory = categories.find((category) => category.id === categoryId);
    onSubmit({
      type,
      amount,
      categoryId,
      description:
        description.trim() || categoryName(selectedCategory, locale, type === 'income' ? 'Income' : 'Expense'),
      note: note.trim() || undefined,
      transactionDate: combineDateAndTime(date, time).toISOString(),
    });
  };

  const title =
    mode === 'edit'
      ? type === 'income'
        ? t('editIncomeTitle')
        : t('editExpenseTitle')
      : type === 'income'
        ? t('addIncomeTitle')
        : t('addExpenseTitle');

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xxxl },
        ]}>
        <View style={styles.inner}>
          <PageHeader title={title} showBack />

          <View style={styles.typeSwitch}>
            {(['income', 'expense'] as TransactionType[]).map((option) => {
              const focused = option === type;
              const isIncome = option === 'income';
              return (
                <Pressable
                  key={option}
                  onPress={() => handleTypeChange(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: focused }}
                  style={[
                    styles.typeOption,
                    focused && (isIncome ? styles.typeIncomeActive : styles.typeExpenseActive),
                  ]}>
                  <Ionicons
                    name={isIncome ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                    size={17}
                    color={
                      focused ? Palette.white : isIncome ? Palette.primary : Palette.warning
                    }
                  />
                  <AppText
                    variant="label"
                    color={focused ? Palette.white : Palette.textSecondary}>
                    {isIncome ? t('income') : t('expense')}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.amountCard, errors.amount ? styles.amountCardError : null]}>
            <AppText variant="label" color={Palette.textSecondary}>
              {t('amount')}
            </AppText>
            <View style={styles.amountRow}>
              <AppText variant="title" color={Palette.textSecondary} style={styles.prefix}>
                {currencySymbol(currency)}
              </AppText>
              <TextInput
                value={amountText}
                onChangeText={handleAmountChange}
                placeholder={t('amountPlaceholder')}
                placeholderTextColor={Palette.navInactive}
                keyboardType="number-pad"
                inputMode="numeric"
                style={styles.amountInput}
                accessibilityLabel={t('amount')}
                maxLength={16}
              />
            </View>
            {errors.amount ? (
              <AppText variant="small" color={Palette.warning}>
                {errors.amount}
              </AppText>
            ) : null}
          </View>

          <View style={styles.section}>
            <AppText variant="label" color={Palette.textSecondary}>
              {t('category')}
            </AppText>
            <View style={styles.categoryGrid}>
              {typeCategories.map((category) => {
                const focused = category.id === categoryId;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      setCategoryId(category.id);
                      setErrors((current) => ({ ...current, category: undefined }));
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: focused }}
                    style={[styles.categoryChip, focused && styles.categoryChipActive]}>
                    <CategoryIcon category={category} size={15} boxSize={30} />
                    <AppText
                      variant="caption"
                      color={focused ? Palette.primary : Palette.textSecondary}
                      numberOfLines={1}
                      style={styles.categoryLabel}>
                      {categoryName(category, locale)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            {errors.category ? (
              <AppText variant="small" color={Palette.warning}>
                {errors.category}
              </AppText>
            ) : null}
          </View>

          <Field
            label={`${t('descriptionLabel')} (${t('optional')})`}
            value={description}
            onChangeText={setDescription}
            placeholder={
              type === 'income' ? t('incomeDescPlaceholder') : t('expenseDescPlaceholder')
            }
            maxLength={80}
          />

          <Field
            label={`${t('noteLabel')}`}
            value={note}
            onChangeText={setNote}
            placeholder={t('notePlaceholder')}
            multiline
            numberOfLines={3}
            containerStyle={styles.noteInput}
            maxLength={240}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <AppText variant="label" color={Palette.textSecondary}>
                {t('date')}
              </AppText>
              <Pressable
                onPress={() => setDatePickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={t('pickDate')}
                style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={18} color={Palette.primary} />
                <AppText variant="body" numberOfLines={1}>
                  {formatDate(date.toISOString(), locale)}
                </AppText>
              </Pressable>
            </View>

            <View style={styles.timeColumn}>
              <AppText variant="label" color={Palette.textSecondary}>
                {t('time')}
              </AppText>
              <TextInput
                value={time}
                onChangeText={(text) => {
                  setTime(text.replace(/[^\d:]/g, '').slice(0, 5));
                  setErrors((current) => ({ ...current, time: undefined }));
                }}
                placeholder="HH:MM"
                placeholderTextColor={Palette.navInactive}
                keyboardType="numbers-and-punctuation"
                style={[styles.timeInput, errors.time ? styles.inputError : null]}
                accessibilityLabel={t('time')}
                maxLength={5}
              />
            </View>
          </View>
          {errors.time ? (
            <AppText variant="small" color={Palette.warning}>
              {errors.time}
            </AppText>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            accessibilityRole="button"
            style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
            <AppText variant="button" color={Palette.white}>
              {mode === 'edit'
                ? t('saveChanges')
                : type === 'income'
                  ? t('saveIncome')
                  : t('saveExpense')}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/home');
            }}
            accessibilityRole="button"
            style={styles.cancelLink}>
            <AppText variant="label" color={Palette.textSecondary}>
              {t('cancel')}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      <DatePickerModal
        visible={datePickerOpen}
        value={date}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(next) => {
          setDate(next);
          setDatePickerOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.page,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  typeSwitch: {
    flexDirection: 'row',
    backgroundColor: Palette.surface,
    borderRadius: Radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: Radius.pill,
  },
  typeIncomeActive: {
    backgroundColor: Palette.primary,
  },
  typeExpenseActive: {
    backgroundColor: Palette.warning,
  },
  amountCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.lg,
    gap: Spacing.xs,
    ...Shadows.card,
  },
  amountCardError: {
    borderColor: Palette.warning,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  prefix: {
    fontSize: 22,
  },
  amountInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: '700',
    color: Palette.textPrimary,
    paddingVertical: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    maxWidth: '100%',
  },
  categoryChipActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.lightBlue,
  },
  categoryLabel: {
    maxWidth: 130,
  },
  noteInput: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateColumn: {
    flex: 2,
    gap: Spacing.sm,
  },
  timeColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.md,
  },
  timeInput: {
    height: 48,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.md,
    color: Palette.textPrimary,
    fontSize: Typography.body.fontSize,
  },
  inputError: {
    borderColor: Palette.warning,
  },
  submit: {
    height: 50,
    borderRadius: Radius.pill,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});

export type { TransactionFormProps };
