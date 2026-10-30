import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Spacing } from '@/constants/design';

export function PinDots({ length, filled }: { length: number; filled: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length }).map((_, index) => (
        <View key={index} style={[styles.dot, index < filled && styles.dotFilled]} />
      ))}
    </View>
  );
}

interface PinPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  biometricIcon?: 'finger-print-outline' | 'scan-outline';
  disabled?: boolean;
}

export function PinPad({ onDigit, onDelete, onBiometric, biometricIcon, disabled }: PinPadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <View style={styles.pad}>
      {digits.map((digit) => (
        <Key key={digit} label={digit} onPress={() => onDigit(digit)} disabled={disabled} />
      ))}
      {onBiometric ? (
        <Pressable
          onPress={onBiometric}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="biometric"
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
          <Ionicons name={biometricIcon ?? 'finger-print-outline'} size={24} color={Palette.primary} />
        </Pressable>
      ) : (
        <View style={styles.key} />
      )}
      <Key label="0" onPress={() => onDigit('0')} disabled={disabled} />
      <Pressable
        onPress={onDelete}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="delete"
        style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
        <Ionicons name="backspace-outline" size={23} color={Palette.textSecondary} />
      </Pressable>
    </View>
  );
}

function Key({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
      <AppText variant="title" style={styles.keyLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Palette.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Palette.primary,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 330,
    alignSelf: 'center',
  },
  key: {
    width: 84,
    height: 68,
    margin: Spacing.xs,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  keyPressed: {
    backgroundColor: Palette.lightBlue,
  },
  keyLabel: {
    fontSize: 24,
    fontWeight: '600',
  },
});
