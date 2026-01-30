import { store } from '../store';
import {
  addOrder as addOrderAction,
  updateOrderStatus,
  selectAllOrders,
  selectOrdersByUserId,
} from '../store/slices/ordersSlice';
import { Order } from './schema';

export const ordersDb = {
  getAll: async (): Promise<Order[]> => {
    return selectAllOrders(store.getState());
  },

  getByUserId: async (userId: string): Promise<Order[]> => {
    return selectOrdersByUserId(userId)(store.getState());
  },

  getById: async (id: string): Promise<Order | null> => {
    return selectAllOrders(store.getState()).find(o => o.id === id) || null;
  },

  add: async (
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = `ORD-${Date.now()}`;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addOrderAction(newOrder));
    return id;
  },

  updateStatus: async (id: string, status: Order['status']): Promise<void> => {
    store.dispatch(updateOrderStatus({ id, status }));
  },
};
