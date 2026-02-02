import { productsDb } from './productsDb';
import { InventoryLog } from './schema';
import { stockAlertService } from '../services/stockAlertService';

// We'll use a local mock for log storage since it's not in Redux yet, or we could add a slice.
// For now, let's just use productsDb for stock changes and mock the logs.

let mockLogs: InventoryLog[] = [];

export const inventoryDb = {
  getLogs: async (productId?: string): Promise<InventoryLog[]> => {
    if (productId) {
      return mockLogs.filter(l => l.productId === productId);
    }
    return mockLogs;
  },

  adjustStock: async (
    productId: string,
    change: number,
    reason: string,
    performedBy: string,
  ): Promise<void> => {
    const product = await productsDb.getById(productId);
    if (!product) throw new Error('Product not found');

    const newQuantity = product.stockQuantity + change;
    if (newQuantity < 0) throw new Error('Insufficient stock');

    await productsDb.update(productId, { stockQuantity: newQuantity });

    const newLog: InventoryLog = {
      id: `LOG-${Date.now()}`,
      productId,
      productName: product.name,
      change,
      reason,
      performedBy,
      createdAt: new Date().toISOString(),
    };
    mockLogs = [newLog, ...mockLogs];

    // Trigger stock alert check after inventory change
    await stockAlertService.monitorStockChange(productId);
  },
};
