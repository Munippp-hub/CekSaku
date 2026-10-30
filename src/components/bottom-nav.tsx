import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Layout, Palette, Radius, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import type { TranslationKey } from '@/i18n';

export type TabKey = 'home' | 'insights' | 'history' | 'settings';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: {
  key: TabKey;
  href: '/home' | '/insights' | '/history' | '/settings';
  icon: IconName;
  activeIcon: IconName;
  label: TranslationKey;
}[] = [
  { key: 'home', href: '/home', icon: 'home-outline', activeIcon: 'home', label: 'navHome' },
  {
    key: 'insights',
    href: '/insights',
    icon: 'sparkles-outline',
    activeIcon: 'sparkles',
    label: 'navInsight',
  },
  {
    key: 'history',
    href: '/history',
    icon: 'time-outline',
    activeIcon: 'time',
    label: 'navHistory',
  },
  {
    key: 'settings',
    href: '/settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
    label: 'navSettings',
  },
];

export function BottomNav({ active }: { active: TabKey }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const compact = width < 360;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.inner}>
        {TABS.map((tab) => {
          const focused = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={t(tab.label)}
              onPress={() => {
                if (!focused) router.replace(tab.href);
              }}
              style={styles.item}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={focused ? tab.activeIcon : tab.icon}
                  size={21}
                  color={focused ? Palette.primary : Palette.navInactive}
                />
              </View>
              {!compact ? (
                <AppText
                  variant="caption"
                  color={focused ? Palette.primary : Palette.navInactive}
                  style={styles.label}>
                  {t(tab.label)}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    shadowColor: '#173042',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    height: Layout.navHeight - Spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 44,
  },
  iconWrap: {
    width: 42,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Palette.lightBlue,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
