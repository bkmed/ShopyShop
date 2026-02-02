import { Reclamation } from './schema';

// Mock DB for Reclamations
export const reclamationsDb = {
  _reclamations: [] as Reclamation[],

  getAll: async (): Promise<Reclamation[]> => {
    return reclamationsDb._reclamations;
  },

  getByUserId: async (userId: string): Promise<Reclamation[]> => {
    return reclamationsDb._reclamations.filter(r => r.userId === userId);
  },

  getById: async (id: string): Promise<Reclamation | null> => {
    return reclamationsDb._reclamations.find(r => r.id === id) || null;
  },

  add: async (
    reclamation: Omit<Reclamation, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const id = `REC-${Date.now()}`;
    const now = new Date().toISOString();
    const newRec = {
      ...reclamation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    reclamationsDb._reclamations.push(newRec);
    return id;
  },

  updateStatus: async (
    id: string,
    status: Reclamation['status'],
  ): Promise<void> => {
    const index = reclamationsDb._reclamations.findIndex(r => r.id === id);
    if (index !== -1) {
      reclamationsDb._reclamations[index] = {
        ...reclamationsDb._reclamations[index],
        status,
        updatedAt: new Date().toISOString(),
      };
    }
  },
};
