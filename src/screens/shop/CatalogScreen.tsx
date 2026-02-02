import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { categoriesDb } from '../../database/categoriesDb';
import { Product, Category } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../utils/currencyUtils';

export const CatalogScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange] = useState({ min: 0, max: 10000 });
  const [sortOrder, setSortOrder] = useState<
    'newest' | 'priceAsc' | 'priceDesc'
  >('newest');
  const filterAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(filterAnimation, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        productsDb.getAll(),
        categoriesDb.getAll(),
      ]);
      setProducts(p);
      setCategories(c);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const filteredProducts = products
    .filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory
        ? p.categoryId === selectedCategory
        : true;
      const matchesPrice =
        p.price >= priceRange.min && p.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOrder === 'priceAsc') return a.price - b.price;
      if (sortOrder === 'priceDesc') return b.price - a.price;
      return 0; // Default or newest
    });

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
    >
      <View style={styles.imagePlaceholder}>
        <Text style={{ fontSize: 32 }}>🎁</Text>
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.price, { color: theme.colors.primary }]}>
          {formatPrice(item.price, item.currency)}
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            /* Handled in Detail or via quick add */
            navigation.navigate('ProductDetail', { id: item.id });
          }}
        >
          <Text style={styles.addBtnText}>{t('common.view')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('navigation.catalog')}
        </Text>
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
          placeholder={t('common.search')}
          placeholderTextColor={theme.colors.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}
        >
          <Text style={{ fontSize: 18 }}>{showFilters ? '❌' : '⚙️'}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.advancedFilters,
          {
            backgroundColor: theme.colors.glass,
            borderColor: theme.colors.glassBorder,
            borderWidth: 1,
            maxHeight: filterAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 150],
            }),
            opacity: filterAnimation,
            overflow: 'hidden',
          },
        ]}
      >
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          Sort By
        </Text>
        <View style={styles.sortOptions}>
          {(['newest', 'priceAsc', 'priceDesc'] as const).map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setSortOrder(option)}
              style={[
                styles.sortBtn,
                { borderColor: theme.colors.border },
                sortOrder === option && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: sortOrder === option ? '#FFF' : theme.colors.text,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {option === 'newest'
                  ? 'Newest'
                  : option === 'priceAsc'
                  ? 'Price ↑'
                  : 'Price ↓'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor: !selectedCategory
                  ? theme.colors.primary
                  : theme.colors.surface,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={{
                color: !selectedCategory ? '#FFF' : theme.colors.text,
                fontWeight: 'bold',
              }}
            >
              {t('common.all') || 'All'}
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === cat.id
                      ? theme.colors.primary
                      : theme.colors.surface,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={{
                  color:
                    selectedCategory === cat.id ? '#FFF' : theme.colors.text,
                }}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
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
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
  },
  categoriesWrapper: {
    marginBottom: 20,
  },
  categoryList: {
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        cursor: 'pointer' as any,
      },
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  addBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
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
  filterToggle: {
    padding: 8,
  },
  advancedFilters: {
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
