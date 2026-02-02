// Database module - using MMKV for all storage
// MMKV storage is initialized in services/storage.ts and used by all database files

// Export database modules
export { productsDb } from './productsDb';
export { categoriesDb } from './categoriesDb';
export { ordersDb } from './ordersDb';
export { inventoryDb } from './inventoryDb';
export { usersDb } from './usersDb';
export { wishlistDb } from './wishlistDb';
export { promosDb } from './promosDb';
export { reclamationsDb } from './reclamationsDb';
export { currenciesDb } from './currenciesDb';
export { addressesDb, paymentMethodsDb, deliveryMethods } from './checkoutDb';
export { suppliersDb, supplierProductsDb } from './suppliersDb';
export { purchasesDb } from './purchasesDb';
export { stockReceptionDb } from './stockReceptionDb';
export { pickPackDb } from './pickPackDb';
// export { companySettingsDb } from './companySettingsDb';

// Export schemas
export * from './schema';

// Note: All database operations use Redux slices which persist via MMKV
// In this architecture, "Db" wrappers act as a bridge between services and the Redux store.
