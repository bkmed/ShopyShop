import { store } from '../store';
import { PromoCode } from './schema';

// We'll use a simple slice or just a mock for now if the slice doesn't exist
// Looking at the project, we might need a promosSlice. 
// For now, I'll implement the logic assuming we might add a slice or use a local state mock if needed.
// However, to keep it consistent with other DBs, let's assume a promosSlice will be created or exists.

export const promosDb = {
    // Mock data for initial implementation
    _promos: [] as PromoCode[],

    getAll: async (): Promise<PromoCode[]> => {
        return promosDb._promos;
    },

    getById: async (id: string): Promise<PromoCode | null> => {
        return promosDb._promos.find(p => p.id === id) || null;
    },

    getByCode: async (code: string): Promise<PromoCode | null> => {
        return promosDb._promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive) || null;
    },

    add: async (promo: Omit<PromoCode, 'id'>): Promise<string> => {
        const id = `PROMO-${Date.now()}`;
        const newPromo = { ...promo, id };
        promosDb._promos.push(newPromo);
        return id;
    },

    update: async (id: string, updates: Partial<PromoCode>): Promise<void> => {
        const index = promosDb._promos.findIndex(p => p.id === id);
        if (index !== -1) {
            promosDb._promos[index] = { ...promosDb._promos[index], ...updates };
        }
    },

    delete: async (id: string): Promise<void> => {
        promosDb._promos = promosDb._promos.filter(p => p.id !== id);
    },

    validatePromo: async (code: string, categoryId: string): Promise<number> => {
        const promo = await promosDb.getByCode(code);
        if (!promo) return 0;

        // Check expiry
        if (new Date(promo.expiryDate) < new Date()) return 0;

        // Check category restriction (if categoryId matches or promo is global)
        if (promo.categoryId === 'all' || promo.categoryId === categoryId) {
            return promo.percentage;
        }

        return 0;
    }
};
