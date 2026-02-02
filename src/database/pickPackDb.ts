import { PickPackOrder, PickPackStatus, PickPackItem } from './schema';
import { ordersDb } from './ordersDb';

// Mock storage
let mockPickPackOrders: PickPackOrder[] = [];

export const pickPackDb = {
    getAll: async (): Promise<PickPackOrder[]> => {
        return mockPickPackOrders.sort((a, b) => {
            // Sort by priority first, then by creation date
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
    },

    getById: async (id: string): Promise<PickPackOrder | null> => {
        return mockPickPackOrders.find(pp => pp.id === id) || null;
    },

    getByOrderId: async (orderId: string): Promise<PickPackOrder | null> => {
        return mockPickPackOrders.find(pp => pp.orderId === orderId) || null;
    },

    getByStatus: async (status: PickPackStatus): Promise<PickPackOrder[]> => {
        return mockPickPackOrders
            .filter(pp => pp.status === status)
            .sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
    },

    getByAssignee: async (userId: string): Promise<PickPackOrder[]> => {
        return mockPickPackOrders
            .filter(pp => pp.assignedTo === userId)
            .sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
    },

    getPendingOrders: async (): Promise<PickPackOrder[]> => {
        return mockPickPackOrders
            .filter(pp => pp.status === 'pending' || pp.status === 'picking')
            .sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
    },

    add: async (
        order: Omit<PickPackOrder, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> => {
        const now = new Date().toISOString();
        const id = `PP-${Date.now()}`;

        const newOrder: PickPackOrder = {
            ...order,
            id,
            createdAt: now,
            updatedAt: now,
        };

        mockPickPackOrders = [newOrder, ...mockPickPackOrders];
        return id;
    },

    update: async (id: string, updates: Partial<PickPackOrder>): Promise<void> => {
        const index = mockPickPackOrders.findIndex(pp => pp.id === id);
        if (index !== -1) {
            mockPickPackOrders[index] = {
                ...mockPickPackOrders[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    delete: async (id: string): Promise<void> => {
        mockPickPackOrders = mockPickPackOrders.filter(pp => pp.id !== id);
    },

    // Mark item as picked
    markItemPicked: async (id: string, productId: string): Promise<void> => {
        const index = mockPickPackOrders.findIndex(pp => pp.id === id);
        if (index !== -1) {
            const order = mockPickPackOrders[index];
            const updatedItems = order.items.map(item => {
                if (item.productId === productId) {
                    return { ...item, picked: true };
                }
                return item;
            });

            // Check if all items are picked
            const allPicked = updatedItems.every(item => item.picked);

            mockPickPackOrders[index] = {
                ...order,
                items: updatedItems,
                status: allPicked ? 'packing' : order.status,
                pickedAt: allPicked && !order.pickedAt ? new Date().toISOString() : order.pickedAt,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    // Mark item as packed
    markItemPacked: async (id: string, productId: string): Promise<void> => {
        const index = mockPickPackOrders.findIndex(pp => pp.id === id);
        if (index !== -1) {
            const order = mockPickPackOrders[index];
            const updatedItems = order.items.map(item => {
                if (item.productId === productId) {
                    return { ...item, packed: true };
                }
                return item;
            });

            // Check if all items are packed
            const allPacked = updatedItems.every(item => item.packed);

            mockPickPackOrders[index] = {
                ...order,
                items: updatedItems,
                status: allPacked ? 'ready_to_ship' : order.status,
                packedAt: allPacked && !order.packedAt ? new Date().toISOString() : order.packedAt,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    // Mark as shipped
    markAsShipped: async (id: string, trackingNumber?: string): Promise<void> => {
        const order = await pickPackDb.getById(id);
        if (!order) throw new Error('Pick/Pack order not found');
        if (order.status !== 'ready_to_ship') {
            throw new Error('Order must be ready to ship');
        }

        // Update the pick/pack order
        await pickPackDb.update(id, {
            status: 'shipped',
            shippedAt: new Date().toISOString(),
        });

        // Update the corresponding order in ordersDb
        await ordersDb.update(order.orderId, {
            status: 'shipped',
            trackingNumber: trackingNumber || undefined,
        });
    },

    // Assign order to warehouse worker
    assignOrder: async (id: string, userId: string): Promise<void> => {
        await pickPackDb.update(id, {
            assignedTo: userId,
            status: 'picking',
        });
    },

    search: async (query: string): Promise<PickPackOrder[]> => {
        const lowerQuery = query.toLowerCase();
        return mockPickPackOrders.filter(
            pp =>
                pp.orderNumber.toLowerCase().includes(lowerQuery) ||
                pp.customerName.toLowerCase().includes(lowerQuery)
        );
    },
};
