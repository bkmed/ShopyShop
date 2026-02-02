import { Purchase, OrderStatus, PaymentStatus, OrderItem } from './schema';

// Mock storage
let mockPurchases: Purchase[] = [];

export const purchasesDb = {
    getAll: async (): Promise<Purchase[]> => {
        return mockPurchases.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    getById: async (id: string): Promise<Purchase | null> => {
        return mockPurchases.find(p => p.id === id) || null;
    },

    getByUserId: async (userId: string): Promise<Purchase[]> => {
        return mockPurchases
            .filter(p => p.userId === userId)
            .sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    },

    getByOrderId: async (orderId: string): Promise<Purchase | null> => {
        return mockPurchases.find(p => p.orderId === orderId) || null;
    },

    getByStatus: async (status: OrderStatus): Promise<Purchase[]> => {
        return mockPurchases
            .filter(p => p.status === status)
            .sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    },

    getByPaymentStatus: async (paymentStatus: PaymentStatus): Promise<Purchase[]> => {
        return mockPurchases
            .filter(p => p.paymentStatus === paymentStatus)
            .sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    },

    add: async (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const now = new Date().toISOString();
        const id = `PUR-${Date.now()}`;

        const newPurchase: Purchase = {
            ...purchase,
            id,
            createdAt: now,
            updatedAt: now,
        };

        mockPurchases = [newPurchase, ...mockPurchases];
        return id;
    },

    update: async (id: string, updates: Partial<Purchase>): Promise<void> => {
        const index = mockPurchases.findIndex(p => p.id === id);
        if (index !== -1) {
            mockPurchases[index] = {
                ...mockPurchases[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    delete: async (id: string): Promise<void> => {
        mockPurchases = mockPurchases.filter(p => p.id !== id);
    },

    search: async (query: string): Promise<Purchase[]> => {
        const lowerQuery = query.toLowerCase();
        return mockPurchases.filter(
            p =>
                p.userName.toLowerCase().includes(lowerQuery) ||
                p.orderId.toLowerCase().includes(lowerQuery) ||
                p.trackingNumber?.toLowerCase().includes(lowerQuery)
        );
    },

    // Statistics for admin dashboard
    getStats: async (): Promise<{
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        totalRevenue: number;
    }> => {
        const total = mockPurchases.length;
        const pending = mockPurchases.filter(p => p.status === 'pending').length;
        const processing = mockPurchases.filter(p => p.status === 'processing').length;
        const shipped = mockPurchases.filter(p => p.status === 'shipped').length;
        const delivered = mockPurchases.filter(p => p.status === 'delivered').length;
        const cancelled = mockPurchases.filter(p => p.status === 'cancelled').length;
        const totalRevenue = mockPurchases
            .filter(p => p.paymentStatus === 'paid')
            .reduce((sum, p) => sum + p.totalAmount, 0);

        return {
            total,
            pending,
            processing,
            shipped,
            delivered,
            cancelled,
            totalRevenue,
        };
    },
};
