import { store } from '../store';
import {
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
  selectAllCategories,
} from '../store/slices/categoriesSlice';
import { Category } from './schema';

export const categoriesDb = {
  getAll: async (): Promise<Category[]> => {
    return selectAllCategories(store.getState());
  },

  getById: async (id: string): Promise<Category | null> => {
    return selectAllCategories(store.getState()).find(c => c.id === id) || null;
  },

  add: async (
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const newCategory: Category = {
      ...category,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addCategoryAction(newCategory));
    return id;
  },

  update: async (id: string, updates: Partial<Category>): Promise<void> => {
    const existing = selectAllCategories(store.getState()).find(
      c => c.id === id,
    );
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateCategoryAction(updated));
    }
  },

  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteCategoryAction(id));
  },
};
