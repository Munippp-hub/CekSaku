import { Pressable, StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/design';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/** Toggle uses brand blue for the active state per PRD 24.10. */
export function Toggle({ value, onChange, disabled, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[styles.track, value && styles.trackActive, disabled && styles.disabled]}>
      <View style={[styles.thumb, value && styles.thumbActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 27,
    borderRadius: 999,
    backgroundColor: '#DCE3E8',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackActive: {
    backgroundColor: Palette.primary,
  },
  thumb: {
    width: 21,
    height: 21,
    borderRadius: 999,
    backgroundColor: Palette.white,
    shadowColor: '#173042',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  disabled: {
    opacity: 0.45,
  },
});
