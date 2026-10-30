import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Radius } from '@/constants/design';

interface IconBoxProps {
  name: ComponentProps<typeof Ionicons>['name'];
  size?: number;
  boxSize?: number;
  color?: string;
  backgroundColor?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
}

export function IconBox({
  name,
  size = 20,
  boxSize = 40,
  color = Palette.primary,
  backgroundColor = Palette.lightBlue,
  radius,
  style,
  bordered,
}: IconBoxProps) {
  return (
    <View
      style={[
        styles.box,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: radius ?? Math.min(Radius.input, boxSize / 2.4),
          backgroundColor,
          borderWidth: bordered ? 1 : 0,
          borderColor: bordered ? 'rgba(255,255,255,0.55)' : 'transparent',
        },
        style,
      ]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
