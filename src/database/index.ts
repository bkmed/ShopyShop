// Database module - using MMKV for all storage
// MMKV storage is initialized in services/storage.ts and used by all database files

// Export database modules
export { productsDb } from './productsDb';
export { categoriesDb } from './categoriesDb';
export { ordersDb } from './ordersDb';
export { currenciesDb } from './currenciesDb';
export { reclamationsDb } from './reclamationsDb';
// export { companySettingsDb } from './companySettingsDb';

// Export schemas
export * from './schema';

// Note: All database operations use Redux slices which persist via MMKV
// In this architecture, "Db" wrappers act as a bridge between services and the Redux store.
