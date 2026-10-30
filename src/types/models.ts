export type Locale = 'id' | 'en';
export type Currency = 'IDR' | 'USD';
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  /** Display name for Indonesian (also used as the stored fallback). */
  name: string;
  /** Optional English label for built-in categories. */
  nameEn?: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  note?: string;
  /** ISO date string of the transaction. */
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  language: Locale;
  currency: Currency;
  spendingAlertEnabled: boolean;
  aiInsightEnabled: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
}

export type InsightSeverity = 'positive' | 'warning' | 'info';
export type InsightType =
  | 'spending_change_up'
  | 'spending_change_down'
  | 'top_category'
  | 'category_anomaly'
  | 'recording_streak'
  | 'insufficient_data';

export interface InsightMetric {
  label: string;
  value: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  suggestion: string;
  periodStart: string;
  periodEnd: string;
  comparisonStart?: string;
  comparisonEnd?: string;
  metrics: InsightMetric[];
  createdAt: string;
}

export interface LinkedAccount {
  id: string;
  provider: string;
  description: string;
}

/** Everything that is persisted locally through the storage repository. */
export interface PersistedState {
  profile: UserProfile | null;
  transactions: Transaction[];
  customCategories: Category[];
  settings: UserSettings;
  onboardingCompleted: boolean;
  sessionActive: boolean;
  readInsightIds: string[];
  dismissedInsightIds: string[];
}
