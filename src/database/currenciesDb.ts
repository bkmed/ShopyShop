import { store } from '../store';
import {
  setCurrencies,
  addCurrency as addCurrencyAction,
  updateCurrency as updateCurrencyAction,
  deleteCurrency as deleteCurrencyAction,
  setSelectedCurrency as setSelectedAction,
  selectAllCurrencies,
} from '../store/slices/currenciesSlice';
import { Currency } from './schema';

const DEFAULT_CURRENCIES: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { code: 'EUR', symbol: '€', rate: 0.92, isBase: false, isActive: true },
  { code: 'USD', symbol: '$', rate: 1, isBase: true, isActive: true },
  { code: 'GBP', symbol: '£', rate: 0.79, isBase: false, isActive: true },
  { code: 'TND', symbol: 'DT', rate: 3.12, isBase: false, isActive: true },
];

export const currenciesDb = {
  // Initialize with default currencies if empty
  init: async () => {
    const existing = selectAllCurrencies(store.getState());
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const initial = DEFAULT_CURRENCIES.map((desc, index) => ({
        id: (index + 1).toString(),
        ...desc,
        createdAt: now,
        updatedAt: now,
      }));
      store.dispatch(setCurrencies(initial));
    }
  },

  getAll: async (): Promise<Currency[]> => {
    return selectAllCurrencies(store.getState());
  },

  setSelected: async (code: string): Promise<void> => {
    store.dispatch(setSelectedAction(code));
  },

  add: async (currency: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const newCurrency: Currency = {
      id,
      ...currency,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addCurrencyAction(newCurrency));
    return id;
  },

  update: async (id: string, updates: Partial<Currency>): Promise<void> => {
    const existing = selectAllCurrencies(store.getState()).find(
      c => c.id === id,
    );
    if (existing) {
      store.dispatch(
        updateCurrencyAction({
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        }),
      );
    }
  },

  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteCurrencyAction(id));
  },
};
