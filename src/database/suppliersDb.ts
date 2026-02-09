import { Supplier, SupplierProduct } from './schema';

// Mock storage
let mockSuppliers: Supplier[] = [];
let mockSupplierProducts: SupplierProduct[] = [];

// ========== Suppliers ==========
export const suppliersDb = {
  getAll: async (): Promise<Supplier[]> => {
    return mockSuppliers.filter(s => s.isActive);
  },

  getAllIncludingInactive: async (): Promise<Supplier[]> => {
    return mockSuppliers;
  },

  getById: async (id: string): Promise<Supplier | null> => {
    return mockSuppliers.find(s => s.id === id) || null;
  },

  add: async (
    supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = `SUP-${Date.now()}`;

    const newSupplier: Supplier = {
      ...supplier,
      id,
      createdAt: now,
      updatedAt: now,
    };

    mockSuppliers = [newSupplier, ...mockSuppliers];
    return id;
  },

  update: async (id: string, updates: Partial<Supplier>): Promise<void> => {
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSuppliers[index] = {
        ...mockSuppliers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  delete: async (id: string): Promise<void> => {
    // Soft delete by setting isActive to false
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSuppliers[index].isActive = false;
      mockSuppliers[index].updatedAt = new Date().toISOString();
    }
  },

  search: async (query: string): Promise<Supplier[]> => {
    const lowerQuery = query.toLowerCase();
    return mockSuppliers.filter(
      s =>
        s.isActive &&
        (s.name.toLowerCase().includes(lowerQuery) ||
          s.email.toLowerCase().includes(lowerQuery) ||
          s.contactPerson?.toLowerCase().includes(lowerQuery)),
    );
  },
};

// ========== Supplier Products ==========
export const supplierProductsDb = {
  getAll: async (): Promise<SupplierProduct[]> => {
    return mockSupplierProducts;
  },

  getBySupplier: async (supplierId: string): Promise<SupplierProduct[]> => {
    return mockSupplierProducts.filter(sp => sp.supplierId === supplierId);
  },

  getByProduct: async (productId: string): Promise<SupplierProduct[]> => {
    return mockSupplierProducts.filter(sp => sp.productId === productId);
  },

  getPreferredSupplier: async (
    productId: string,
  ): Promise<SupplierProduct | null> => {
    return (
      mockSupplierProducts.find(
        sp => sp.productId === productId && sp.isPreferred,
      ) || null
    );
  },

  getById: async (id: string): Promise<SupplierProduct | null> => {
    return mockSupplierProducts.find(sp => sp.id === id) || null;
  },

  add: async (
    supplierProduct: Omit<SupplierProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = `SP-${Date.now()}`;

    // If setting as preferred, unset other preferred suppliers for this product
    if (supplierProduct.isPreferred) {
      mockSupplierProducts = mockSupplierProducts.map(sp => {
        if (sp.productId === supplierProduct.productId && sp.isPreferred) {
          return { ...sp, isPreferred: false, updatedAt: now };
        }
        return sp;
      });
    }

    const newSupplierProduct: SupplierProduct = {
      ...supplierProduct,
      id,
      createdAt: now,
      updatedAt: now,
    };

    mockSupplierProducts = [newSupplierProduct, ...mockSupplierProducts];
    return id;
  },

  update: async (
    id: string,
    updates: Partial<SupplierProduct>,
  ): Promise<void> => {
    const index = mockSupplierProducts.findIndex(sp => sp.id === id);
    if (index !== -1) {
      const current = mockSupplierProducts[index];

      // Handle preferred supplier update
      if (updates.isPreferred && current.productId) {
        mockSupplierProducts = mockSupplierProducts.map(sp => {
          if (
            sp.productId === current.productId &&
            sp.id !== id &&
            sp.isPreferred
          ) {
            return {
              ...sp,
              isPreferred: false,
              updatedAt: new Date().toISOString(),
            };
          }
          return sp;
        });
      }

      mockSupplierProducts[index] = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  delete: async (id: string): Promise<void> => {
    mockSupplierProducts = mockSupplierProducts.filter(sp => sp.id !== id);
  },
};
