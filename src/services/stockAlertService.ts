import { productsDb } from '../database/productsDb';
import { notificationService } from './notificationService';
import { usersDb } from '../database/usersDb';

/**
 * Stock Alert Service
 * Monitors product stock levels and sends alerts to stock managers
 * when products reach critical levels (0 or low stock)
 */

class StockAlertService {
  private readonly LOW_STOCK_THRESHOLD = 10;
  private alertedProducts: Set<string> = new Set();

  /**
   * Check stock levels for a specific product
   * @param productId Product to check
   */
  async checkProductStock(productId: string): Promise<void> {
    try {
      const product = await productsDb.getById(productId);

      if (!product) {
        console.warn(`Product ${productId} not found`);
        return;
      }

      const stockQuantity = product.stockQuantity || 0;

      // Check for zero stock
      if (stockQuantity === 0) {
        await this.sendZeroStockAlert(product.id, product.name);
      }
      // Check for low stock
      else if (stockQuantity <= this.LOW_STOCK_THRESHOLD && stockQuantity > 0) {
        await this.sendLowStockAlert(product.id, product.name, stockQuantity);
      }
      // Stock is back to normal, remove from alerted set
      else if (stockQuantity > this.LOW_STOCK_THRESHOLD) {
        this.alertedProducts.delete(productId);
      }
    } catch (error) {
      console.error('Error checking product stock:', error);
    }
  }

  /**
   * Check all products for stock issues
   */
  async checkAllProducts(): Promise<void> {
    try {
      const products = await productsDb.getAll();

      for (const product of products) {
        await this.checkProductStock(product.id);
      }
    } catch (error) {
      console.error('Error checking all products stock:', error);
    }
  }

  /**
   * Send zero stock alert to stock managers
   */
  private async sendZeroStockAlert(
    productId: string,
    productName: string,
  ): Promise<void> {
    // Only send alert once until stock is replenished
    const alertKey = `zero_${productId}`;
    if (this.alertedProducts.has(alertKey)) {
      return;
    }

    try {
      // Get all stock managers
      const users = await usersDb.getAll();
      const stockManagers = users.filter(
        user => user.role === 'gestionnaire_de_stock' || user.role === 'admin',
      );

      // Send notification to each stock manager
      for (const manager of stockManagers) {
        await notificationService.broadcastNotification({
          title: `🚨 Stock Alert: ${productName}`,
          body: `Product "${productName}" is OUT OF STOCK! Immediate attention required.`,
          targetType: 'user',
          targetId: manager.id,
          senderId: 'system',
        });
      }

      this.alertedProducts.add(alertKey);
      console.log(`Zero stock alert sent for product: ${productName}`);
    } catch (error) {
      console.error('Error sending zero stock alert:', error);
    }
  }

  /**
   * Send low stock alert to stock managers
   */
  private async sendLowStockAlert(
    productId: string,
    productName: string,
    currentStock: number,
  ): Promise<void> {
    const alertKey = `low_${productId}`;
    if (this.alertedProducts.has(alertKey)) {
      return;
    }

    try {
      const users = await usersDb.getAll();
      const stockManagers = users.filter(
        user => user.role === 'gestionnaire_de_stock' || user.role === 'admin',
      );

      for (const manager of stockManagers) {
        await notificationService.broadcastNotification({
          title: `⚠️ Low Stock Warning: ${productName}`,
          body: `Product "${productName}" has only ${currentStock} units remaining. Consider restocking.`,
          targetType: 'user',
          targetId: manager.id,
          senderId: 'system',
        });
      }

      this.alertedProducts.add(alertKey);
      console.log(
        `Low stock alert sent for product: ${productName} (${currentStock} units)`,
      );
    } catch (error) {
      console.error('Error sending low stock alert:', error);
    }
  }

  /**
   * Monitor stock changes in real-time
   * Call this method whenever inventory is updated
   */
  async monitorStockChange(productId: string): Promise<void> {
    await this.checkProductStock(productId);
  }

  /**
   * Clear alert history for a product (useful after restocking)
   */
  clearProductAlerts(productId: string): void {
    this.alertedProducts.delete(`zero_${productId}`);
    this.alertedProducts.delete(`low_${productId}`);
  }

  /**
   * Initialize monitoring - check all products on startup
   */
  async initialize(): Promise<void> {
    console.log('Initializing stock alert service...');
    await this.checkAllProducts();
  }
}

export const stockAlertService = new StockAlertService();
