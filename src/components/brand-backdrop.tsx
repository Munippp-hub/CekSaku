import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/design';

/**
 * Blue gradient backdrop with thin curved lines, matching the onboarding
 * reference. The curves are decorative only (pointerEvents none).
 */
export function BrandBackdrop({ children }: { children: ReactNode }) {
  return (
    <LinearGradient
      colors={[Palette.onboarding, Palette.onboardingDeep]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.root}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.curves]}>
        <View style={[styles.curve, styles.curveOne]} />
        <View style={[styles.curve, styles.curveTwo]} />
        <View style={[styles.curve, styles.curveThree]} />
        <View style={[styles.curve, styles.curveFour]} />
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  curves: {
    overflow: 'hidden',
  },
  curve: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
  },
  curveOne: {
    width: 520,
    height: 520,
    top: -160,
    left: -190,
  },
  curveTwo: {
    width: 720,
    height: 720,
    top: -240,
    left: -280,
  },
  curveThree: {
    width: 560,
    height: 560,
    bottom: -220,
    right: -190,
  },
  curveFour: {
    width: 760,
    height: 760,
    bottom: -300,
    right: -280,
  },
});
