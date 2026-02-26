import React, { useState, useContext, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';
import { WebNavigationContext } from '../navigation/WebNavigationContext';
import { productsDb } from '../database/productsDb';
import { categoriesDb } from '../database/categoriesDb';
import { ordersDb } from '../database/ordersDb';
import { Product, Category, Order } from '../database/schema';
import { useCurrency } from '../utils/currencyUtils';
import { rbacService } from '../services/rbacService';

// ======= Helper Components =======

const FeaturedCard = ({
  product,
  theme,
  onPress,
  formatPrice,
}: {
  product: Product;
  theme: Theme;
  onPress: (p: Product) => void;
  formatPrice: (p: number, c: string) => string;
}) => {
  return (
    <TouchableOpacity
      style={[styles.featuredCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(product)}
    >
      <View
        style={[
          styles.productImagePlaceholder,
          { backgroundColor: theme.colors.primary + '10' },
        ]}
      >
        <Text style={{ fontSize: 40 }}>🛍️</Text>
      </View>
      <View style={styles.productInfo}>
        <Text
          style={[styles.productName, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
          {formatPrice(product.price, product.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CategoryItem = ({
  category,
  theme,
  onPress,
}: {
  category: Category;
  theme: Theme;
  onPress: (c: Category) => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(category)}
    >
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: theme.colors.primary + '15' },
        ]}
      >
        <Text style={{ fontSize: 24 }}>📦</Text>
      </View>
      <Text
        style={[styles.categoryName, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

// ======= Main HomeScreen =======

export const HomeScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { setActiveTab } = useContext(WebNavigationContext);
  const { formatPrice } = useCurrency();
  useWindowDimensions();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allProducts, allCategories] = await Promise.all([
        productsDb.getAll(),
        categoriesDb.getAll(),
      ]);

      setProducts(allProducts);
      setCategories(allCategories);

      if (user) {
        const userOrders = await ordersDb.getByUserId(user.id);
        setRecentOrders(userOrders);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Role-based redirection for Mobile
      if (Platform.OS !== 'web') {
        if (rbacService.isAdmin(user) || rbacService.isStockManager(user)) {
          navigation.navigate('DashboardTab');
          return;
        }
      }
      loadData();
    }, [user]),
  );

  const handleProductPress = (product: Product) => {
    if (Platform.OS === 'web') {
      setActiveTab('Catalog', 'ProductDetails', { id: product.id });
    } else {
      navigation.navigate('CatalogTab', {
        screen: 'ProductDetails',
        params: { id: product.id },
      });
    }
  };

  const handleCategoryPress = (category: Category) => {
    if (Platform.OS === 'web') {
      setActiveTab('Categories', '', { categoryId: category.id });
    } else {
      navigation.navigate('CatalogTab', {
        screen: 'CategoryProducts',
        params: { categoryId: category.id },
      });
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Welcome Banner */}
      <View
        style={[
          styles.welcomeBanner,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>
            {t('home.greeting')}, {user?.name || t('roles.anonyme')}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {t('home.welcome_desc') || 'Discover amazing products today.'}
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: '#FFF' }]}
            onPress={() => setActiveTab('Catalog', '')}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>
              Explore Now
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bannerIconContainer}>
          <Text style={{ fontSize: 80 }}>🛒</Text>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('home.featured') || 'Featured Products'} ✨
          </Text>
          <TouchableOpacity onPress={() => setActiveTab('Catalog', '')}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {t('common.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={products.slice(0, 5)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <FeaturedCard
              product={item}
              theme={theme}
              onPress={handleProductPress}
              formatPrice={formatPrice}
            />
          )}
          contentContainerStyle={styles.listPadding}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, marginHorizontal: 20 },
          ]}
        >
          {t('navigation.categories')}
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map(cat => (
            <CategoryItem
              key={cat.id}
              category={cat}
              theme={theme}
              onPress={handleCategoryPress}
            />
          ))}
        </View>
      </View>

      {/* Recent Orders for logged in users */}
      {user && recentOrders.length > 0 && (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, marginHorizontal: 20 },
            ]}
          >
            {t('navigation.orders')}
          </Text>
          {recentOrders.slice(0, 3).map(order => (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() =>
                setActiveTab('Orders', 'OrderDetails', { orderId: order.id })
              }
            >
              <View style={styles.orderInfo}>
                <Text style={[styles.orderId, { color: theme.colors.text }]}>
                  Order #{order.id.slice(0, 8)}...
                </Text>
                <Text
                  style={[styles.orderDate, { color: theme.colors.subText }]}
                >
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.orderStatusContainer}>
                <Text
                  style={[styles.orderPrice, { color: theme.colors.primary }]}
                >
                  {formatPrice(order.totalAmount, order.currency)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: theme.colors.primary + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.orderStatus,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBanner: {
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    borderRadius: 20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  bannerIconContainer: {
    padding: 10,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listPadding: {
    paddingHorizontal: 15,
  },
  featuredCard: {
    width: 200,
    marginHorizontal: 5,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderStatusContainer: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatus: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
