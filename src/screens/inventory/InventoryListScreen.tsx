import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { categoriesDb } from '../../database/categoriesDb';
import { Product, Category } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';

export const InventoryListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsDb.getAll(),
        categoriesDb.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, []),
  );

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.categoryId);
    const lowStock = item.stockQuantity < 10;
    const stockValue = (item.unitPrice || item.price) * item.stockQuantity;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('InventoryDetail', { id: item.id })}
      >
        <View style={styles.proRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
            <Text style={{ fontSize: 24 }}>📦</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              {category && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{category.name}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.sku, { color: theme.colors.subText }]}>
              #{item.id.slice(0, 8)}...
            </Text>
          </View>
          <View style={styles.stockInfo}>
            <Text
              style={[
                styles.quantity,
                {
                  color: lowStock ? '#FF4444' : theme.colors.success || '#4CD964',
                },
              ]}
            >
              {item.stockQuantity}
            </Text>
            <Text style={[styles.unit, { color: theme.colors.subText }]}>
              {t('inventory.units') || 'Units'}
            </Text>
          </View>
        </View>

        <View style={[styles.proFooter, { borderTopColor: theme.colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Unit Price</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatPrice(item.unitPrice || item.price, item.currency)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Stock Value</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatPrice(stockValue, item.currency)}</Text>
          </View>
          <View style={styles.statEnd}>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Status</Text>
            <Text style={[styles.statValue, { color: lowStock ? '#FF4444' : theme.colors.success || '#4CD964' }]}>
              {lowStock ? 'Low Stock' : 'Good'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('navigation.inventory')}
        </Text>
        <TouchableOpacity
          style={[styles.adjustBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('InventoryAdd')}
        >
          <Text style={styles.adjustBtnText}>
            {t('inventory.adjust') || 'Adjust'}
          </Text>
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
          placeholder={
            t('inventory.searchPlaceholder') || 'Search inventory...'
          }
          placeholderTextColor={theme.colors.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
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
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  adjustBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adjustBtnText: {
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
  },
  searchInput: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 16,
  },
  stat: {
    flex: 1,
  },
  statEnd: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sku: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 22,
    fontWeight: '900',
  },
  unit: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
