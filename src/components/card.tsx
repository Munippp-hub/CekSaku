import { StyleSheet, View, type ViewProps } from 'react-native';

import { Palette, Radius, Shadows, Spacing } from '@/constants/design';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
});
