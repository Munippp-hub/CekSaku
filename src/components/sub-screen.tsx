import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/design';

export function SubScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxxl }]}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
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
});
