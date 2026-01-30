import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { Product } from '../../database/schema';

export const ProductDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productsDb.getById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(t('common.confirmDelete'), t('products.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await productsDb.delete(id);
          navigation.goBack();
        },
      },
    ]);
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

  if (!product) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('products.noProducts')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[styles.headerImage, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
      >
        <Text style={{ fontSize: 80 }}>🛍️</Text>
      </View>

      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {product.name}
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            {product.currency} {product.price}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: theme.colors.primary + '15' },
          ]}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {product.stockQuantity > 0
              ? t('catalog.inStock')
              : t('catalog.outOfStock')}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('products.productDescription')}
        </Text>
        <Text style={[styles.description, { color: theme.colors.subText }]}>
          {product.description}
        </Text>

        <View style={styles.statsContainer}>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('products.productStock')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {product.stockQuantity}
            </Text>
          </View>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('products.productSKU')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {product.id}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.editButton,
              { borderColor: theme.colors.primary, borderWidth: 1 },
            ]}
            onPress={() => navigation.navigate('ProductAdd', { product })}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {t('common.edit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
            onPress={handleDelete}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerImage: {
      height: 380,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 32,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      marginTop: -40,
      minHeight: 600,
      ...theme.shadows.large,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    name: {
      fontSize: 32,
      fontWeight: '900',
      flex: 1,
      marginRight: 16,
    },
    price: {
      fontSize: 28,
      fontWeight: '900',
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 12,
    },
    description: {
      fontSize: 17,
      lineHeight: 28,
      marginBottom: 32,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
    },
    statItem: {
      flex: 0.48,
      padding: 20,
      borderRadius: 24,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    statLabel: {
      fontSize: 13,
      textTransform: 'uppercase',
      marginBottom: 6,
      fontWeight: '600',
      letterSpacing: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '900',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingBottom: 60,
    },
    editButton: {
      flex: 0.48,
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(45, 91, 255, 0.05)',
    },
    deleteButton: {
      flex: 0.48,
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
