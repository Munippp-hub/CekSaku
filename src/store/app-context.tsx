import * as SplashScreen from 'expo-splash-screen';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Shadows, Spacing, Typography } from '@/constants/design';
import { DEFAULT_CATEGORIES } from '@/data/defaults';
import { pinService } from '@/services/secure';
import { storageRepository } from '@/services/storage';
import type {
  Category,
  Currency,
  Locale,
  PersistedState,
  Transaction,
  TransactionType,
  UserProfile,
  UserSettings,
} from '@/types/models';

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  note?: string;
  transactionDate: string;
}

interface AppState extends PersistedState {
  hydrated: boolean;
  unlocked: boolean;
}

const defaultSettings: UserSettings = {
  language: 'id',
  currency: 'IDR',
  spendingAlertEnabled: true,
  aiInsightEnabled: true,
  biometricEnabled: false,
  pinEnabled: false,
};

const initialState: AppState = {
  hydrated: false,
  unlocked: false,
  profile: null,
  transactions: [],
  customCategories: [],
  settings: defaultSettings,
  onboardingCompleted: false,
  sessionActive: false,
  readInsightIds: [],
  dismissedInsightIds: [],
};

type Action =
  | { type: 'hydrate'; payload: PersistedState; unlocked: boolean }
  | { type: 'onboarding-complete'; profile: UserProfile; settings: UserSettings }
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'update-profile'; profile: UserProfile }
  | { type: 'add-transaction'; transaction: Transaction }
  | { type: 'update-transaction'; transaction: Transaction }
  | { type: 'delete-transaction'; id: string }
  | { type: 'add-category'; category: Category }
  | { type: 'delete-category'; id: string }
  | { type: 'update-settings'; settings: Partial<UserSettings> }
  | { type: 'mark-read'; ids: string[] }
  | { type: 'dismiss-insight'; id: string }
  | { type: 'unlock' }
  | { type: 'lock' }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        ...action.payload,
        hydrated: true,
        unlocked: action.unlocked,
      };
    case 'onboarding-complete':
      return {
        ...state,
        profile: action.profile,
        settings: action.settings,
        onboardingCompleted: true,
        sessionActive: true,
      };
    case 'login':
      return { ...state, sessionActive: true };
    case 'logout':
      return { ...state, sessionActive: false, unlocked: false };
    case 'update-profile':
      return { ...state, profile: action.profile };
    case 'add-transaction':
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case 'update-transaction':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.transaction.id ? action.transaction : transaction
        ),
      };
    case 'delete-transaction':
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.id),
      };
    case 'add-category':
      return { ...state, customCategories: [...state.customCategories, action.category] };
    case 'delete-category':
      return {
        ...state,
        customCategories: state.customCategories.filter((category) => category.id !== action.id),
      };
    case 'update-settings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'mark-read':
      return {
        ...state,
        readInsightIds: Array.from(new Set([...state.readInsightIds, ...action.ids])),
      };
    case 'dismiss-insight':
      return { ...state, dismissedInsightIds: Array.from(new Set([...state.dismissedInsightIds, action.id])) };
    case 'unlock':
      return { ...state, unlocked: true };
    case 'lock':
      return { ...state, unlocked: false };
    case 'reset':
      return {
        ...initialState,
        hydrated: true,
        settings: defaultSettings,
      };
    default:
      return state;
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AppContextValue extends AppState {
  categories: Category[];
  completeOnboarding: (input: {
    name: string;
    email?: string;
    avatarColor: string;
    language: Locale;
    currency: Currency;
  }) => Promise<void>;
  login: () => void;
  logout: () => void;
  updateProfile: (input: { name: string; email?: string; avatarColor: string }) => void;
  addTransaction: (input: TransactionInput) => Transaction;
  updateTransaction: (id: string, input: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (input: { name: string; color: string }) => Category;
  deleteCategory: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  markInsightsRead: (ids: string[]) => void;
  dismissInsight: (id: string) => void;
  unlock: () => void;
  lock: () => void;
  setPin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  resetApp: () => Promise<void>;
  notify: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const [persisted, hasPin] = await Promise.all([
        storageRepository.load(),
        pinService.hasPin(),
      ]);
      if (cancelled) return;

      const base: PersistedState = persisted ?? {
        profile: null,
        transactions: [],
        customCategories: [],
        settings: defaultSettings,
        onboardingCompleted: false,
        sessionActive: false,
        readInsightIds: [],
        dismissedInsightIds: [],
      };

      const settings: UserSettings = {
        ...defaultSettings,
        ...base.settings,
        pinEnabled: Boolean(base.settings.pinEnabled && hasPin),
        biometricEnabled: Boolean(base.settings.biometricEnabled && hasPin),
      };

      dispatch({
        type: 'hydrate',
        payload: { ...base, settings },
        unlocked: !settings.pinEnabled,
      });
      await SplashScreen.hideAsync().catch(() => undefined);
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistable = useMemo<PersistedState>(
    () => ({
      profile: state.profile,
      transactions: state.transactions,
      customCategories: state.customCategories,
      settings: state.settings,
      onboardingCompleted: state.onboardingCompleted,
      sessionActive: state.sessionActive,
      readInsightIds: state.readInsightIds,
      dismissedInsightIds: state.dismissedInsightIds,
    }),
    [state]
  );

  useEffect(() => {
    if (!state.hydrated) return;
    storageRepository.save(persistable);
  }, [state.hydrated, persistable]);

  const notify = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const categories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...state.customCategories],
    [state.customCategories]
  );

  const completeOnboarding = useCallback<AppContextValue['completeOnboarding']>(
    async (input) => {
      const now = new Date().toISOString();
      const profile: UserProfile = {
        id: createId('user'),
        name: input.name.trim(),
        email: input.email?.trim() || undefined,
        avatarColor: input.avatarColor,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({
        type: 'onboarding-complete',
        profile,
        settings: {
          ...defaultSettings,
          language: input.language,
          currency: input.currency,
        },
      });
    },
    []
  );

  const login = useCallback(() => dispatch({ type: 'login' }), []);
  const logout = useCallback(() => dispatch({ type: 'logout' }), []);

  const updateProfile = useCallback<AppContextValue['updateProfile']>((input) => {
    if (!state.profile) return;
    dispatch({
      type: 'update-profile',
      profile: {
        ...state.profile,
        name: input.name.trim(),
        email: input.email?.trim() || undefined,
        avatarColor: input.avatarColor,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [state.profile]);

  const addTransaction = useCallback<AppContextValue['addTransaction']>(
    (input) => {
      const now = new Date().toISOString();
      const transaction: Transaction = {
        id: createId('trx'),
        userId: state.profile?.id ?? 'local-user',
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId,
        description: input.description.trim(),
        note: input.note?.trim() || undefined,
        transactionDate: input.transactionDate,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'add-transaction', transaction });
      return transaction;
    },
    [state.profile?.id]
  );

  const updateTransaction = useCallback<AppContextValue['updateTransaction']>((id, input) => {
    const existing = state.transactions.find((transaction) => transaction.id === id);
    if (!existing) return;
    dispatch({
      type: 'update-transaction',
      transaction: {
        ...existing,
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId,
        description: input.description.trim(),
        note: input.note?.trim() || undefined,
        transactionDate: input.transactionDate,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [state.transactions]);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'delete-transaction', id });
  }, []);

  const addCategory = useCallback<AppContextValue['addCategory']>((input) => {
    const category: Category = {
      id: createId('cat'),
      name: input.name.trim(),
      type: 'expense',
      icon: 'pricetag-outline',
      color: input.color,
      isDefault: false,
    };
    dispatch({ type: 'add-category', category });
    return category;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'delete-category', id });
  }, []);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    dispatch({ type: 'update-settings', settings });
  }, []);

  const markInsightsRead = useCallback((ids: string[]) => {
    dispatch({ type: 'mark-read', ids });
  }, []);

  const dismissInsight = useCallback((id: string) => {
    dispatch({ type: 'dismiss-insight', id });
  }, []);

  const unlock = useCallback(() => dispatch({ type: 'unlock' }), []);
  const lock = useCallback(() => dispatch({ type: 'lock' }), []);

  const setPin = useCallback(async (pin: string) => {
    await pinService.savePin(pin);
    dispatch({ type: 'update-settings', settings: { pinEnabled: true } });
  }, []);

  const disablePin = useCallback(async () => {
    await pinService.clearPin();
    dispatch({
      type: 'update-settings',
      settings: { pinEnabled: false, biometricEnabled: false },
    });
  }, []);

  const resetApp = useCallback(async () => {
    await pinService.clearPin();
    await storageRepository.clear();
    dispatch({ type: 'reset' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      categories,
      completeOnboarding,
      login,
      logout,
      updateProfile,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      updateSettings,
      markInsightsRead,
      dismissInsight,
      unlock,
      lock,
      setPin,
      disablePin,
      resetApp,
      notify,
    }),
    [
      state,
      categories,
      completeOnboarding,
      login,
      logout,
      updateProfile,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      updateSettings,
      markInsightsRead,
      dismissInsight,
      unlock,
      lock,
      setPin,
      disablePin,
      resetApp,
      notify,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      ) : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 96,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  toast: {
    backgroundColor: Palette.textPrimary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    maxWidth: 420,
    ...Shadows.floating,
  },
  toastText: {
    color: Palette.white,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
});
