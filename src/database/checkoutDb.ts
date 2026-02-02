import { store } from '../store';

/**
 * Address Interface
 */
export interface Address {
    id: string;
    userId: string;
    type: 'shipping' | 'billing' | 'both';
    isDefault: boolean;
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Payment Method Interface
 */
export interface PaymentMethod {
    id: string;
    userId: string;
    type: 'card' | 'paypal' | 'bank_transfer';
    isDefault: boolean;
    // Card details (encrypted/tokenized in production)
    cardholderName?: string;
    cardLast4?: string;
    cardBrand?: string; // 'visa', 'mastercard', 'amex', etc.
    expiryMonth?: number;
    expiryYear?: number;
    // PayPal
    paypalEmail?: string;
    // Bank transfer
    accountNumber?: string;
    bankName?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Delivery Method Interface
 */
export interface DeliveryMethod {
    id: string;
    name: string;
    description: string;
    estimatedDays: string; // e.g., "3-5 days"
    cost: number;
    active: boolean;
}

// Mock storage
let mockAddresses: Address[] = [];
let mockPaymentMethods: PaymentMethod[] = [];

/**
 * Address Database Operations
 */
export const addressesDb = {
    getAll: async (userId: string): Promise<Address[]> => {
        return mockAddresses.filter(addr => addr.userId === userId);
    },

    getById: async (id: string): Promise<Address | null> => {
        return mockAddresses.find(addr => addr.id === id) || null;
    },

    getDefault: async (userId: string, type: 'shipping' | 'billing'): Promise<Address | null> => {
        return mockAddresses.find(
            addr => addr.userId === userId && addr.isDefault && (addr.type === type || addr.type === 'both')
        ) || null;
    },

    add: async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const now = new Date().toISOString();
        const id = `ADDR-${Date.now()}`;

        // If this is set as default, unset other defaults of the same type
        if (address.isDefault) {
            mockAddresses = mockAddresses.map(addr => {
                if (addr.userId === address.userId &&
                    (addr.type === address.type || addr.type === 'both' || address.type === 'both')) {
                    return { ...addr, isDefault: false };
                }
                return addr;
            });
        }

        const newAddress: Address = {
            ...address,
            id,
            createdAt: now,
            updatedAt: now,
        };

        mockAddresses = [newAddress, ...mockAddresses];
        return id;
    },

    update: async (id: string, updates: Partial<Address>): Promise<void> => {
        const index = mockAddresses.findIndex(addr => addr.id === id);
        if (index !== -1) {
            const current = mockAddresses[index];

            // Handle default update
            if (updates.isDefault && current.userId) {
                mockAddresses = mockAddresses.map(addr => {
                    if (addr.userId === current.userId && addr.id !== id &&
                        (addr.type === current.type || addr.type === 'both' || current.type === 'both')) {
                        return { ...addr, isDefault: false };
                    }
                    return addr;
                });
            }

            mockAddresses[index] = {
                ...current,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    delete: async (id: string): Promise<void> => {
        mockAddresses = mockAddresses.filter(addr => addr.id !== id);
    },
};

/**
 * Payment Methods Database Operations
 */
export const paymentMethodsDb = {
    getAll: async (userId: string): Promise<PaymentMethod[]> => {
        return mockPaymentMethods.filter(pm => pm.userId === userId);
    },

    getById: async (id: string): Promise<PaymentMethod | null> => {
        return mockPaymentMethods.find(pm => pm.id === id) || null;
    },

    getDefault: async (userId: string): Promise<PaymentMethod | null> => {
        return mockPaymentMethods.find(pm => pm.userId === userId && pm.isDefault) || null;
    },

    add: async (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const now = new Date().toISOString();
        const id = `PM-${Date.now()}`;

        // If this is set as default, unset other defaults
        if (method.isDefault) {
            mockPaymentMethods = mockPaymentMethods.map(pm => {
                if (pm.userId === method.userId) {
                    return { ...pm, isDefault: false };
                }
                return pm;
            });
        }

        const newMethod: PaymentMethod = {
            ...method,
            id,
            createdAt: now,
            updatedAt: now,
        };

        mockPaymentMethods = [newMethod, ...mockPaymentMethods];
        return id;
    },

    update: async (id: string, updates: Partial<PaymentMethod>): Promise<void> => {
        const index = mockPaymentMethods.findIndex(pm => pm.id === id);
        if (index !== -1) {
            const current = mockPaymentMethods[index];

            // Handle default update
            if (updates.isDefault && current.userId) {
                mockPaymentMethods = mockPaymentMethods.map(pm => {
                    if (pm.userId === current.userId && pm.id !== id) {
                        return { ...pm, isDefault: false };
                    }
                    return pm;
                });
            }

            mockPaymentMethods[index] = {
                ...current,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }
    },

    delete: async (id: string): Promise<void> => {
        mockPaymentMethods = mockPaymentMethods.filter(pm => pm.id !== id);
    },
};

/**
 * Delivery Methods
 * In a real app, these would come from a database or API
 */
export const deliveryMethods: DeliveryMethod[] = [
    {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Regular shipping',
        estimatedDays: '5-7 business days',
        cost: 5.99,
        active: true,
    },
    {
        id: 'express',
        name: 'Express Delivery',
        description: 'Faster shipping',
        estimatedDays: '2-3 business days',
        cost: 12.99,
        active: true,
    },
    {
        id: 'overnight',
        name: 'Overnight Delivery',
        description: 'Next day delivery',
        estimatedDays: '1 business day',
        cost: 24.99,
        active: true,
    },
    {
        id: 'pickup',
        name: 'Store Pickup',
        description: 'Pick up at nearest store',
        estimatedDays: 'Ready in 2 hours',
        cost: 0,
        active: true,
    },
];
