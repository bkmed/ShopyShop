import { store } from '../store';
import {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  selectWishlistItems,
} from '../store/slices/wishlistSlice';
import { productsDb } from './productsDb';
import { Product } from './schema';

export const wishlistDb = {
  getAll: async (): Promise<Product[]> => {
    const productIds = selectWishlistItems(store.getState());
    const allProducts = await productsDb.getAll();
    return allProducts.filter(p => productIds.includes(p.id));
  },

  add: async (productId: string): Promise<void> => {
    store.dispatch(addToWishlist(productId));
  },

  remove: async (productId: string): Promise<void> => {
    store.dispatch(removeFromWishlist(productId));
  },

  clear: async (): Promise<void> => {
    store.dispatch(clearWishlist());
  },

  isWishlisted: (productId: string): boolean => {
    const productIds = selectWishlistItems(store.getState());
    return productIds.includes(productId);
  },
};
