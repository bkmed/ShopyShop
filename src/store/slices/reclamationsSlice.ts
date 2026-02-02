import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reclamation } from '../../database/schema';

interface ReclamationsState {
  items: Reclamation[];
}

const initialState: ReclamationsState = {
  items: [],
};

const reclamationsSlice = createSlice({
  name: 'reclamations',
  initialState,
  reducers: {
    setReclamations: (state, action: PayloadAction<Reclamation[]>) => {
      state.items = action.payload;
    },
    addReclamation: (state, action: PayloadAction<Reclamation>) => {
      state.items.unshift(action.payload);
    },
    updateReclamationStatus: (
      state,
      action: PayloadAction<{ id: string; status: Reclamation['status'] }>,
    ) => {
      const reclamation = state.items.find(r => r.id === action.payload.id);
      if (reclamation) {
        reclamation.status = action.payload.status;
        reclamation.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const { setReclamations, addReclamation, updateReclamationStatus } =
  reclamationsSlice.actions;

export const selectAllReclamations = (state: {
  reclamations: ReclamationsState;
}) => state.reclamations.items;

export const selectReclamationsByUserId =
  (userId: string) => (state: { reclamations: ReclamationsState }) =>
    state.reclamations.items.filter(r => r.userId === userId);

export default reclamationsSlice.reducer;
