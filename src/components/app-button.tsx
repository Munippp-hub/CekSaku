import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { Layout, Palette, Radius, Spacing } from '@/constants/design';

type Variant = 'primary' | 'secondary' | 'surface' | 'outline' | 'danger';
type IconName = ComponentProps<typeof Ionicons>['name'];

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const colors: Record<Variant, { background: string; text: string; border?: string }> = {
  primary: { background: Palette.primary, text: Palette.white },
  secondary: { background: Palette.lightBlue, text: Palette.primary },
  surface: { background: Palette.surface, text: Palette.primary },
  outline: { background: Palette.surface, text: Palette.textPrimary, border: Palette.border },
  danger: { background: Palette.surface, text: Palette.warning, border: '#F7D5CC' },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  fullWidth,
  style,
  testID,
}: AppButtonProps) {
  const theme = colors[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.background,
          borderColor: theme.border ?? 'transparent',
          borderWidth: theme.border ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.content}>
        {icon ? <Ionicons name={icon} size={17} color={theme.text} /> : null}
        <AppText variant="button" color={theme.text} numberOfLines={1}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Layout.buttonHeight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
});
