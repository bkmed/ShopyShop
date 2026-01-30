import { User } from './authService';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GESTIONNAIRE_DE_STOCK = 'gestionnaire_de_stock',
  ANONYME = 'anonyme',
  UNDEFINED = 'undefined',
}

export enum Permission {
  // Catalog & Products
  VIEW_CATALOG = 'view_catalog',
  MANAGE_PRODUCTS = 'manage_products',
  VIEW_PRODUCT_DETAILS = 'view_product_details',

  // Cart & Checkout
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT = 'checkout',

  // Orders
  VIEW_MY_ORDERS = 'view_my_orders',
  MANAGE_ORDERS = 'manage_orders',
  TRACK_ORDER = 'track_order',

  // Analytics & Management
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_STOCK = 'manage_stock',
  MANAGE_USERS = 'manage_users',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.VIEW_CATALOG,
    Permission.VIEW_PRODUCT_DETAILS,
    Permission.MANAGE_PRODUCTS,
    Permission.ADD_TO_CART,
    Permission.CHECKOUT,
    Permission.VIEW_MY_ORDERS,
    Permission.MANAGE_ORDERS,
    Permission.TRACK_ORDER,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_STOCK,
    Permission.MANAGE_USERS,
  ],
  [Role.GESTIONNAIRE_DE_STOCK]: [
    Permission.VIEW_CATALOG,
    Permission.VIEW_PRODUCT_DETAILS,
    Permission.MANAGE_PRODUCTS,
    Permission.MANAGE_STOCK,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.USER]: [
    Permission.VIEW_CATALOG,
    Permission.VIEW_PRODUCT_DETAILS,
    Permission.ADD_TO_CART,
    Permission.CHECKOUT,
    Permission.VIEW_MY_ORDERS,
    Permission.TRACK_ORDER,
  ],
  [Role.ANONYME]: [Permission.VIEW_CATALOG, Permission.VIEW_PRODUCT_DETAILS],
  [Role.UNDEFINED]: [Permission.VIEW_CATALOG, Permission.VIEW_PRODUCT_DETAILS],
};

class RbacService {
  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: User | null, permission: Permission): boolean {
    const role = user ? this.getUserRole(user) : Role.ANONYME;
    const permissions = ROLE_PERMISSIONS[role] || [];

    return permissions.indexOf(permission) !== -1;
  }

  /**
   * Get valid Role enum from user object
   */
  getUserRole(user: User | null): Role {
    if (!user || !user.role) return Role.ANONYME;

    const roleStr = user.role.toLowerCase();
    const validRoles = Object.keys(Role).map(k => (Role as any)[k]);
    if (validRoles.indexOf(roleStr) !== -1) {
      return roleStr as Role;
    }

    return Role.ANONYME;
  }

  /**
   * Check if user is an Admin
   */
  isAdmin(user: User | null): boolean {
    return this.getUserRole(user) === Role.ADMIN;
  }

  /**
   * Check if user is a Stock Manager
   */
  isStockManager(user: User | null): boolean {
    return this.getUserRole(user) === Role.GESTIONNAIRE_DE_STOCK;
  }

  /**
   * Check if user is a regular Customer/User
   */
  isUser(user: User | null): boolean {
    return this.getUserRole(user) === Role.USER;
  }

  /**
   * Check if user is Anonymous
   */
  isAnonyme(user: User | null): boolean {
    return this.getUserRole(user) === Role.ANONYME;
  }

  /**
   * Check if user can manage catalog
   */
  canManageCatalog(user: User | null): boolean {
    return this.isAdmin(user) || this.isStockManager(user);
  }

  /**
   * Check if user can view analytics
   */
  canViewAnalytics(user: User | null): boolean {
    return this.isAdmin(user) || this.isStockManager(user);
  }
}

export const rbacService = new RbacService();
