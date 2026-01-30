import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../database/schema';

interface OrdersState {
  items: Order[];
}

const initialState: OrdersState = {
  items: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: Order['status'] }>,
    ) => {
      const order = state.items.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
  },
});

export const { setOrders, addOrder, updateOrderStatus } = ordersSlice.actions;

export const selectAllOrders = (state: { orders: OrdersState }) =>
  state.orders.items;

export const selectOrdersByUserId =
  (userId: string) => (state: { orders: OrdersState }) =>
    state.orders.items.filter(o => o.userId === userId);

export default ordersSlice.reducer;
