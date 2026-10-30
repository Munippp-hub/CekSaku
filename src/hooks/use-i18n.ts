import { useCallback, useMemo } from 'react';

import { translate, type TranslationKey } from '@/i18n';
import { formatMoney } from '@/lib/format';
import { useApp } from '@/store/app-context';

export function useI18n() {
  const { settings } = useApp();
  const locale = settings.language;
  const currency = settings.currency;

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const money = useCallback(
    (amount: number) => formatMoney(amount, currency, locale),
    [currency, locale]
  );

  return useMemo(() => ({ locale, currency, t, money }), [locale, currency, t, money]);
}
