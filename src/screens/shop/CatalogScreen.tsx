import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { Product } from '../../database/schema';
import { useTranslation } from 'react-i18next';

export const CatalogScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const all = await productsDb.getAll();
      setProducts(all);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('navigation.catalog')}
      </Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 24 }}>📦</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {item.currency} {item.price}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 20 },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
});
