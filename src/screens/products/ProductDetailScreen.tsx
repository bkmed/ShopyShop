import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useContext } from 'react';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { productsDb } from '../../database/productsDb';
import { rbacService } from '../../services/rbacService';
import { wishlistDb } from '../../database/wishlistDb';
import { addToCart } from '../../store/slices/cartSlice';
import { Product } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';

export const ProductDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { setActiveTab } = useContext(WebNavigationContext);
  const route = useRoute<any>();
  const { id } = route.params;

  const { user } = useAuth();
  const isStockManager = rbacService.isStockManager(user);
  const isAdmin = rbacService.isAdmin(user);
  const isManager = isStockManager || isAdmin;
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    loadProduct();
    checkWishlist();
  }, [id]);

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

  const checkWishlist = () => {
    if (user) {
      const wishlisted = wishlistDb.isWishlisted(id);
      setIsWishlisted(wishlisted);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      Alert.alert(t('common.error'), t('session_expired'));
      return;
    }
    if (isWishlisted) {
      await wishlistDb.remove(id);
    } else if (product) {
      await wishlistDb.add(product.id);
    }
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (shouldNavigate = false) => {
    if (!user) {
      Alert.alert(t('common.error'), t('session_expired'));
      return;
    }
    if (product) {
      dispatch(addToCart({ productId: product.id, quantity }));
      if (shouldNavigate) {
        if (Platform.OS === 'web') {
          setActiveTab('Cart');
        } else {
          navigation.navigate('Cart');
        }
      } else {
        Alert.alert(t('common.success'), t('cart.itemAdded'));
      }
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(true);
  };

  const handleDelete = async () => {
    Alert.alert(t('common.deleteTitle'), t('products.deleteConfirm'), [
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

  const screenStyles = createStyles(theme);

  if (loading) {
    return (
      <View
        style={[
          screenStyles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          screenStyles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('products.noProducts')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        screenStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          screenStyles.headerImage,
          { backgroundColor: theme.colors.primary + '10' },
        ]}
      >
        <Text style={{ fontSize: 120 }}>📦</Text>
      </View>

      <View
        style={[
          screenStyles.content,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={screenStyles.titleRow}>
          <Text style={[screenStyles.name, { color: theme.colors.text }]}>
            {product.name}
          </Text>
          <TouchableOpacity
            onPress={toggleWishlist}
            style={screenStyles.wishlistIcon}
          >
            <Text style={{ fontSize: 32 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[screenStyles.price, { color: theme.colors.primary }]}>
          {formatPrice(
            isManager ? product.unitPrice || product.price : product.price,
            product.currency,
          )}
          {isManager && ` (${t('inventory.unitPrice')})`}
        </Text>

        <View
          style={[
            screenStyles.stockBadge,
            {
              backgroundColor:
                product.stockQuantity > 0 ? '#4CD96420' : '#FF3B3020',
            },
          ]}
        >
          <Text
            style={[
              screenStyles.stockText,
              { color: product.stockQuantity > 0 ? '#4CD964' : '#FF3B30' },
            ]}
          >
            {product.stockQuantity > 0
              ? t('products.inStock')
              : t('products.outOfStock')}{' '}
            ({product.stockQuantity})
          </Text>
        </View>

        {product.fiche && (
          <View style={screenStyles.section}>
            <Text
              style={[screenStyles.sectionTitle, { color: theme.colors.text }]}
            >
              {t('inventory.fiche')}
            </Text>
            <Text
              style={[
                screenStyles.description,
                { color: theme.colors.subText },
              ]}
            >
              {product.fiche}
            </Text>
          </View>
        )}

        <View style={screenStyles.section}>
          <Text
            style={[screenStyles.sectionTitle, { color: theme.colors.text }]}
          >
            {t('products.productDescription')}
          </Text>
          <Text
            style={[screenStyles.description, { color: theme.colors.subText }]}
          >
            {product.description}
          </Text>

          <View style={screenStyles.statsContainer}>
            <View
              style={[
                screenStyles.statItem,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[
                  screenStyles.statLabel,
                  { color: theme.colors.subText },
                ]}
              >
                {t('products.productStock')}
              </Text>
              <Text
                style={[screenStyles.statValue, { color: theme.colors.text }]}
              >
                {product.stockQuantity}
              </Text>
            </View>
            <View
              style={[
                screenStyles.statItem,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[
                  screenStyles.statLabel,
                  { color: theme.colors.subText },
                ]}
              >
                {t('products.productSKU')}
              </Text>
              <Text
                style={[screenStyles.statValue, { color: theme.colors.text }]}
              >
                {product.id}
              </Text>
            </View>
          </View>
        </View>

        {isManager && (
          <View style={screenStyles.actions}>
            <TouchableOpacity
              style={[
                screenStyles.editButton,
                { borderColor: theme.colors.primary, borderWidth: 1 },
              ]}
              onPress={() => navigation.navigate('ProductAdd', { product })}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {t('common.edit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                screenStyles.deleteButton,
                { backgroundColor: '#FF4444' },
              ]}
              onPress={handleDelete}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isStockManager && (
        <View
          style={[
            screenStyles.footer,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
            },
          ]}
        >
          <View style={screenStyles.quantityContainer}>
            <TouchableOpacity
              style={[
                screenStyles.quantityBtn,
                { backgroundColor: theme.colors.background },
              ]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text
                style={[
                  screenStyles.quantityBtnText,
                  { color: theme.colors.text },
                ]}
              >
                -
              </Text>
            </TouchableOpacity>
            <Text style={[screenStyles.quantity, { color: theme.colors.text }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              style={[
                screenStyles.quantityBtn,
                { backgroundColor: theme.colors.background },
              ]}
              onPress={() =>
                setQuantity(Math.min(product.stockQuantity, quantity + 1))
              }
            >
              <Text
                style={[
                  screenStyles.quantityBtnText,
                  { color: theme.colors.text },
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

          <View style={screenStyles.buttonGroup}>
            <TouchableOpacity
              style={[
                screenStyles.addToCartBtn,
                { borderColor: theme.colors.primary, borderWidth: 1 },
              ]}
              onPress={() => handleAddToCart(false)}
            >
              <Text style={[screenStyles.addToCartText, { color: theme.colors.primary }]}>
                {t('cart.addToCart')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                screenStyles.buyNowBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleBuyNow}
            >
              <Text style={screenStyles.buyNowText}>
                {t('cart.buyNow') || 'Buy Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerImage: {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 24,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -32,
      minHeight: 500,
      ...theme.shadows.large,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    name: {
      fontSize: 28,
      fontWeight: '900',
      flex: 1,
      marginRight: 16,
    },
    wishlistIcon: {
      padding: 8,
    },
    price: {
      fontSize: 28,
      fontWeight: '900',
      marginBottom: 12,
    },
    stockBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 24,
    },
    stockText: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '900',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      lineHeight: 26,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    statItem: {
      flex: 0.48,
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    statLabel: {
      fontSize: 10,
      textTransform: 'uppercase',
      marginBottom: 6,
      fontWeight: '700',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingBottom: 40,
    },
    editButton: {
      flex: 0.48,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    deleteButton: {
      flex: 0.48,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      padding: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      padding: 4,
    },
    quantityBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityBtnText: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    quantity: {
      paddingHorizontal: 16,
      fontSize: 18,
      fontWeight: 'bold',
    },
    buttonGroup: {
      flex: 1,
      flexDirection: 'row',
      marginLeft: 20,
      gap: 12,
    },
    addToCartBtn: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addToCartText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    buyNowBtn: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buyNowText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
