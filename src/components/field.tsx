import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  right?: ReactNode;
  prefix?: string;
  containerStyle?: TextInputProps['style'];
}

export function Field({
  label,
  error,
  hint,
  right,
  prefix,
  style,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color={Palette.textSecondary}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error ? styles.inputRowError : null,
          containerStyle,
        ]}>
        {prefix ? (
          <AppText variant="bodyStrong" color={Palette.textSecondary}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          placeholderTextColor={Palette.navInactive}
          style={[styles.input, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <AppText variant="small" color={Palette.warning}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small" color={Palette.textSecondary}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.lg,
  },
  inputRowFocused: {
    borderColor: Palette.primary,
  },
  inputRowError: {
    borderColor: Palette.warning,
  },
  input: {
    flex: 1,
    color: Palette.textPrimary,
    fontSize: Typography.body.fontSize,
    paddingVertical: Spacing.md,
  },
});
