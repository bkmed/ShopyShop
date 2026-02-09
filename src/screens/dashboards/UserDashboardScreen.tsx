import React, { useState, useCallback, useContext } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ordersDb } from '../../database/ordersDb';
import { productsDb } from '../../database/productsDb';
import { Product } from '../../database/schema';
import { ProductCard } from '../../components/ProductCard';

const { height } = Dimensions.get('window');

export const UserDashboardScreen = () => {
  const { t } = useTranslation();
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
      <View style={[styles.centered, { backgroundColor: '#FFF' }]}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#FFF' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Editorial Hero Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={require('../../../public/hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroTextContent}>
              <Text style={styles.heroSubtitle}>COLLECTION 2026</Text>
              <Text style={styles.heroTitle}>ESSENTIALS</Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => handleNavigate('Catalog')}
              >
                <Text style={styles.heroButtonText}>
                  {t('home.browseProducts').toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Modern Collections Grid */}
      <View style={styles.collectionGridContainer}>
        <View style={styles.collectionItem}>
          <TouchableOpacity onPress={() => handleNavigate('Catalog')}>
            <Image
              source={require('../../../public/womens.png')}
              style={styles.collectionImage}
            />
            <View style={styles.collectionOverlay}>
              <Text style={styles.collectionTitle}>WOMAN</Text>
              <Text style={styles.collectionLink}>VIEW ALL</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.collectionItem}>
          <TouchableOpacity onPress={() => handleNavigate('Catalog')}>
            <Image
              source={require('../../../public/mens.png')}
              style={styles.collectionImage}
            />
            <View style={styles.collectionOverlay}>
              <Text style={styles.collectionTitle}>MAN</Text>
              <Text style={styles.collectionLink}>VIEW ALL</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trending Minimalist Section */}
      <View style={styles.sectionContainer}>
        <View
          style={[
            styles.sectionHeaderRow,
            { borderTopWidth: 1, paddingTop: 40, borderTopColor: '#f0f0f0' },
          ]}
        >
          <Text style={styles.sectionTitle}>NEW ARRIVALS</Text>
          <TouchableOpacity onPress={() => handleNavigate('Catalog')}>
            <Text style={styles.viewAllText}>+ VIEW MORE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {trendingProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() =>
                handleNavigate('Catalog', 'ProductDetail', { id: product.id })
              }
            />
          ))}
        </View>
      </View>

      {/* Featured Editorial Section */}
      <View style={styles.editorialSection}>
        <View style={styles.editorialContent}>
          <Text style={styles.editorialLabel}>JOIN THE CLUB</Text>
          <Text style={styles.editorialHeading}>PREMIUM ACCESS</Text>
          <Text style={styles.editorialSub}>
            Exclusive drops, early access and member only benefits.
          </Text>
          <TouchableOpacity style={styles.editorialButton}>
            <Text style={styles.editorialButtonText}>SUBSCRIBE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity - High Contrast */}
      {recentOrders.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 24 }]}>
            ACTIVITY
          </Text>
          {recentOrders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.miniOrderRow}
              onPress={() => handleNavigate('Orders')}
            >
              <View>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.orderId}>
                  ORDER #{order.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.orderStatus}>
                {order.status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer Minimalist */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => handleNavigate('Profile')}
            style={styles.footerLink}
          >
            <Text style={styles.footerLinkText}>MY ACCOUNT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNavigate('Wishlist')}
            style={styles.footerLink}
          >
            <Text style={styles.footerLinkText}>WISHLIST</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNavigate('Profile')}
            style={styles.footerLink}
          >
            <Text style={styles.footerLinkText}>HELP</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} SHOPYSHOP. ALL RIGHTS RESERVED.
        </Text>
      </View>

      <View style={{ height: 60 }} />
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
    height: Platform.OS === 'web' ? height * 0.9 : height * 0.85,
    width: '100%',
  },
  heroImage: {
    flex: 1,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'flex-end',
    padding: 32,
  },
  heroTextContent: {
    alignItems: 'flex-start',
  },
  heroSubtitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 32,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 0,
  },
  heroButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  collectionGridContainer: {
    flexDirection: 'row',
    height: 600,
    width: '100%',
  },
  collectionItem: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  collectionLink: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '500',
    letterSpacing: 2,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  sectionContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#000',
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#666',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  editorialSection: {
    padding: 60,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorialContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  editorialLabel: {
    color: '#FFF',
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 16,
  },
  editorialHeading: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  editorialSub: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },
  editorialButton: {
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  editorialButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  miniOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
  },
  orderStatus: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#000',
  },
  footer: {
    paddingVertical: 100,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 40,
  },
  footerLink: {
    paddingVertical: 8,
  },
  footerLinkText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#000',
  },
  copyright: {
    fontSize: 9,
    color: '#999',
    letterSpacing: 1,
  },
});
