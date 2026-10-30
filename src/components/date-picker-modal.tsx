import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Palette, Radius, Shadows, Spacing } from '@/constants/design';
import { useI18n } from '@/hooks/use-i18n';
import { DAY_SHORT, isSameDay, monthYearLabel } from '@/lib/format';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export function DatePickerModal({ visible, value, onClose, onSelect }: DatePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible ? <CalendarPanel value={value} onClose={onClose} onSelect={onSelect} /> : null}
    </Modal>
  );
}

function CalendarPanel({
  value,
  onClose,
  onSelect,
}: {
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}) {
  const { locale, t } = useI18n();
  const [cursor, setCursor] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const [selected, setSelected] = useState(value);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(new Date(year, month, day));
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [cursor]);

  const shiftMonth = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('close')} />
      <View style={styles.dialog}>
        <View style={styles.header}>
          <Pressable
            onPress={() => shiftMonth(-1)}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="previous month">
            <Ionicons name="chevron-back" size={18} color={Palette.textPrimary} />
          </Pressable>
          <AppText variant="heading">{monthYearLabel(cursor, locale)}</AppText>
          <Pressable
            onPress={() => shiftMonth(1)}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="next month">
            <Ionicons name="chevron-forward" size={18} color={Palette.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {DAY_SHORT[locale].map((day) => (
            <AppText key={day} variant="caption" color={Palette.textSecondary} style={styles.weekDay}>
              {day}
            </AppText>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, index) => {
            if (!cell) return <View key={`empty-${index}`} style={styles.cell} />;
            const active = isSameDay(cell, selected);
            const today = isSameDay(cell, new Date());
            return (
              <Pressable
                key={cell.toISOString()}
                onPress={() => setSelected(cell)}
                style={[styles.cell, active && styles.cellActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <AppText
                  variant="body"
                  color={active ? Palette.white : today ? Palette.primary : Palette.textPrimary}
                  style={today && !active ? styles.todayLabel : undefined}>
                  {cell.getDate()}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            accessibilityRole="button">
            <AppText variant="button">{t('cancel')}</AppText>
          </Pressable>
          <Pressable
            onPress={() => onSelect(selected)}
            style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}
            accessibilityRole="button">
            <AppText variant="button" color={Palette.white}>
              {t('save')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
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
    maxWidth: 380,
    backgroundColor: Palette.surface,
    borderRadius: Radius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Palette.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  cellActive: {
    backgroundColor: Palette.primary,
  },
  todayLabel: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  button: {
    flex: 1,
    height: 44,
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
  pressed: {
    opacity: 0.8,
  },
});
