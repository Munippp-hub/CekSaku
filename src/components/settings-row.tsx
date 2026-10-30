import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Palette, Spacing } from '@/constants/design';

interface SettingsRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  last?: boolean;
}

export function SettingsRow({
  icon,
  label,
  description,
  value,
  right,
  onPress,
  showChevron,
  disabled,
  last,
}: SettingsRowProps) {
  const content = (
    <View style={[styles.row, !last && styles.rowBorder, disabled && styles.disabled]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={17} color={Palette.primary} />
      </View>
      <View style={styles.texts}>
        <AppText variant="subheading">{label}</AppText>
        {description ? (
          <AppText variant="caption" color={Palette.textSecondary}>
            {description}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="small" color={Palette.textSecondary} numberOfLines={1}>
          {value}
        </AppText>
      ) : null}
      {right}
      {showChevron ? (
        <Ionicons name="chevron-forward" size={17} color={Palette.navInactive} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" color={Palette.textSecondary} style={styles.sectionTitle}>
        {title}
      </AppText>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.xs,
    letterSpacing: 0.2,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    minHeight: 56,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: Palette.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
});
