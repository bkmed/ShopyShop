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
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Product, Category } from '../../database/schema';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../utils/currencyUtils';
import { productsDb } from '../../database/productsDb';
import { categoriesDb } from '../../database/categoriesDb';

const { width } = Dimensions.get('window');
const MytekProductCard = ({ product, onPress }: { product: Product; onPress: () => void }) => {
  const { formatPrice } = useCurrency();

  return (
    <TouchableOpacity style={styles.mytekCard} onPress={onPress}>
      <View style={styles.mytekCardImageContainer}>
        {product.imageUris?.[0] ? (
          <Image source={{ uri: product.imageUris[0] }} style={styles.mytekCardImage} />
        ) : (
          <Text style={{ fontSize: 40 }}>📦</Text>
        )}
        {product.stockQuantity > 0 ? (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>En Stock</Text>
          </View>
        ) : (
          <View style={[styles.stockBadge, { backgroundColor: '#999' }]}>
            <Text style={styles.stockBadgeText}>Sur Commande</Text>
          </View>
        )}
      </View>
      <View style={styles.mytekCardDetails}>
        <Text style={styles.mytekCardName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.mytekCardPrice}>{formatPrice(product.price, product.currency)}</Text>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Text style={styles.addToCartBtnText}>AJOUTER AU PANIER</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const UserDashboardScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { setActiveTab } = useContext(WebNavigationContext);

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      const [products, allCategories] = await Promise.all([
        productsDb.getAll(),
        categoriesDb.getAll(),
      ]);
      // Simulate trending by taking first 4 active products
      setTrendingProducts(products.filter((p: Product) => p.isActive).slice(0, 4));
      setCategories(allCategories.slice(0, 8)); // Take first 8 for "Rayons"
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
      {/* Mytek Top Header - Contact & Info */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderContent}>
          <Text style={styles.topHeaderText}>{t('common.welcome')}</Text>
          <View style={styles.topHeaderRight}>
            <TouchableOpacity style={styles.topHeaderLink}>
              <Text style={styles.topHeaderLinkText}>36 360 000</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topHeaderLink}>
              <Text style={styles.topHeaderLinkText}>{t('common.ourStores')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mytek Main Header - Logo & Search */}
      <View style={styles.mainHeader}>
        <View style={styles.mainHeaderRow}>
          <Image
            source={{ uri: 'https://mk-media.mytek.tn/media/logo/stores/1/LOGO-MYTEK-176PX-INVERSE.png' }}
            style={styles.mytekLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder={t('common.searchPlaceholder')}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>{t('common.search')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rayons / Categories (Horizontal Scroll) */}
      <View style={styles.rayonsContainer}>
        <Text style={styles.rayonsTitle}>{t('home.allRayons').toUpperCase()}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rayonsList}>
          {categories.map((cat: Category) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.rayonItem}
              onPress={() => handleNavigate('Catalog', 'CategoryDetail', { categoryId: cat.id })}
            >
              <View style={styles.rayonIcon}>
                <Text style={{ fontSize: 20 }}>📦</Text>
              </View>
              <Text style={styles.rayonText}>{cat.name.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* New Arrivals Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mytekSectionTitle}>{t('home.newArrivalsMytek').toUpperCase()}</Text>
          <TouchableOpacity onPress={() => handleNavigate('Catalog')}>
            <Text style={styles.mytekViewAll}>{t('common.viewAll').toUpperCase()} &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {trendingProducts.map((product: Product) => (
            <MytekProductCard
              key={product.id}
              product={product}
              onPress={() =>
                handleNavigate('Catalog', 'ProductDetail', { id: product.id })
              }
            />
          ))}
        </View>
      </View>

      {/* Newsletter / Club Promo */}
      <View style={styles.newsletterSection}>
        <Text style={styles.newsletterTitle}>{t('home.requestQuote').toUpperCase()}</Text>
        <Text style={styles.newsletterSub}>{t('home.requestQuoteDesc')}</Text>
        <TouchableOpacity style={styles.newsletterBtn}>
          <Text style={styles.newsletterBtnText}>{t('common.contactUs').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Rich Footer */}
      <View style={styles.richFooter}>
        <View style={styles.footerColumn}>
          <Text style={styles.footerColTitle}>SERVICE CLIENT</Text>
          <Text style={styles.footerLink}>36 360 000</Text>
          <Text style={styles.footerLink}>contact@mytek.tn</Text>
          <Text style={styles.footerLink}>Lun-Ven: 8h-19h / Sam: 8h-15h</Text>
        </View>
        <View style={styles.footerColumn}>
          <Text style={styles.footerColTitle}>INFORMATIONS</Text>
          <TouchableOpacity><Text style={styles.footerLink}>À propos de Mytek</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Nos Magasins</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Conditions Générales de Vente</Text></TouchableOpacity>
        </View>
        <View style={styles.footerColumn}>
          <Text style={styles.footerColTitle}>MON COMPTE</Text>
          <TouchableOpacity><Text style={styles.footerLink}>Se connecter</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Mes Commandes</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Ma Liste de souhaits</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} MYTEK TUNISIE. {t('common.copyrightText').toUpperCase()}
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
  topHeader: {
    height: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  topHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topHeaderText: {
    fontSize: 12,
    color: '#333',
  },
  topHeaderRight: {
    flexDirection: 'row',
    gap: 15,
  },
  topHeaderLink: {
    paddingVertical: 4,
  },
  topHeaderLinkText: {
    fontSize: 12,
    color: '#d61920',
    fontWeight: '600',
  },
  mainHeader: {
    padding: 20,
    backgroundColor: '#005596',
  },
  mainHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mytekLogo: {
    width: 150,
    height: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  searchBar: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#E6E6E6',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#DDD',
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  rayonsContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rayonsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#005596',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  rayonsList: {
    paddingLeft: 20,
  },
  rayonItem: {
    width: 100,
    marginRight: 10,
    alignItems: 'center',
  },
  rayonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 8,
  },
  rayonText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  sectionContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#d61920',
    paddingBottom: 10,
  },
  mytekSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
  },
  mytekViewAll: {
    fontSize: 12,
    color: '#005596',
    fontWeight: '700',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  mytekCard: {
    width: Platform.OS === 'web' ? '23%' : (width - 50) / 2,
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
    overflow: 'hidden',
  },
  mytekCardImageContainer: {
    aspectRatio: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mytekCardImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  stockBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  stockBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mytekCardDetails: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9F9F9',
  },
  mytekCardName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    height: 32,
    lineHeight: 16,
    marginBottom: 8,
  },
  mytekCardPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#d61920',
    marginBottom: 10,
  },
  addToCartBtn: {
    backgroundColor: '#005596',
    paddingVertical: 8,
    borderRadius: 2,
    alignItems: 'center',
  },
  addToCartBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  newsletterSection: {
    padding: 40,
    backgroundColor: '#005596',
    alignItems: 'center',
  },
  newsletterTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  newsletterSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
  },
  newsletterBtn: {
    backgroundColor: '#ffcc00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 4,
  },
  newsletterBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  richFooter: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    padding: 40,
    backgroundColor: '#333',
    justifyContent: 'space-between',
    gap: 20,
  },
  footerColumn: {
    flex: 1,
    marginBottom: Platform.OS === 'web' ? 0 : 20,
  },
  footerColTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#d61920',
    paddingBottom: 5,
    alignSelf: 'flex-start',
  },
  footerLink: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 10,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  copyright: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
  },
});
