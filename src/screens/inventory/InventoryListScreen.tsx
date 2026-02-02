import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { categoriesDb } from '../../database/categoriesDb';
import { Product, Category } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';
import { Dropdown } from '../../components/Dropdown';

export const InventoryListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const styles = React.useMemo(() => createStyles(theme), [theme]);

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
    p => selectedCategory === 'all' || p.categoryId === selectedCategory,
  );

  const categoryOptions = [
    { label: t('common.all') || 'All Categories', value: 'all' },
    ...categories.map(c => ({
      label: c.name,
      value: c.id,
    })),
  ];

  const renderItem = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.categoryId);
    const lowStock = item.stockQuantity < 10;
    const stockValue = (item.unitPrice || item.price) * item.stockQuantity;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('InventoryDetail', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: item.imageUris?.[0] || 'https://via.placeholder.com/100',
            }}
            style={styles.productImage}
          />
          <View style={styles.cardInfo}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.sku, { color: theme.colors.subText }]}>
              SKU: {item.id.slice(0, 8)}
            </Text>
            {category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Text
                  style={[styles.categoryText, { color: theme.colors.primary }]}
                >
                  {category.name}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: lowStock
                    ? '#FF4444' + '20'
                    : theme.colors.success + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: lowStock
                      ? '#FF4444'
                      : theme.colors.success || '#4CD964',
                  },
                ]}
              >
                {lowStock ? t('inventory.lowStock') : t('common.active')}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('inventory.quantity')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {item.stockQuantity}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('inventory.unitPrice')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatPrice(item.unitPrice || item.price, item.currency)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('inventory.totalValue')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatPrice(stockValue, item.currency)}
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
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('InventoryAdd')}
        >
          <Text style={styles.addBtnText}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Dropdown
          label={t('categories.filter') || 'Filter by Category'}
          data={categoryOptions}
          value={selectedCategory}
          onSelect={setSelectedCategory}
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
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
      fontWeight: '800',
    },
    addBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    addBtnText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    filterContainer: {
      marginBottom: 16,
      zIndex: 1000, // For Dropdown visibility
    },
    listContent: {
      paddingBottom: 100,
    },
    card: {
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      padding: 16,
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 12,
      backgroundColor: theme.colors.border,
    },
    cardInfo: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    sku: {
      fontSize: 12,
      marginBottom: 6,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
    },
    statusContainer: {
      justifyContent: 'flex-start',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    cardFooter: {
      flexDirection: 'row',
      borderTopWidth: 1,
      padding: 12,
      backgroundColor: 'rgba(0,0,0,0.02)',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 10,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
