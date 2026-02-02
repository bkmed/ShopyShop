import { StockReception, StockReceptionStatus, StockReceptionItem } from './schema';
import { productsDb } from './productsDb';
import { inventoryDb } from './inventoryDb';

// Mock storage
let mockStockReceptions: StockReception[] = [];

export const stockReceptionDb = {
    getAll: async (): Promise<StockReception[]> => {
        return mockStockReceptions.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    getById: async (id: string): Promise<StockReception | null> => {
        return mockStockReceptions.find(sr => sr.id === id) || null;
    },

    getBySupplier: async (supplierId: string): Promise<StockReception[]> => {
        return mockStockReceptions
            .filter(sr => sr.supplierId === supplierId)
            .sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    },

    getByStatus: async (status: StockReceptionStatus): Promise<StockReception[]> => {
        return mockStockReceptions
            .filter(sr => sr.status === status)
            .sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    },

    getPending: async (): Promise<StockReception[]> => {
        return mockStockReceptions
            .filter(sr => sr.status === 'pending' || sr.status === 'in_progress')
            .sort((a, b) =>
                new Date(a.expectedDate || a.createdAt).getTime() -
                new Date(b.expectedDate || b.createdAt).getTime()
            );
    },

    add: async (
        reception: Omit<StockReception, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> => {
        const now = new Date().toISOString();
        const id = `SR-${Date.now()}`;

        const newReception: StockReception = {
            ...reception,
            id,
            createdAt: now,
            updatedAt: now,
        };

        mockStockReceptions = [newReception, ...mockStockReceptions];
        return id;
    },

    update: async (id: string, updates: Partial<StockReception>): Promise<void> => {
        const index = mockStockReceptions.findIndex(sr => sr.id === id);
        if (index !== -1) {
            mockStockReceptions[index] = {
                ...mockStockReceptions[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    delete: async (id: string): Promise<void> => {
        mockStockReceptions = mockStockReceptions.filter(sr => sr.id !== id);
    },

    // Complete reception and update inventory
    completeReception: async (
        id: string,
        receivedBy: string
    ): Promise<void> => {
        const reception = await stockReceptionDb.getById(id);
        if (!reception) throw new Error('Reception not found');
        if (reception.status === 'completed') {
            throw new Error('Reception already completed');
        }

        // Update inventory for each item
        for (const item of reception.items) {
            await inventoryDb.adjustStock(
                item.productId,
                item.receivedQuantity,
                `Stock reception ${id} from ${reception.supplierName}`,
                receivedBy
            );
        }

        // Update reception status
        await stockReceptionDb.update(id, {
            status: 'completed',
            receivedBy,
            receivedDate: new Date().toISOString(),
        });
    },

    updateItemQuantity: async (
        id: string,
        productId: string,
        receivedQuantity: number
    ): Promise<void> => {
        const index = mockStockReceptions.findIndex(sr => sr.id === id);
        if (index !== -1) {
            const reception = mockStockReceptions[index];
            const updatedItems = reception.items.map(item => {
                if (item.productId === productId) {
                    return { ...item, receivedQuantity };
                }
                return item;
            });

            mockStockReceptions[index] = {
                ...reception,
                items: updatedItems,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    search: async (query: string): Promise<StockReception[]> => {
        const lowerQuery = query.toLowerCase();
        return mockStockReceptions.filter(
            sr =>
                sr.supplierName.toLowerCase().includes(lowerQuery) ||
                sr.referenceNumber?.toLowerCase().includes(lowerQuery)
        );
    },
};
