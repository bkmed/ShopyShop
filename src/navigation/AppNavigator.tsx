import React, { useState, useMemo, useCallback } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { enableScreens } from 'react-native-screens';
import {
  NavigationContainer,
  useNavigationContainerRef,
  DefaultTheme,
} from '@react-navigation/native';
import notifee, { EventType } from '@notifee/react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { sessionService } from '../services/sessionService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { rbacService, Permission } from '../services/rbacService';
import { HomeScreen } from '../screens/HomeScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { AnnouncementsScreen } from '../screens/home/AnnouncementsScreen';
import { PersonalSettingsScreen } from '../screens/settings/PersonalSettingsScreen';
import { CompanyChatScreen } from '../screens/chat/CompanyChatScreen';
import { CatalogScreen } from '../screens/shop/CatalogScreen';
import { CartScreen } from '../screens/shop/CartScreen';
import { LanguageSelectionScreen } from '../screens/settings/LanguageSelectionScreen';
import { ProductListScreen } from '../screens/products/ProductListScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { ProductAddScreen } from '../screens/products/ProductAddScreen';
import { CategoryListScreen } from '../screens/categories/CategoryListScreen';
import { CategoryDetailScreen } from '../screens/categories/CategoryDetailScreen';
import { CategoryAddScreen } from '../screens/categories/CategoryAddScreen';
import { WishlistListScreen } from '../screens/wishlist/WishlistListScreen';
import { OrderListScreen } from '../screens/orders/OrderListScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { OrderAddScreen } from '../screens/orders/OrderAddScreen';
import { InventoryListScreen } from '../screens/inventory/InventoryListScreen';
import { InventoryDetailScreen } from '../screens/inventory/InventoryDetailScreen';
import { InventoryAddScreen } from '../screens/inventory/InventoryAddScreen';
import { AdminDashboardScreen } from '../screens/dashboards/AdminDashboardScreen';
import { StockManagerDashboardScreen } from '../screens/dashboards/StockManagerDashboardScreen';
import { UserDashboardScreen } from '../screens/dashboards/UserDashboardScreen';
import { CurrencySelectionScreen } from '../screens/settings/CurrencySelectionScreen';
import { CurrencyAdminScreen } from '../screens/admin/CurrencyAdminScreen';
import { CustomThemeColorsScreen } from '../screens/settings/CustomThemeColorsScreen';
import { NotificationBell } from '../components/common/NotificationBell';
import { ChatBot } from '../components/common/ChatBot';
import { useAuth } from '../context/AuthContext';
import { GlassHeader } from '../components/common/GlassHeader';

// New Screens
import { PurchaseHistoryScreen } from '../screens/purchases/PurchaseHistoryScreen';
import { PurchaseDetailScreen } from '../screens/purchases/PurchaseDetailScreen';
import { ReclamationListScreen } from '../screens/reclamations/ReclamationListScreen';
import { ReclamationAddScreen } from '../screens/reclamations/ReclamationAddScreen';
import { ReclamationDetailScreen } from '../screens/reclamations/ReclamationDetailScreen';
import { UserListScreen } from '../screens/admin/UserListScreen';
import { UserDetailsScreen } from '../screens/admin/UserDetailsScreen';

import { SupplierListScreen } from '../screens/suppliers/SupplierListScreen';
import { SupplierAddEditScreen } from '../screens/suppliers/SupplierAddEditScreen';
import { SupplierDetailScreen } from '../screens/suppliers/SupplierDetailScreen';
import { SupplierProductListScreen } from '../screens/suppliers/SupplierProductListScreen';

// Stock Reception Screens
import { StockReceptionListScreen } from '../screens/inventory/StockReceptionListScreen';
import { StockReceptionDetailScreen } from '../screens/inventory/StockReceptionDetailScreen';

// Pick & Pack Screens
import { PickPackListScreen } from '../screens/inventory/PickPackListScreen';
import { PickPackDetailScreen } from '../screens/inventory/PickPackDetailScreen';

// Stock Movement Screen
import { StockMovementScreen } from '../screens/inventory/StockMovementScreen';

// Admin Purchase Screens
import { AdminPurchaseListScreen } from '../screens/admin/AdminPurchaseListScreen';
import { AdminPurchaseDetailScreen } from '../screens/admin/AdminPurchaseDetailScreen';
import { AdminPurchaseAddEditScreen } from '../screens/admin/AdminPurchaseAddEditScreen';

