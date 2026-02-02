import { storageService } from './storage';
import { UserAccount } from '../database/schema';
import { productsDb } from '../database/productsDb';
import { categoriesDb } from '../database/categoriesDb';

const AUTH_KEY = 'auth_session';
const USERS_KEY = 'auth_users';

export type UserRole = 'admin' | 'user' | 'gestionnaire_de_stock' | 'anonyme';
export const ROLES: UserRole[] = [
  'admin',
  'user',
  'gestionnaire_de_stock',
  'anonyme',
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUri?: string;
  phone?: string;
  status?: 'active' | 'pending' | 'rejected';
  notificationPreferences?: {
    push: boolean;
    email: boolean;
  };
}

export const authService = {
  // Login
  login: async (emailInput: string, password: string): Promise<User> => {
    const email = emailInput.trim().toLowerCase();
    // Simulate API delay
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

    // Seed demo data if it's the first time
    if (!storageService.getBoolean('demo_data_seeded_ecommerce_v3')) {
      await seedDemoData();
    }

    const usersJson = storageService.getString(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find(
      (u: UserAccount & { password?: string }) =>
        u.email === email && u.password === password,
    );

    if (user) {
      const sessionUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        avatarUri: user.avatarUri,
        status: user.status,
        notificationPreferences: {
          push: true,
          email: true,
        },
      };
      storageService.setString(AUTH_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }

    throw new Error('Invalid credentials');
  },

  // Register
  register: async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'user',
  ): Promise<User> => {
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

    const usersJson = storageService.getString(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    if (
      users.find((u: UserAccount & { password?: string }) => u.email === email)
    ) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      status: role === 'admin' ? 'active' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    storageService.setString(USERS_KEY, JSON.stringify(users));

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as UserRole,
      status: newUser.status as any,
      notificationPreferences: { push: true, email: true },
    };
    storageService.setString(AUTH_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  },

  // Update User
  updateUser: async (updatedData: Partial<User>): Promise<User> => {
    const currentJson = storageService.getString(AUTH_KEY);
    if (!currentJson) throw new Error('Not logged in');

    const currentUser = JSON.parse(currentJson);
    const newUser = { ...currentUser, ...updatedData };

    // Update session
    storageService.setString(AUTH_KEY, JSON.stringify(newUser));

    // Update user record in USERS_KEY
    const usersJson = storageService.getString(USERS_KEY);
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const userIndex = users.findIndex(
        (u: UserAccount & { password?: string }) => u.id === newUser.id,
      );
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };
        storageService.setString(USERS_KEY, JSON.stringify(users));
      }
    }

    return newUser;
  },

  // Logout
  logout: async (): Promise<void> => {
    storageService.delete(AUTH_KEY);
    return Promise.resolve();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const json = storageService.getString(AUTH_KEY);
    return json ? JSON.parse(json) : null;
  },
};

const seedDemoData = async () => {
  console.log('SEEDING PREMIUM ECOMMERCE DEMO DATA...');

  // 1. Seed Categories
  const categoryIds: string[] = [];
  const categories = [
    {
      name: 'Electronics',
      description: 'Latest gadgets and high-tech devices',
    },
    { name: 'Fashion', description: 'Trendy clothing and stylish accessories' },
    { name: 'Home & Living', description: 'Premium furniture and home decor' },
    { name: 'Beauty', description: 'Skincare, makeup, and personal care' },
    { name: 'Sports', description: 'Top-tier athletic gear and apparel' },
  ];

  for (const cat of categories) {
    const id = await categoriesDb.add(cat);
    categoryIds.push(id);
  }

  // 2. Seed Products
  const sampleProducts = [
    {
      name: 'MacBook Pro M3',
      description: 'The most powerful MacBook yet with the M3 chip.',
      price: 1999,
      unitPrice: 1500,
      currency: 'USD',
      stockQuantity: 25,
      categoryId: categoryIds[0],
      imageUris: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
      ],
      isActive: true,
      availableDate: new Date('2024-01-01').toISOString(),
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancelling wireless headphones.',
      price: 399,
      unitPrice: 280,
      currency: 'USD',
      stockQuantity: 80,
      categoryId: categoryIds[0],
      imageUris: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
      ],
      isActive: true,
      availableDate: new Date('2024-01-01').toISOString(),
    },
    {
      name: 'Leather Weekend Bag',
      description: 'Handcrafted premium leather bag for your travels.',
      price: 150,
      unitPrice: 90,
      currency: 'USD',
      stockQuantity: 45,
      categoryId: categoryIds[1],
      imageUris: [
        'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400',
      ],
      isActive: true,
      availableDate: new Date('2024-01-01').toISOString(),
    },
    {
      name: 'Minimalist Wall Clock',
      description: 'Sleek design that fits any modern home.',
      price: 45,
      unitPrice: 25,
      currency: 'USD',
      stockQuantity: 120,
      categoryId: categoryIds[2],
      imageUris: [
        'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=400',
      ],
      isActive: true,
      availableDate: new Date('2024-01-01').toISOString(),
    },
    {
      name: 'Organic Face Serum',
      description: 'Natural ingredients for glowing, healthy skin.',
      price: 65,
      unitPrice: 35,
      currency: 'USD',
      stockQuantity: 200,
      categoryId: categoryIds[3],
      imageUris: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
      ],
      isActive: true,
      availableDate: new Date('2024-01-01').toISOString(),
    },
    {
      name: 'Yoga Starter Kit',
      description: 'Includes a high-grip mat, two blocks, and a strap.',
      price: 85,
      unitPrice: 45,
      currency: 'USD',
      stockQuantity: 150,
      categoryId: categoryIds[4],
      imageUris: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
      ],
      isActive: true,
      availableDate: new Date('2024-01-01').toISOString(),
    },
  ];

  for (const prod of sampleProducts) {
    await productsDb.add(prod);
  }

  // 3. Seed Users (Corrected credentials)
  const users: any[] = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stock-1',
      name: 'Stock Manager',
      email: 'stock@demo.com',
      password: 'stock123',
      role: 'gestionnaire_de_stock',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-1',
      name: 'Demo User',
      email: 'user@demo.com',
      password: 'user123',
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  storageService.setString(USERS_KEY, JSON.stringify(users));
  storageService.setBoolean('demo_data_seeded_ecommerce_v3', true);
  console.log('ECOMMERCE DEMO DATA V3 SEEDED SUCCESSFULLY');
};
