import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { CategoryIcon } from '@/components/category-icon';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Field } from '@/components/field';
import { PageHeader } from '@/components/page-header';
import { SubScreen } from '@/components/sub-screen';
import { CategoryColors, Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { categoryName } from '@/lib/finance';
import { useApp } from '@/store/app-context';
import type { Category } from '@/types/models';

export default function CategoriesScreen() {
  const { categories, transactions, addCategory, deleteCategory, notify } = useApp();
  const { t, locale } = useI18n();

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CategoryColors[0]);
  const [error, setError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const expenseCategories = categories.filter((category) => category.type === 'expense');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t('categoryEmpty'));
      return;
    }
    const duplicate = expenseCategories.some(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError(t('categoryDuplicate'));
      return;
    }
    addCategory({ name: trimmed, color });
    setName('');
    setError(undefined);
    notify(t('categoryAdded'));
  };

  const requestDelete = (category: Category) => {
    const used = transactions.some((transaction) => transaction.categoryId === category.id);
    if (used) {
      notify(t('categoryInUse'));
      return;
    }
    setDeleteTarget(category);
  };

  return (
    <SubScreen>
      <PageHeader title={t('categoriesTitle')} showBack backHref="/settings" />

      <Card style={styles.formCard}>
        <AppText variant="heading">{t('addCategoryTitle')}</AppText>
        <Field
          label={t('categoryNameLabel')}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(undefined);
          }}
          placeholder={t('categoryNamePlaceholder')}
          error={error}
          maxLength={28}
        />
        <View style={styles.colorBlock}>
          <AppText variant="label" color={Palette.textSecondary}>
            {t('categoryColor')}
          </AppText>
          <View style={styles.swatches}>
            {CategoryColors.map((option) => {
              const active = option === color;
              return (
                <Pressable
                  key={option}
                  onPress={() => setColor(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.swatch, { backgroundColor: option }, active && styles.swatchActive]}>
                  {active ? <Ionicons name="checkmark" size={14} color={Palette.white} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
        <Pressable
          onPress={handleAdd}
          accessibilityRole="button"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={18} color={Palette.white} />
          <AppText variant="button" color={Palette.white}>
            {t('addCategory')}
          </AppText>
        </Pressable>
      </Card>

      <Card style={styles.listCard}>
        {expenseCategories.map((category, index) => (
          <View
            key={category.id}
            style={[styles.row, index < expenseCategories.length - 1 && styles.rowBorder]}>
            <CategoryIcon category={category} size={16} boxSize={34} />
            <View style={styles.rowTexts}>
              <AppText variant="subheading" numberOfLines={1}>
                {categoryName(category, locale)}
              </AppText>
              {!category.isDefault ? (
                <AppText variant="caption" color={Palette.primary}>
                  {t('customBadge')}
                </AppText>
              ) : null}
            </View>
            {!category.isDefault ? (
              <Pressable
                onPress={() => requestDelete(category)}
                accessibilityRole="button"
                accessibilityLabel={t('delete')}
                hitSlop={8}>
                <Ionicons name="trash-outline" size={17} color={Palette.warning} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </Card>

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title={t('categoryDeleteTitle')}
        message={t('categoryDeleteBody', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('delete')}
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory(deleteTarget.id);
            notify(t('categoryDeleted'));
          }
          setDeleteTarget(null);
        }}
      />
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: Spacing.md,
  },
  colorBlock: {
    gap: Spacing.sm,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: Palette.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: Palette.primary,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  rowTexts: {
    flex: 1,
    gap: 1,
  },
  pressed: {
    opacity: 0.85,
  },
});
