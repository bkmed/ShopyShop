import { ordersDb } from '../database/ordersDb';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number; // Placeholder
  weeklySales: { day: string; amount: number }[];
}

export const analyticsService = {
  // Get overall sales analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const allOrders = await ordersDb.getAll();

      const totalRevenue = allOrders.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);

      const totalOrders = allOrders.length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate weekly sales distribution (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dateStr: d.toISOString().split('T')[0],
        };
      });

      const weeklySales = last7Days.map(day => {
        const dayOrders = allOrders.filter(
          o => o.createdAt && o.createdAt.startsWith(day.dateStr),
        );
        const amount = dayOrders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0,
        );
        return { day: day.label, amount };
      });

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        conversionRate: 3.5, // Placeholder metric
        weeklySales,
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        weeklySales: [],
      };
    }
  },

  // Get sales chart data
  getSalesChartData: async (): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const data = await analyticsService.getAnalytics();
    return {
      labels: data.weeklySales.map(s => s.day),
      data: data.weeklySales.map(s => s.amount),
    };
  },

  // Get personal shopping analytics for a specific user
  getPersonalAnalytics: async (userId: string): Promise<any> => {
    try {
      const userOrders = await ordersDb.getByUserId(userId);
      const totalSpent = userOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );

      return {
        totalOrders: userOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        lastOrder: userOrders[0]?.createdAt || 'N/A',
      };
    } catch (error) {
      console.error('Error getting personal analytics:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: 'N/A',
      };
    }
  },
};
