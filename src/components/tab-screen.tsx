import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, type TabKey } from '@/components/bottom-nav';
import { Layout, Palette } from '@/constants/design';

interface TabScreenProps {
  active: TabKey;
  children: ReactNode;
  scrollProps?: ScrollViewProps;
}

export function TabScreen({ active, children, scrollProps }: TabScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Layout.navHeight + insets.bottom + 40,
          },
        ]}
        {...scrollProps}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
      <BottomNav active={active} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.page,
  },
  scrollContent: {
    paddingHorizontal: Layout.pagePadding,
    flexGrow: 1,
  },
  content: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    gap: 18,
  },
});
