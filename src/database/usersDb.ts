import { store } from '../store';
import {
  addUser,
  updateUser,
  deleteUser,
  updateUserRole,
  selectAllUsers,
  selectUserById,
} from '../store/slices/usersSlice';
import { UserAccount } from './schema';

export const usersDb = {
  getAll: async (): Promise<UserAccount[]> => {
    return selectAllUsers(store.getState());
  },

  getById: async (id: string): Promise<UserAccount | null> => {
    return selectUserById(id)(store.getState()) || null;
  },

  add: async (
    user: Omit<UserAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const newUser: UserAccount = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addUser(newUser));
    return id;
  },

  update: async (id: string, updates: Partial<UserAccount>): Promise<void> => {
    const existing = selectUserById(id)(store.getState());
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateUser(updated));
    }
  },

  updateRole: async (userId: string, role: string): Promise<void> => {
    store.dispatch(updateUserRole({ userId, role }));
  },

  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteUser(id));
  },
};
