import { store } from '../store';
import {
  addProduct as addProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  selectAllProducts,
  selectProductById,
} from '../store/slices/productsSlice';
import { Product } from './schema';

export const productsDb = {
  getAll: async (): Promise<Product[]> => {
    return selectAllProducts(store.getState());
  },

  getById: async (id: string): Promise<Product | null> => {
    return selectProductById(id)(store.getState()) || null;
  },

  add: async (
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addProductAction(newProduct));
    return id;
  },

  update: async (id: string, updates: Partial<Product>): Promise<void> => {
    const existing = selectProductById(id)(store.getState());
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateProductAction(updated));
    }
  },

  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteProductAction(id));
  },
};