// Admin Reclamation Screens
import { AdminReclamationListScreen } from '../screens/admin/AdminReclamationListScreen';
import { AdminReclamationDetailScreen } from '../screens/admin/AdminReclamationDetailScreen';
import { AdminReclamationAddEditScreen } from '../screens/admin/AdminReclamationAddEditScreen';

// Checkout Screens
// Checkout Screens
import { DeliveryMethodScreen } from '../screens/checkout/DeliveryMethodScreen';
import { ReviewCartScreen } from '../screens/checkout/ReviewCartScreen';
import { AddressSelectionScreen } from '../screens/checkout/AddressSelectionScreen';
import { PaymentSelectionScreen } from '../screens/checkout/PaymentSelectionScreen';
import { OrderConfirmationScreen } from '../screens/checkout/OrderConfirmationScreen';
import { AddressAddEditScreen } from '../screens/checkout/AddressAddEditScreen';

enableScreens();

import { WebNavigationContext } from './WebNavigationContext';

// ======= Stacks =======
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const AnalyticsStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AnalyticsMain"
        component={AnalyticsScreen}
        options={{ title: t('navigation.analytics') }}
      />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="PersonalSettings"
        component={PersonalSettingsScreen}
        options={{ title: t('settings.personal') }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageSelectionScreen}
        options={{ title: t('profile.language') }}
      />
      <Stack.Screen
        name="Currency"
        component={CurrencySelectionScreen}
        options={{ title: t('settings.currency') }}
      />
    </Stack.Navigator>
  );
};

const LanguageStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Language"
        component={LanguageSelectionScreen}
        options={{ title: t('profile.language') }}
      />
    </Stack.Navigator>
  );
};

const CurrencyStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Currency"
        component={CurrencySelectionScreen}
        options={{ title: t('settings.currency') }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="Language"
        component={LanguageSelectionScreen}
        options={{ title: t('profile.language') }}
      />
    </Stack.Navigator>
  );
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen
      name="Announcements"
      component={AnnouncementsScreen}
      options={{ headerShown: true, title: 'News' }}
    />
    <Stack.Screen
      name="Chat"
      component={CompanyChatScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const CatalogStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="CatalogMain"
        component={CatalogScreen}
        options={{ title: t('navigation.catalog') }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: t('catalog.detail') }}
      />
    </Stack.Navigator>
  );
};

const CartStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="CartMain"
        component={CartScreen}
        options={{ title: t('navigation.cart') }}
      />
      <Stack.Screen
        name="DeliveryMethod"
        component={DeliveryMethodScreen}
        options={{ title: t('checkout.delivery') || 'DELIVERY' }}
      />
      <Stack.Screen
        name="AddressSelection"
        component={AddressSelectionScreen}
        options={{ title: t('checkout.address') || 'ADDRESS' }}
      />
      <Stack.Screen
        name="AddressAddEdit"
        component={AddressAddEditScreen}
        options={{ title: t('checkout.address') || 'ADDRESS' }}
      />
      <Stack.Screen
        name="PaymentSelection"
        component={PaymentSelectionScreen}
        options={{ title: t('checkout.payment') || 'PAYMENT' }}
      />
      <Stack.Screen
        name="ReviewCart"
        component={ReviewCartScreen}
        options={{ title: 'REVIEW' }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ProductsStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: t('products.title') }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: t('products.detail') }}
      />
      <Stack.Screen
        name="ProductAdd"
        component={ProductAddScreen}
        options={{ title: t('products.add') }}
      />
    </Stack.Navigator>
  );
};

const CategoriesStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={{ title: t('categories.title') }}
      />
      <Stack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={{ title: t('categories.detail') }}
      />
      <Stack.Screen
        name="CategoryAdd"
        component={CategoryAddScreen}
        options={{ title: t('categories.add') }}
      />
    </Stack.Navigator>
  );
};

const WishlistStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="WishlistList"
        component={WishlistListScreen}
        options={{ title: t('navigation.wishlist') }}
      />
    </Stack.Navigator>
  );
};

const OrdersStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="OrderList"
        component={OrderListScreen}
        options={{ title: t('navigation.orders') }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: t('orders.detail') || 'Order Detail' }}
      />
      <Stack.Screen
        name="OrderAdd"
        component={OrderAddScreen}
        options={{ title: t('orders.add') || 'Add Order' }}
      />
    </Stack.Navigator>
  );
};

const InventoryStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="InventoryList"
        component={InventoryListScreen}
        options={{ title: t('navigation.inventory') }}
      />
      <Stack.Screen
        name="InventoryDetail"
        component={InventoryDetailScreen}
        options={{ title: t('inventory.detail') || 'Inventory Detail' }}
      />
      <Stack.Screen
        name="InventoryAdd"
        component={InventoryAddScreen}
        options={{ title: t('inventory.adjust') || 'Adjust Stock' }}
      />
      <Stack.Screen
        name="StockReceptionList"
        component={StockReceptionListScreen}
        options={{ title: t('navigation.stockReception') || 'Stock Reception' }}
      />
      <Stack.Screen
        name="StockReceptionDetail"
        component={StockReceptionDetailScreen}
        options={{ title: t('stockReception.detail') || 'Reception Detail' }}
      />
      <Stack.Screen
        name="PickPackList"
        component={PickPackListScreen}
        options={{ title: t('navigation.pickPack') || 'Pick & Pack' }}
      />
      <Stack.Screen
        name="PickPackDetail"
        component={PickPackDetailScreen}
        options={{ title: t('pickPack.detail') || 'Pick & Pack Detail' }}
      />
      <Stack.Screen
        name="StockMovement"
        component={StockMovementScreen}
        options={{ title: t('inventory.history') || 'Stock Movement' }}
      />
    </Stack.Navigator>
  );
};

const SuppliersStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="SupplierList"
        component={SupplierListScreen}
        options={{ title: t('suppliers.title') }}
      />
      <Stack.Screen
        name="SupplierAddEdit"
        component={SupplierAddEditScreen}
        options={({ route }: any) => ({
          title: route.params?.supplierId
            ? t('suppliers.edit')
            : t('suppliers.add'),
        })}
      />
      <Stack.Screen
        name="SupplierDetail"
        component={SupplierDetailScreen}
        options={{ title: t('suppliers.detail') }}
      />
      <Stack.Screen
        name="SupplierProductList"
        component={SupplierProductListScreen}
        options={{ title: t('suppliers.products') }}
      />
    </Stack.Navigator>
  );
};

const PurchasesStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="PurchaseHistory"
        component={PurchaseHistoryScreen}
        options={{ title: t('purchases.title') }}
      />
      <Stack.Screen
        name="PurchaseDetail"
        component={PurchaseDetailScreen}
        options={{ title: t('purchases.detail') }}
      />
    </Stack.Navigator>
  );
};

const ReclamationsStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="ReclamationList"
        component={ReclamationListScreen}
        options={{ title: t('reclamations.title') }}
      />
      <Stack.Screen
        name="ReclamationAdd"
        component={ReclamationAddScreen}
        options={{ title: t('reclamations.add') }}
      />
      <Stack.Screen
        name="ReclamationDetail"
        component={ReclamationDetailScreen}
        options={{ title: t('reclamations.detail') }}
      />
    </Stack.Navigator>
  );
};

import { UserAddEditScreen } from '../screens/admin/UserAddEditScreen';

const UserManagementStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={{ title: t('roles.title') }}
      />
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{ title: t('roles.detail') || 'User Details' }}
      />
      <Stack.Screen
        name="CurrencyAdmin"
        component={CurrencyAdminScreen}
        options={{ title: 'Currency Management' }}
      />
      <Stack.Screen
        name="UserAddEdit"
        component={UserAddEditScreen}
        options={{ title: t('users.detail') || 'User Details' }}
      />
    </Stack.Navigator>
  );
};

import { PromoListScreen } from '../screens/admin/PromoListScreen';
import { PromoAddEditScreen } from '../screens/admin/PromoAddEditScreen';

const PromoStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="PromoList"
        component={PromoListScreen}
        options={{ title: 'Promo Codes' }}
      />
      <Stack.Screen
        name="PromoAddEdit"
        component={PromoAddEditScreen}
        options={{ title: 'Promo Detail' }}
      />
    </Stack.Navigator>
  );
};

const AdminPurchasesStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AdminPurchaseList"
        component={AdminPurchaseListScreen}
        options={{ title: t('admin.purchases.title') || 'Purchase Management' }}
      />
      <Stack.Screen
        name="AdminPurchaseDetail"
        component={AdminPurchaseDetailScreen}
        options={{ title: t('admin.purchases.detail') || 'Purchase Detail' }}
      />
      <Stack.Screen
        name="AdminPurchaseAddEdit"
        component={AdminPurchaseAddEditScreen}
        options={{ title: t('admin.purchases.edit') || 'Purchase Detail' }}
      />
    </Stack.Navigator>
  );
};

const AdminReclamationsStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AdminReclamationList"
        component={AdminReclamationListScreen}
        options={{
          title: t('admin.reclamations.title') || 'Reclamation Management',
        }}
      />
      <Stack.Screen
        name="AdminReclamationDetail"
        component={AdminReclamationDetailScreen}
        options={{
          title: t('admin.reclamations.detail') || 'Reclamation Detail',
        }}
      />
      <Stack.Screen
        name="AdminReclamationAddEdit"
        component={AdminReclamationAddEditScreen}
        options={{
          title: t('admin.reclamations.edit') || 'Reclamation Detail',
        }}
      />
    </Stack.Navigator>
  );
};

// Stacks are defined below

// ======= Tabs (Mobile) =======
// const Tab = createBottomTabNavigator();

/*
const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="HomeTab"
      component={HomeStack}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="CatalogTab"
      component={CatalogStack}
      options={{ title: 'Catalog' }}
    />
    <Tab.Screen
      name="CartTab"
      component={CartStack}
      options={{ title: 'Cart' }}
    />
    <Tab.Screen
      name="ChatTab"
      component={CompanyChatScreen}
      options={{ title: 'Chat' }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileStack}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);
*/

// ======= Drawer (Mobile) =======
const Drawer = createDrawerNavigator();

