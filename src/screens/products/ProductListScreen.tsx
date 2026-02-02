import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { categoriesDb } from '../../database/categoriesDb';
import { Product, Category } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';
import { rbacService } from '../../services/rbacService';
import { useCurrency } from '../../utils/currencyUtils';

export const ProductListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const isStockManager =
    rbacService.isStockManager(user) || rbacService.isAdmin(user);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [data, categoriesData] = await Promise.all([
        productsDb.getAll(),
        categoriesDb.getAll(),
      ]);
      const isAdminOrManager =
        rbacService.isAdmin(user) || rbacService.isStockManager(user);

      const categoryMap = new Map<string, Category>(
        categoriesData.map(c => [c.id, c]),
      );

      const filteredByRole = isAdminOrManager
        ? data
        : data.filter(p => {
            const productAvailable =
              !p.availableDate || new Date(p.availableDate) <= new Date();
            const category = categoryMap.get(p.categoryId);
            const categoryAvailable =
              !category ||
              !category.availableDate ||
              new Date(category.availableDate) <= new Date();
            return productAvailable && categoryAvailable;
          });

      setProducts(filteredByRole);
      setFilteredProducts(filteredByRole);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = products.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery),
    );
    setFilteredProducts(filtered);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
    >
      <View
        style={[
          styles.productIconContainer,
          { backgroundColor: theme.colors.primary + '10' },
        ]}
      >
        <Text style={{ fontSize: 32 }}>📦</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.productName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.productDetails, { color: theme.colors.subText }]}>
          {t('products.productStock')}: {item.stockQuantity}
        </Text>
        <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
          {formatPrice(
            isStockManager ? item.unitPrice || item.price : item.price,
            item.currency,
          )}
          {isStockManager && ` (${t('inventory.unitPrice')})`}
        </Text>
      </View>
      <View
        style={[
          styles.arrowContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.primary }}>➔</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('products.title')}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ProductAdd')}
        >
          <Text style={styles.addButtonText}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text style={{ marginRight: 8 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('products.search')}
          placeholderTextColor={theme.colors.subText}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.colors.subText }}>
                {t('products.noProducts')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  productIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 12,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
});
