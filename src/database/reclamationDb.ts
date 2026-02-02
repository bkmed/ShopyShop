import { store } from '../store';
import {
  addReclamation as addReclamationAction,
  updateReclamationStatus,
  selectAllReclamations,
  selectReclamationsByUserId,
} from '../store/slices/reclamationsSlice';
import { Reclamation } from './schema';

export const reclamationDb = {
  getAll: async (): Promise<Reclamation[]> => {
    return selectAllReclamations(store.getState());
  },

  getByUserId: async (userId: string): Promise<Reclamation[]> => {
    return selectReclamationsByUserId(userId)(store.getState());
  },

  getById: async (id: string): Promise<Reclamation | null> => {
    return (
      selectAllReclamations(store.getState()).find(r => r.id === id) || null
    );
  },

  add: async (
    reclamation: Omit<Reclamation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = `REC-${Date.now()}`;
    const newReclamation: Reclamation = {
      ...reclamation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addReclamationAction(newReclamation));
    return id;
  },

  updateStatus: async (
    id: string,
    status: Reclamation['status'],
  ): Promise<void> => {
    store.dispatch(updateReclamationStatus({ id, status }));
  },
};