// ======= Custom Hook for Sectioned Navigation =======
const useNavigationSections = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return useMemo(() => {
    const isStockManager = rbacService.isStockManager(user);
    const isAdmin = rbacService.isAdmin(user);
    const isManagementRole = isStockManager || isAdmin;
    const isManager = isAdmin || user?.role === 'gestionnaire_de_stock';

    const sections = [
      {
        title: t('sections.shop') || 'Shop',
        items: [
          // Home for everyone
          { key: 'Home', label: t('navigation.home'), icon: '🏠' },

          // Catalog hidden for Stock Manager
          ...(!isStockManager
            ? [
                {
                  key: 'Catalog',
                  label: t('navigation.catalog') || 'Catalog',
                  icon: '🛍️',
                },
              ]
            : []),

          // Categories, Cart only for non-management roles (Users)
          ...(!isManagementRole
            ? [
                {
                  key: 'Categories',
                  label: t('navigation.categories') || 'Categories',
                  icon: '🗂️',
                },
                { key: 'Cart', label: t('navigation.cart'), icon: '🛒' },
              ]
            : []),
        ],
      },
      {
        title: t('sections.account') || 'Account',
        items: [
          // Orders and Wishlist only for regular users
          ...(!isManagementRole
            ? [
                { key: 'Orders', label: t('navigation.orders'), icon: '📦' },
                {
                  key: 'Wishlist',
                  label: t('navigation.wishlist') || 'Wishlist',
                  icon: '❤️',
                },
              ]
            : []),

          // Analytics for those with permission
          ...(rbacService.hasPermission(user, Permission.VIEW_ANALYTICS)
            ? [
                {
                  key: 'Analytics',
                  label: t('navigation.analytics'),
                  icon: '📊',
                },
              ]
            : []),

          // Purchases and Reclamations for regular users
          ...(!isManagementRole
            ? [
                {
                  key: 'Purchases',
                  label: t('navigation.purchases') || 'Purchases',
                  icon: '🛍️',
                },
                {
                  key: 'Reclamations',
                  label: t('navigation.reclamations') || 'Claims',
                  icon: '⚠️',
                },
              ]
            : []),
        ],
      },
    ];

    const managementItems = [];

    if (rbacService.hasPermission(user, Permission.MANAGE_STOCK)) {
      managementItems.push({
        key: 'Inventory',
        label: t('navigation.inventory') || 'Inventory',
        icon: '🏭',
      });
      managementItems.push({
        key: 'Suppliers',
        label: t('suppliers.title') || 'Suppliers',
        icon: '🚚',
      });
      managementItems.push({
        key: 'StockReceptionList',
        label: t('navigation.stockReception') || 'Reception',
        icon: '📥',
      });
      managementItems.push({
        key: 'PickPackList',
        label: t('navigation.pickPack') || 'Pick & Pack',
        icon: '📦',
      });
    }

    if (rbacService.hasPermission(user, Permission.MANAGE_PRODUCTS)) {
      managementItems.push({
        key: 'Products',
        label: t('navigation.products') || 'Products',
        icon: '🏷️',
      });
    }

    if (rbacService.hasPermission(user, Permission.MANAGE_ORDERS)) {
      managementItems.push({
        key: 'ManageOrders',
        label: t('navigation.orders') || 'Manage Orders',
        icon: '🚚',
      });
    }

    if (isAdmin) {
      managementItems.push({
        key: 'UserManagement',
        label: t('roles.title') || 'User Management',
        icon: '👥',
      });
      managementItems.push({
        key: 'AdminPurchases',
        label: t('admin.purchases.title') || 'Purchases (Admin)',
        icon: '💰',
      });
      managementItems.push({
        key: 'AdminReclamations',
        label: t('admin.reclamations.title') || 'Claims (Admin)',
        icon: '🎴',
      });
      managementItems.push({
        key: 'Promos',
        label: 'Promos',
        icon: '🎟️',
      });
    }

    if (managementItems.length > 0) {
      sections.push({
        title: t('sections.management') || 'Management',
        items: managementItems,
      });
    }

    sections.push({
      title: t('sections.communication') || 'Communication',
      items: [
        { key: 'Chat', label: t('navigation.chat') || 'Chat', icon: '💬' },
        {
          key: 'Assistant',
          label: t('common.assistant') || 'Assistant',
          icon: '🤖',
        },
      ],
    });

    const personalItems = [
      { key: 'Settings', label: t('navigation.settings'), icon: '🎨' },
      { key: 'Language', label: t('profile.language'), icon: '🌐' },
      { key: 'Currency', label: t('settings.currency'), icon: '💵' },
      { key: 'Profile', label: t('navigation.profile'), icon: '👤' },
    ];

    if (!isManager) {
      personalItems.splice(1, 0, {
        key: 'Purchases',
        label: t('navigation.purchases') || 'Purchases',
        icon: '🛍️',
      });
      personalItems.splice(2, 0, {
        key: 'Reclamations',
        label: t('navigation.reclamations') || 'Reclamations',
        icon: '📝',
      });
    }

    sections.push({
      title: t('sections.personal'),
      items: personalItems,
    });

    return sections;
  }, [t, user]);
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user } = useAuth();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const { state, navigation } = props;
  const sections = useNavigationSections();
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View
        style={{
          padding: '8%',
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          backgroundColor: theme.colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginBottom: 12,
          minHeight: 180,
          justifyContent: 'center',
          ...theme.shadows.medium,
          ...(themeMode === 'premium' && {
            borderBottomWidth: 1,
            borderBottomColor: '#FFD700',
          }),
        }}
      >
        <Image
          source={require('../../public/logo.png')}
          style={{
            width: 60,
            height: 60,
            tintColor:
              themeMode === 'premium' ? theme.colors.background : '#FFF',
            marginBottom: 16,
          }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: themeMode === 'premium' ? theme.colors.background : '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {user?.name}
        </Text>
        <Text
          style={{
            color:
              themeMode === 'premium'
                ? 'rgba(11,13,23,0.8)'
                : 'rgba(255,255,255,0.8)',
            fontSize: 14,
          }}
        >
          {t(`roles.${user?.role || 'undefined'}`)}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {sections.map(section => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => toggleSection(section.title)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingRight: 16,
              }}
            >
              <Text
                style={{
                  marginLeft: 16,
                  marginTop: 8,
                  marginBottom: 4,
                  color: theme.colors.subText,
                  fontWeight: '600',
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </Text>
              <Text style={{ color: theme.colors.subText, fontSize: 12 }}>
                {collapsedSections[section.title] ? '▼' : '▲'}
              </Text>
            </TouchableOpacity>

            {!collapsedSections[section.title] &&
              section.items.map(item => {
                const isFocused = state.routes[state.index].name === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      marginHorizontal: 12,
                      marginVertical: 2,
                      borderRadius: 12,
                      backgroundColor: isFocused
                        ? `${theme.colors.primary}15`
                        : 'transparent',
                      ...(isFocused &&
                        themeMode === 'premium' && {
                          borderWidth: 1,
                          borderColor: theme.colors.primary,
                        }),
                    }}
                    onPress={() => navigation.navigate(item.key)}
                  >
                    <Text style={{ fontSize: 20, marginRight: 16 }}>
                      {item.icon}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isFocused ? '700' : '500',
                        color: isFocused
                          ? theme.colors.primary
                          : theme.colors.text,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const DashboardsStack = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const getDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return AdminDashboardScreen;
      case 'gestionnaire_de_stock':
        return StockManagerDashboardScreen;
      default:
        return UserDashboardScreen;
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="DashboardRoot"
        component={getDashboard()}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  const { user } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Dashboard" component={DashboardsStack} />
      <Drawer.Screen name="Catalog" component={CatalogStack} />
      <Drawer.Screen name="Cart" component={CartStack} />
      <Drawer.Screen name="Orders" component={OrdersStack} />
      <Drawer.Screen name="Wishlist" component={WishlistStack} />
      <Drawer.Screen name="Purchases" component={PurchasesStack} />
      <Drawer.Screen name="Reclamations" component={ReclamationsStack} />
      <Drawer.Screen name="AdminPurchases" component={AdminPurchasesStack} />
      <Drawer.Screen
        name="AdminReclamations"
        component={AdminReclamationsStack}
      />
      <Drawer.Screen name="Analytics" component={AnalyticsStack} />
      <Drawer.Screen name="UserManagement" component={UserManagementStack} />
      <Drawer.Screen name="Products" component={ProductsStack} />
      <Drawer.Screen name="Categories" component={CategoriesStack} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
      {rbacService.hasPermission(user, Permission.MANAGE_CURRENCIES) && (
        <Drawer.Screen name="Currencies" component={SettingsStack} />
      )}
      <Drawer.Screen name="Profile" component={ProfileStack} />
      <Drawer.Screen name="Chat" component={CompanyChatScreen} />
      <Drawer.Screen name="Assistant">{() => <ChatBot />}</Drawer.Screen>
    </Drawer.Navigator>
  );
};

// ======= Web Navigator avec subScreen =======
const WebNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const webStyles = getWebStyles(theme);
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 1045;

  const [navState, setNavState] = useState({
    activeTab: 'Home',
    subScreen: '',
    screenParams: {} as Record<string, unknown>,
  });
  const { activeTab, subScreen, screenParams } = navState;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const handleNavigate = useCallback(
    (tab: string, screen?: string, params?: Record<string, unknown>) => {
      setNavState({
        activeTab: tab,
        subScreen: screen || '',
        screenParams: params || {},
      });
      setIsMenuOpen(false);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      subScreen,
      screenParams,
      setActiveTab: handleNavigate,
    }),
    [activeTab, subScreen, screenParams, handleNavigate],
  );

  const getActiveComponent = () => {
    switch (activeTab) {
      case 'Home':
        // Role-based Home Redirection
        if (rbacService.isAdmin(user) || rbacService.isStockManager(user)) {
          return <DashboardsStack />;
        }
        return <HomeStack />;
      case 'Dashboard':
        return <DashboardsStack />;
      case 'Catalog':
        return <CatalogStack />;
      case 'Categories':
        return <CategoriesStack />;
      case 'Cart':
        return <CartStack />;
      case 'Orders':
        return <OrdersStack />;
      case 'Wishlist':
        return <WishlistStack />;
      case 'Purchases':
        return <PurchasesStack />;
      case 'Reclamations':
        return <ReclamationsStack />;
      case 'Analytics':
        if (!rbacService.hasPermission(user, Permission.VIEW_ANALYTICS))
          return <HomeStack />;
        return <AnalyticsStack />;
      case 'Inventory':
        if (!rbacService.hasPermission(user, Permission.MANAGE_STOCK))
          return <HomeStack />;
        return <InventoryStack />;
      case 'StockReception':
        if (!rbacService.hasPermission(user, Permission.MANAGE_STOCK))
          return <HomeStack />;
        return <InventoryStack />;
      case 'PickPack':
        if (!rbacService.hasPermission(user, Permission.MANAGE_STOCK))
          return <HomeStack />;
        return <InventoryStack />;
      case 'StockMovement':
        if (!rbacService.hasPermission(user, Permission.MANAGE_STOCK))
          return <HomeStack />;
        return <InventoryStack />;
      case 'Suppliers':
        if (!rbacService.hasPermission(user, Permission.MANAGE_STOCK))
          return <HomeStack />;
        return <SuppliersStack />;
      case 'Products':
        if (!rbacService.hasPermission(user, Permission.MANAGE_PRODUCTS))
          return <HomeStack />;
        return <ProductsStack />;
      case 'Chat':
        return <CompanyChatScreen />;
      case 'Assistant':
        return <ChatBot />;
      case 'Settings':
        return <SettingsStack />;
      case 'Profile':
        return <ProfileStack />;
      case 'ManageOrders':
        return <OrdersStack />;
      case 'UserManagement':
        return <UserManagementStack />;
      case 'CurrencyAdmin':
        return <UserManagementStack />;
      case 'Language':
        return <LanguageStack />;
      case 'Currency':
        return <CurrencyStack />;
      case 'Devise':
        return <CurrencyStack />;
      case 'CustomThemeColors':
        return <CustomThemeColorsScreen />;
      case 'Promos':
        return <PromoStack />;
      case 'AdminPurchases':
        return <AdminPurchasesStack />;
      case 'AdminReclamations':
        return <AdminReclamationsStack />;
      default:
        return <HomeStack />;
    }
  };

  const sections = useNavigationSections();

  return (
    <WebNavigationContext.Provider value={contextValue}>
      {}
      <View
        style={
          [
            {
              flex: 1,
              backgroundColor: theme.colors.background,
              minHeight: Platform.OS === 'web' ? '100vh' : '100%',
              width: '100%',
            },
            !isMobile ? { flexDirection: 'row' } : { flexDirection: 'column' },
          ] as any
        }
      >
        {}

        {/* Desktop Sidebar OR Mobile Header */}
        {!isMobile ? (
          <View
            style={[
              webStyles.sidebar,
              {
                backgroundColor: theme.colors.surface,
                borderRightColor: theme.colors.border,
                borderRightWidth: 1,
              },
            ]}
          >
            {/* Brand */}
            <TouchableOpacity
              style={webStyles.sidebarBrand}
              onPress={() => handleNavigate('Home')}
            >
              <Image
                source={require('../../public/logo.png')}
                style={webStyles.sidebarLogo as any}
                resizeMode="contain"
              />
              <Text
                style={[webStyles.sidebarTitle, { color: theme.colors.text }]}
              >
                {t('home.appName')}
              </Text>
            </TouchableOpacity>

            <View style={{ padding: 16, gap: 12 }}>
              <NotificationBell />
            </View>

            {/* Profile Section */}
            <TouchableOpacity
              style={webStyles.sidebarProfile}
              onPress={() => handleNavigate('Profile')}
            >
              <View
                style={[
                  webStyles.profileAvatar,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={webStyles.avatarText}>
                  {user?.name?.charAt(0)}
                </Text>
              </View>
              <View style={webStyles.profileInfo}>
                <Text
                  style={[webStyles.profileName, { color: theme.colors.text }]}
                >
                  {user?.name}
                </Text>
                <Text
                  style={[
                    webStyles.profileRole,
                    { color: theme.colors.subText },
                  ]}
                >
                  {t(`roles.${user?.role}`)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Nav Items with Sections */}
            <ScrollView style={webStyles.sidebarNav}>
              {sections.map(section => (
                <View key={section.title} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setCollapsedSections(prev => ({
                        ...prev,
                        [section.title]: !prev[section.title],
                      }));
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingRight: 24,
                    }}
                  >
                    <Text
                      style={{
                        paddingLeft: 24,
                        marginBottom: 8,
                        marginTop: 8,
                        color: theme.colors.subText,
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      {section.title}
                    </Text>
                    <Text style={{ color: theme.colors.subText, fontSize: 12 }}>
                      {collapsedSections[section.title] ? '▼' : '▲'}
                    </Text>
                  </TouchableOpacity>
                  {!collapsedSections[section.title] &&
                    section.items.map(item => (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => handleNavigate(item.key)}
                        style={[
                          webStyles.sidebarNavItem,
                          activeTab === item.key && {
                            backgroundColor: `${theme.colors.primary}10`,
                            borderRightWidth: 3,
                            borderRightColor: theme.colors.primary,
                          },
                        ]}
                      >
                        <Text style={webStyles.navIcon}>{item.icon}</Text>
                        <Text
                          style={[
                            webStyles.navLabel,
                            {
                              color:
                                activeTab === item.key
                                  ? theme.colors.primary
                                  : theme.colors.text,
                              fontWeight:
                                activeTab === item.key ? 'bold' : 'normal',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          /* Mobile Header */
          <GlassHeader
            title={
              activeTab !== 'Home'
                ? t(`navigation.${activeTab.toLowerCase()}`)
                : undefined
            }
            onMenuPress={() => setIsMenuOpen(true)}
            onProfilePress={() => handleNavigate('Profile')}
          />
        )}

        {/* Main Content Area */}
        <View style={{ flex: 1 }}>
          {/* Back button for sub-screens (Internal) */}
          {subScreen && (
            <View
              style={[
                webStyles.subHeader,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={webStyles.backButton}
                onPress={() =>
                  setNavState(prev => ({ ...prev, subScreen: '' }))
                }
              >
                <Text
                  style={[
                    webStyles.backButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  ← {t('common.back')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flex: 1, padding: isMobile ? 12 : 32 }}>
            {getActiveComponent()}
          </View>
        </View>

        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <View
            style={[
              webStyles.mobileMenuOverlay,
              { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 },
            ]}
          >
            <View
              style={[
                webStyles.mobileMenu,
                {
                  backgroundColor: theme.colors.surface,
                  borderRightWidth: 1,
                  borderRightColor: theme.colors.border,
                  height: height,
                  width: width < 375 ? width * 0.8 : 280,
                },
              ]}
            >
              <TouchableOpacity
                style={webStyles.closeButton}
                onPress={() => setIsMenuOpen(false)}
              >
                <Text
                  style={[
                    webStyles.closeButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginBottom: 20, alignItems: 'center' }}
                onPress={() => {
                  handleNavigate('Profile');
                  setIsMenuOpen(false);
                }}
              >
                <Image
                  source={require('../../public/logo.png')}
                  style={{ width: 50, height: 50, marginBottom: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                  {user?.name}
                </Text>
              </TouchableOpacity>

              <ScrollView style={{ flex: 1 }}>
                {sections.map(section => (
                  <View key={section.title} style={{ marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setCollapsedSections(prev => ({
                          ...prev,
                          [section.title]: !prev[section.title],
                        }));
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          paddingLeft: 10,
                          marginBottom: 8,
                          marginTop: 8,
                          color: theme.colors.subText,
                          fontSize: 12,
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {section.title}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.subText,
                          fontSize: 12,
                          marginRight: 10,
                        }}
                      >
                        {collapsedSections[section.title] ? '▼' : '▲'}
                      </Text>
                    </TouchableOpacity>
                    {!collapsedSections[section.title] &&
                      section.items.map(item => (
                        <TouchableOpacity
                          key={item.key}
                          onPress={() => {
                            handleNavigate(item.key);
                            setIsMenuOpen(false);
                          }}
                          style={[
                            webStyles.mobileMenuItem,
                            activeTab === item.key && {
                              backgroundColor: `${theme.colors.primary}10`,
                              borderRadius: 8,
                              paddingLeft: 10,
                            },
                          ]}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                            }}
                          >
                            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color:
                                  activeTab === item.key
                                    ? theme.colors.primary
                                    : theme.colors.text,
                                fontWeight:
                                  activeTab === item.key ? 'bold' : 'normal',
                              }}
                            >
                              {item.label}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </WebNavigationContext.Provider>
  );
};

// ======= Root Export =======
export const AppNavigator = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      primary: theme.colors.primary,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handles foreground events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        // Handle notifications here if needed
      }
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (user && user.status && user.status !== 'active') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 24, marginBottom: 16 }}>🚫</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {user.status === 'pending' ? 'Account Pending' : 'Account Rejected'}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {user.status === 'pending'
            ? 'Your account is currently under review. Please check back later.'
            : 'Your account access has been restricted. Please contact support.'}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          onPress={() => signOut()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
            {t('common.logout')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onStateChange={() => {
        sessionService.updateLastActivity();
      }}
    >
      {user ? (
        Platform.OS === 'web' ? (
          <WebNavigator />
        ) : (
          <DrawerNavigator />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

// ======= Web Styles =======
const getWebStyles = (theme: any) =>
  StyleSheet.create({
    sidebar: {
      width: 260,
      height: '100vh' as any,
      position: 'sticky' as any,
      top: 0,
      paddingVertical: 24,
      ...Platform.select({
        web: {
          background: theme.colors.glass,
          backdropFilter: 'blur(16px)',
          borderRight: `1px solid ${theme.colors.glassBorder}`,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        },
        default: {
          backgroundColor: theme.colors.surface,
        },
      }),
    },
    sidebarBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 40,
      gap: 12,
    },
    sidebarLogo: {
      width: 40,
      height: 40,
    },
    sidebarTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    sidebarProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 32,
      gap: 12,
    },
    profileAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 15,
      fontWeight: '700',
    },
    profileRole: {
      fontSize: 12,
    },
    sidebarNav: {
      flex: 1,
    },
    sidebarNavItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginBottom: 4,
      gap: 16,
      borderRadius: 12,
      marginHorizontal: 16,
    },
    activeNavItem: {
      backgroundColor: 'rgba(45, 91, 255, 0.1)',
    },
    activeNavIndicator: {
      width: 4,
      height: 16,
      borderRadius: 2,
      backgroundColor: '#2D5BFF',
      position: 'absolute',
      left: 8,
    },
    navIcon: {
      fontSize: 20,
    },
    navLabel: {
      fontSize: 15,
    },
    mobileHeader: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      zIndex: 100,
    },
    subHeader: {
      height: 56,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 32,
      height: 32,
    },
    hamburgerButton: {
      padding: 8,
    },
    hamburgerText: {
      fontSize: 24,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    mobileMenuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    mobileMenu: {
      width: 280,
      padding: 24,
    },
    closeButton: {
      alignSelf: 'flex-end',
      padding: 10,
      marginBottom: 10,
    },
    closeButtonText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    mobileMenuItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 4,
    },
    mobileMenuItemText: {
      fontSize: 17,
    },
  });
