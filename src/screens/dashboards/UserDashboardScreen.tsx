import React, { useState, useCallback, useContext } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  ImageBackground,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ordersDb } from '../../database/ordersDb';
import { productsDb } from '../../database/productsDb';
import { Product } from '../../database/schema';
import { ProductCard } from '../../components/ProductCard';

const { width, height } = Dimensions.get('window');

export const UserDashboardScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { setActiveTab } = useContext(WebNavigationContext);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNavigate = (tab: string, screen?: string, params?: any) => {
    if (Platform.OS === 'web') {
      setActiveTab(tab, screen, params);
    } else {
      if (screen) {
        // Handle nested stack navigation if needed, or just pass params to tab
        navigation.navigate(tab, { screen, params });
      } else {
        navigation.navigate(tab, params);
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [orders, products] = await Promise.all([
        user ? ordersDb.getByUserId(user.id) : Promise.resolve([]),
        productsDb.getAll(),
      ]);
      setRecentOrders(orders.slice(0, 3));
      // Simulate trending by taking first 4 active products
      setTrendingProducts(products.filter(p => p.isActive).slice(0, 4));
    } catch (error) {
      console.error('Error loading user dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user]),
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={require('../../../public/hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>NEW SEASON</Text>
            <Text style={styles.heroTitle}>{t('home.appName').toUpperCase()}</Text>
            <TouchableOpacity
              style={[styles.heroButton, { backgroundColor: theme.colors.text }]}
              onPress={() => handleNavigate('Catalog')}
            >
              <Text style={[styles.heroButtonText, { color: theme.colors.background }]}>
                {t('home.browseProducts').toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* Featured Categories */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          COLLECTIONS
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleNavigate('Catalog')} // Ideally filter by category
          >
            <Image source={require('../../../public/womens.png')} style={styles.categoryImage} />
            <Text style={styles.categoryLabel}>WOMAN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleNavigate('Catalog')}
          >
            <Image source={require('../../../public/mens.png')} style={styles.categoryImage} />
            <Text style={styles.categoryLabel}>MAN</Text>
          </TouchableOpacity>
          {/* Placeholder for KIDS/ACCESSORIES if images existed */}
        </ScrollView>
      </View>

      {/* Trending Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            TRENDING NOW
          </Text>
          <TouchableOpacity onPress={() => handleNavigate('Catalog')}>
            <Text style={[styles.viewAllText, { color: theme.colors.subText }]}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleNavigate('ProductDetail', undefined, { id: product.id })} // Adjust param passing depending on setup
            />
          ))}
        </View>
      </View>

      {/* Promotional Banner */}
      <View style={styles.promoContainer}>
        <View style={[styles.promoContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.promoTitle, { color: theme.colors.text }]}>SUMMER SALE</Text>
          <Text style={[styles.promoSubtitle, { color: theme.colors.subText }]}>Up to 50% off on selected items</Text>
          <TouchableOpacity style={{ marginTop: 16 }} onPress={() => handleNavigate('Catalog')}>
            <Text style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.text, textTransform: 'uppercase', fontSize: 12, fontWeight: '700' }}>
              Shop Sale
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders - Minimalist View */}
      {recentOrders.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 12 }]}>RECENT ORDERS</Text>
          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.miniOrderRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => handleNavigate('Orders')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.text }}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.subText }}>#{order.id.slice(0, 6)}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>{order.status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Links Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => handleNavigate('Profile')} style={styles.footerLink}>
          <Text style={[styles.footerLinkText, { color: theme.colors.subText }]}>MY ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigate('Wishlist')} style={styles.footerLink}>
          <Text style={[styles.footerLinkText, { color: theme.colors.subText }]}>WISHLIST</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigate('Proflie')} style={styles.footerLink}> {/* Typo fix later if needed */}
          <Text style={[styles.footerLinkText, { color: theme.colors.subText }]}>HELP</Text>
        </TouchableOpacity>
      </View>

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
  heroContainer: {
    height: height * 0.7, // 70% of screen height
    width: '100%',
    marginBottom: 40,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
  },
  heroOverlay: {
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 0, // Sharp edges
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionContainer: {
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  categoriesScroll: {
    overflow: 'visible',
    marginTop: 16,
  },
  categoryCard: {
    width: width * 0.7,
    height: width * 0.9,
    marginRight: 16,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryLabel: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promoContainer: {
    padding: 16,
    marginBottom: 48,
  },
  promoContent: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 16,
  },
  miniOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 40,
    borderTopWidth: 1,
    marginHorizontal: 16,
  },
  footerLink: {
    paddingVertical: 8,
  },
  footerLinkText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  }
});

