import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../database/schema';

interface CategoriesState {
  items: Category[];
}

const initialState: CategoriesState = {
  items: [],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.items.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
  },
});

export const { setCategories, addCategory, updateCategory, deleteCategory } =
  categoriesSlice.actions;

export const selectAllCategories = (state: { categories: CategoriesState }) =>
  state.categories.items;

export default categoriesSlice.reducer;
