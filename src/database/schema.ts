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
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stockQuantity: number;
  categoryId: string;
  imageUris: string[];
  attributes?: Record<string, any>; // e.g. { size: 'M', color: 'red' }
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

export interface Currency {
  id: string;
  code: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
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
