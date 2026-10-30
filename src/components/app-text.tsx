import { Text, type TextProps, type TextStyle } from 'react-native';

import { Palette, Typography, type TextVariant } from '@/constants/design';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function AppText({
  variant = 'body',
  color = Palette.textPrimary,
  align,
  style,
  ...rest
}: AppTextProps) {
  return <Text style={[Typography[variant], { color, textAlign: align }, style]} {...rest} />;
}
