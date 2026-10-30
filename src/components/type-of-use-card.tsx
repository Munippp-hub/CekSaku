import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { CategoryIcon } from '@/components/category-icon';
import { Card } from '@/components/card';
import { Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { categoryName, type CategoryTotal } from '@/lib/finance';

interface TypeOfUseCardProps {
  items: CategoryTotal[];
  onAddCategory?: () => void;
}

export function TypeOfUseCard({ items, onAddCategory }: TypeOfUseCardProps) {
  const { t, money, locale } = useI18n();
  const visible = items.slice(0, 4);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading">{t('typeOfUse')}</AppText>
        {items.length > 0 ? (
          <AppText variant="caption" color={Palette.textSecondary}>
            {`${items.length} ${t('category').toLowerCase()}`}
          </AppText>
        ) : null}
      </View>

      {visible.length === 0 ? (
        <AppText variant="small" color={Palette.textSecondary}>
          {t('typeOfUseEmpty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {visible.map((item) => (
            <View key={item.category.id} style={styles.row}>
              <View style={styles.rowTop}>
                <CategoryIcon category={item.category} size={14} boxSize={32} />
                <View style={styles.rowTexts}>
                  <AppText variant="subheading" numberOfLines={1}>
                    {categoryName(item.category, locale)}
                  </AppText>
                  <View style={styles.metaRow}>
                    <AppText variant="caption" color={Palette.textSecondary}>
                      {`${Math.round(item.percent)}%`}
                    </AppText>
                  </View>
                </View>
                <AppText variant="amountSmall" numberOfLines={1}>
                  {money(item.total)}
                </AppText>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(Math.max(item.percent, 2), 100)}%`,
                      backgroundColor: item.category.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('addMoreType')}
        onPress={onAddCategory ?? (() => router.push('/settings/categories'))}
        style={({ pressed }) => [styles.addLink, pressed && styles.pressed]}
        hitSlop={6}>
        <AppText variant="label" color={Palette.primary}>
          {t('addMoreType')}
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: Spacing.lg,
  },
  row: {
    gap: Spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowTexts: {
    flex: 1,
    gap: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Palette.page,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  addLink: {
    alignSelf: 'flex-end',
  },
  pressed: {
    opacity: 0.7,
  },
});
