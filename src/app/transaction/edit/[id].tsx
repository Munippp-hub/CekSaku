import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { TransactionForm } from '@/components/transaction-form';
import { AppButton } from '@/components/app-button';
import { useI18n } from '@/hooks/use-i18n';
import { useApp } from '@/store/app-context';
import type { TransactionInput } from '@/store/app-context';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, notify } = useApp();
  const { t } = useI18n();
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        <PageHeader title={t('edit')} showBack backHref="/history" />
        <EmptyState
          icon="alert-circle-outline"
          title={t('noResultsTitle')}
          message={t('noResultsBody')}>
          <AppButton label={t('back')} variant="secondary" onPress={() => router.back()} />
        </EmptyState>
      </View>
    );
  }

  const handleSubmit = (input: TransactionInput) => {
    updateTransaction(transaction.id, input);
    notify(t('transactionUpdated'));
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/history');
    }
  };

  return <TransactionForm mode="edit" initial={transaction} onSubmit={handleSubmit} />;
}
