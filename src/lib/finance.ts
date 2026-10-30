import type { Category, Locale, Transaction, TransactionType } from '@/types/models';

export function inRange(iso: string, start: Date, end: Date) {
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

export function filterTransactions(
  transactions: Transaction[],
  start: Date,
  end: Date,
  type?: TransactionType
) {
  return transactions.filter(
    (transaction) =>
      inRange(transaction.transactionDate, start, end) && (!type || transaction.type === type)
  );
}

export interface Totals {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export function sumTotals(transactions: Transaction[]): Totals {
  return transactions.reduce<Totals>(
    (accumulator, transaction) => {
      if (transaction.type === 'income') {
        accumulator.income += transaction.amount;
      } else {
        accumulator.expense += transaction.amount;
      }
      accumulator.count += 1;
      accumulator.net = accumulator.income - accumulator.expense;
      return accumulator;
    },
    { income: 0, expense: 0, net: 0, count: 0 }
  );
}

export function totalsForPeriod(transactions: Transaction[], start: Date, end: Date): Totals {
  return sumTotals(filterTransactions(transactions, start, end));
}

/** Returns null when the comparison base is zero, to avoid misleading percentages. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export interface WeeklyBucket {
  date: Date;
  total: number;
}

export function weeklyExpenseBuckets(
  transactions: Transaction[],
  weekStart: Date
): WeeklyBucket[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const total = filterTransactions(transactions, dayStart, dayEnd, 'expense').reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    return { date, total };
  });
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  percent: number;
}

export function categoryTotals(
  transactions: Transaction[],
  categories: Category[],
  start: Date,
  end: Date
): CategoryTotal[] {
  const expenses = filterTransactions(transactions, start, end, 'expense');
  const grandTotal = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);

  const grouped = new Map<string, { total: number; count: number }>();
  expenses.forEach((transaction) => {
    const entry = grouped.get(transaction.categoryId) ?? { total: 0, count: 0 };
    entry.total += transaction.amount;
    entry.count += 1;
    grouped.set(transaction.categoryId, entry);
  });

  return categories
    .filter((category) => category.type === 'expense')
    .map((category) => {
      const entry = grouped.get(category.id) ?? { total: 0, count: 0 };
      return {
        category,
        total: entry.total,
        count: entry.count,
        percent: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function activeDays(transactions: Transaction[], start: Date, end: Date): string[] {
  const days = new Set<string>();
  filterTransactions(transactions, start, end).forEach((transaction) => {
    const date = new Date(transaction.transactionDate);
    days.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  });
  return [...days];
}

export function categoryName(category: Category | undefined, locale: Locale, fallback = '—') {
  if (!category) return fallback;
  if (locale === 'en' && category.nameEn) return category.nameEn;
  return category.name;
}

export function findCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function sortByNewest(transactions: Transaction[]) {
  return [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
}
