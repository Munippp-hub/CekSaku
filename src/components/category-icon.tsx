import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { IconBox } from '@/components/icon-box';
import type { Category } from '@/types/models';

interface CategoryIconProps {
  category?: Category;
  size?: number;
  boxSize?: number;
  fallbackIcon?: ComponentProps<typeof Ionicons>['name'];
}

export function CategoryIcon({
  category,
  size = 18,
  boxSize = 40,
  fallbackIcon = 'pricetag-outline',
}: CategoryIconProps) {
  const color = category?.color ?? '#828282';
  return (
    <IconBox
      name={(category?.icon as ComponentProps<typeof Ionicons>['name']) ?? fallbackIcon}
      size={size}
      boxSize={boxSize}
      color={color}
      backgroundColor={`${color}1F`}
      radius={boxSize / 2.6}
    />
  );
}
