import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { PageHeader } from '@/components/page-header';
import { SubScreen } from '@/components/sub-screen';
import { Palette, Radius, Spacing } from '@/constants/design';
import { LINKED_ACCOUNTS } from '@/data/defaults';
import { useI18n } from '@/hooks/use-i18n';

export default function LinkedAccountsScreen() {
  const { t } = useI18n();

  return (
    <SubScreen>
      <PageHeader title={t('linkedTitle')} showBack backHref="/settings" />

      <View style={styles.note}>
        <Ionicons name="link-outline" size={18} color={Palette.primary} />
        <AppText variant="small" color={Palette.textSecondary} style={styles.noteText}>
          {t('linkedBody')}
        </AppText>
      </View>

      <View style={styles.list}>
        {LINKED_ACCOUNTS.map((account) => (
          <Card key={account.id} style={styles.accountCard}>
            <View style={styles.accountIcon}>
              <Ionicons
                name={account.id === 'gopay' || account.id === 'ovo' ? 'wallet-outline' : 'business-outline'}
                size={19}
                color={Palette.primary}
              />
            </View>
            <View style={styles.accountTexts}>
              <AppText variant="subheading">{account.provider}</AppText>
              <AppText variant="caption" color={Palette.textSecondary}>
                {account.description}
              </AppText>
              <AppText variant="caption" color={Palette.navInactive}>
                {t('notConnected')}
              </AppText>
            </View>
            <View style={styles.comingSoon}>
              <AppText variant="caption" color={Palette.textSecondary}>
                {t('comingSoon')}
              </AppText>
            </View>
          </Card>
        ))}
      </View>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Palette.lightBlue,
    borderRadius: Radius.input,
    padding: Spacing.md,
  },
  noteText: {
    flex: 1,
  },
  list: {
    gap: Spacing.md,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  accountIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Palette.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTexts: {
    flex: 1,
    gap: 1,
  },
  comingSoon: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Palette.page,
    borderWidth: 1,
    borderColor: Palette.border,
  },
});
