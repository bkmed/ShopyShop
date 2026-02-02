import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../store';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
} from '../../store/slices/cartSlice';
import { productsDb } from '../../database/productsDb';
import { Product, CartItem } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';

interface ExtendedCartItem extends CartItem {
  product: Product | null;
}

export const CartScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const { formatPrice } = useCurrency();
  const { setActiveTab } = useContext(WebNavigationContext);
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [items, setItems] = useState<ExtendedCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        const extendedItems = await Promise.all(
          cartItems.map(async item => {
            const product = await productsDb.getById(item.productId);
            return { ...item, product };
          }),
        );
        setItems(extendedItems);
      } catch (error) {
        console.error('Error loading cart products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [cartItems]);

  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQty }));
    }
  };

  const total = items.reduce((acc, item) => {
    if (item.product) {
      return acc + item.product.price * item.quantity;
    }
    return acc;
  }, 0);

  const renderItem = ({ item }: { item: ExtendedCartItem }) => {
    if (!item.product) return null;
    return (
      <View
        style={[styles.cartItem, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.imagePlaceholder}>
          <Text style={{ fontSize: 32 }}>🛍️</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.product.name}
          </Text>
          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
            {formatPrice(item.product.price, item.product.currency)}
          </Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              onPress={() => handleUpdateQty(item.productId, item.quantity - 1)}
              style={[
                styles.qtyBtn,
                { borderColor: theme.colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={{ color: theme.colors.text }}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: theme.colors.text }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => handleUpdateQty(item.productId, item.quantity + 1)}
              style={[
                styles.qtyBtn,
                { borderColor: theme.colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={{ color: theme.colors.text }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => dispatch(removeFromCart(item.productId))}
        >
          <Text style={{ color: '#FF4444', fontSize: 20 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('navigation.cart')}
        </Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => dispatch(clearCart())}>
            <Text style={{ color: '#FF4444' }}>
              {t('cart.clear') || 'Clear'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 80 }}>🛒</Text>
          <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
            {t('cart.empty') || 'Your cart is empty'}
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              if (Platform.OS === 'web') {
                setActiveTab('Catalog');
              } else {
                navigation.navigate('Catalog');
              }
            }}
          >
            <Text style={styles.shopBtnText}>
              {t('cart.shop_now') || 'Shop Now'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.productId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.colors.glass,
                borderTopColor: theme.colors.glassBorder,
                borderTopWidth: 1,
              },
              Platform.OS === 'web' &&
                ({ backdropFilter: 'blur(16px)' } as any),
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                {t('cart.total') || 'Total'}
              </Text>
              <Text
                style={[styles.totalAmount, { color: theme.colors.primary }]}
              >
                {formatPrice(total)}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() =>
                Alert.alert(
                  t('cart.checkout'),
                  t('cart.featureUnderConstruction'),
                )
              }
            >
              <Text style={styles.checkoutBtnText}>
                {t('cart.checkout') || 'Checkout'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      marginTop: 10,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
    },
    listContent: {
      padding: 24,
      paddingBottom: 160,
    },
    cartItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderRadius: 24,
      marginBottom: 16,
      ...theme.shadows.small,
    },
    imagePlaceholder: {
      width: 90,
      height: 90,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.03)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 6,
    },
    price: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 12,
    },
    itemPrice: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 12,
    },
    qtyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.02)',
    },
    qtyText: {
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 44 : 24,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      ...Platform.select({
        web: {
          boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
        },
        default: {
          elevation: 20,
        },
      }),
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalAmount: {
      fontSize: 28,
      fontWeight: '900',
    },
    checkoutBtn: {
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    checkoutBtnText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 24,
      marginBottom: 32,
      textAlign: 'center',
    },
    shopBtn: {
      paddingHorizontal: 48,
      paddingVertical: 18,
      borderRadius: 20,
      ...theme.shadows.small,
    },
    shopBtnText: {
      color: '#FFF',
      fontWeight: '800',
      fontSize: 16,
    },
  });
