import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel={t('close')} />
        <View style={styles.dialog}>
          <AppText variant="heading">{title}</AppText>
          <AppText variant="body" color={Palette.textSecondary}>
            {message}
          </AppText>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
              accessibilityRole="button">
              <AppText variant="button" color={Palette.textPrimary}>
                {cancelLabel ?? t('cancel')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                destructive ? styles.destructive : styles.confirm,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button">
              <AppText variant="button" color={destructive ? Palette.warning : Palette.white}>
                {confirmLabel ?? t('confirm')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Palette.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Palette.surface,
    borderRadius: Radius.large,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadows.floating,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: Palette.page,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  confirm: {
    backgroundColor: Palette.primary,
  },
  destructive: {
    backgroundColor: Palette.warningSoft,
    borderWidth: 1,
    borderColor: '#F7D5CC',
  },
  pressed: {
    opacity: 0.8,
  },
});
