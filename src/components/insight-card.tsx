import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { IconBox } from '@/components/icon-box';
import { Palette, Radius, Spacing } from '@/constants/design';
import type { Insight } from '@/types/models';

export function insightTheme(severity: Insight['severity']) {
  switch (severity) {
    case 'positive':
      return {
        icon: 'checkmark' as const,
        iconColor: Palette.success,
        background: Palette.successSoft,
        label: 'positive',
      };
    case 'warning':
      return {
        icon: 'alert' as const,
        iconColor: Palette.warning,
        background: Palette.warningSoft,
        label: 'warning',
      };
    default:
      return {
        icon: 'information' as const,
        iconColor: Palette.primary,
        background: Palette.lightBlue,
        label: 'info',
      };
  }
}

export function InsightCard({ insight, onPress }: { insight: Insight; onPress: () => void }) {
  const theme = insightTheme(insight.severity);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={insight.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <IconBox
        name={theme.icon}
        color={theme.iconColor}
        backgroundColor={theme.background}
        boxSize={40}
        size={18}
      />
      <View style={styles.body}>
        <AppText variant="subheading" numberOfLines={2}>
          {insight.title}
        </AppText>
        <AppText variant="small" color={Palette.textSecondary} numberOfLines={2}>
          {insight.body}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Palette.navInactive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.surface,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.md,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
