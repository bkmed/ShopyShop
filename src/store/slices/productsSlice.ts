import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../database/schema';

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setLoading,
  setError,
} = productsSlice.actions;

export const selectAllProducts = (state: { products: ProductsState }) =>
  state.products.items;

export const selectProductById =
  (id: string) => (state: { products: ProductsState }) =>
    state.products.items.find(p => p.id === id);

export default productsSlice.reducer;
