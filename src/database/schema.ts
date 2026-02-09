export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUri?: string;
  parentId?: string; // For subcategories
  availableDate?: string; // ISO format
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unitPrice: number; // Wholesale/Cost price for stock management
  currency: string;
  stockQuantity: number;
  categoryId: string;
  imageUris: string[];
  attributes?: Record<string, any>; // e.g. { size: 'M', color: 'red' }
  fiche?: string; // Technical details/fiche
  availableDate?: string; // ISO format: when the product becomes visible to users
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  merchantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  currency: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  billingAddress: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  logoUri?: string;
  bannerUri?: string;
  email: string;
  phone?: string;
  address?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string; // 'admin' | 'user' | 'gestionnaire_de_stock' | 'anonyme'
  avatarUri?: string;
  phone?: string;
  addresses?: string[];
  preferredLanguage?: string;
  preferredCurrency?: string;
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Keep some useful models but rename/refactor if needed
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  date: string;
  category: 'news' | 'promotion' | 'alert';
  imageUri?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  percentage: number;
  categoryId: string; // Restricted to category
  isActive: boolean;
  expiryDate: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  change: number; // + or -
  reason: string;
  performedBy: string; // userId
  createdAt: string;
}

export type ReclamationStatus =
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export interface Reclamation {
  id: string;
  userId: string;
  orderId: string;
  reason: string;
  description: string;
  status: ReclamationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  code: string; // e.g., 'USD', 'EUR', 'TND'
  symbol: string; // e.g., '$', '€', 'DT'
  rate: number; // exchange rate relative to base currency
  isBase: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== Stock Manager Enhancements ==========

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  supplierSKU?: string; // Supplier's product code
  supplierPrice: number; // Cost from this supplier
  currency: string;
  minimumOrderQuantity?: number;
  leadTimeDays?: number; // Delivery time in days
  isPreferred: boolean; // Preferred supplier for this product
  createdAt: string;
  updatedAt: string;
}

export type StockReceptionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface StockReceptionItem {
  productId: string;
  productName: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
}

export interface StockReception {
  id: string;
  supplierId: string;
  supplierName: string;
  status: StockReceptionStatus;
  referenceNumber?: string; // PO number, invoice, etc.
  items: StockReceptionItem[];
  totalCost: number;
  currency: string;
  receivedBy?: string; // userId of stock manager
  notes?: string;
  expectedDate?: string;
  receivedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type PickPackStatus =
  | 'pending'
  | 'picking'
  | 'packing'
  | 'ready_to_ship'
  | 'shipped';

export interface PickPackItem {
  productId: string;
  productName: string;
  quantity: number;
  location?: string; // Warehouse location
  picked: boolean;
  packed: boolean;
}

export interface PickPackOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: PickPackStatus;
  items: PickPackItem[];
  assignedTo?: string; // userId of warehouse worker
  shippingAddress: string;
  shippingMethod?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  pickedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  userName: string;
  orderId: string; // Links to Order
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  shippingAddress: string;
  billingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
