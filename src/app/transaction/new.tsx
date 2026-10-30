import { router, useLocalSearchParams } from 'expo-router';

import { TransactionForm } from '@/components/transaction-form';
import { useI18n } from '@/hooks/use-i18n';
import { useApp } from '@/store/app-context';
import type { TransactionInput } from '@/store/app-context';

export default function NewTransactionScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { addTransaction, notify } = useApp();
  const { t } = useI18n();

  const defaultType = type === 'income' ? 'income' : 'expense';

  const handleSubmit = (input: TransactionInput) => {
    addTransaction(input);
    notify(input.type === 'income' ? t('incomeSaved') : t('expenseSaved'));
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return <TransactionForm mode="create" defaultType={defaultType} onSubmit={handleSubmit} />;
}
