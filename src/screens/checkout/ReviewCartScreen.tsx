import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { GlassHeader } from '../../components/common/GlassHeader';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, clearCart } from '../../store/slices/cartSlice';
import { productsDb } from '../../database/productsDb';
import { ordersDb } from '../../database/ordersDb';
import { Product } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../utils/currencyUtils';

export const ReviewCartScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  // Params from previous screens
  const { deliveryMethod, shippingAddress, paymentMethod } = route.params || {};

  const cartItems = useSelector(selectCartItems);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productMap: Record<string, Product> = {};
        for (const item of cartItems) {
          if (!products[item.productId]) {
            const p = await productsDb.getById(item.productId);
            if (p) productMap[item.productId] = p;
          }
        }
        setProducts(prev => ({ ...prev, ...productMap }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [cartItems]);

  const subtotal = cartItems.reduce((acc, item) => {
    const p = products[item.productId];
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  const shipping = deliveryMethod?.price || 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      const order = {
        id: orderId,
        userId: user?.id || 'guest',
        userName: user?.name || shippingAddress.fullName,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: products[item.productId]?.name || 'Unknown',
          quantity: item.quantity,
          priceAtPurchase: products[item.productId]?.price || 0,
          currency: products[item.productId]?.currency || 'USD',
        })),
        totalAmount: total,
        currency: 'USD',
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: `${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.postalCode}`,
        deliveryMethod: deliveryMethod?.title,
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ordersDb.add(order as any);
      dispatch(clearCart());

      navigation.reset({
        index: 0,
        routes: [{ name: 'OrderConfirmation', params: { orderId } }],
      });
    } catch (error) {
      console.error('Error placing order:', error);
      // Show alert
    } finally {
      setProcessing(false);
    }
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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <GlassHeader
        title={t('checkout.review') || 'REVIEW'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: theme.colors.subText }]}>
          SUMMARY
        </Text>

        <View style={styles.itemsList}>
          {cartItems.map(item => {
            const product = products[item.productId];
            if (!product) return null;
            return (
              <View key={item.productId} style={styles.itemRow}>
                {product.imageUris?.[0] ? (
                  <Image
                    source={{ uri: product.imageUris[0] }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.itemImage,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <Text
                    style={[styles.itemQty, { color: theme.colors.subText }]}
                  >
                    QTY: {item.quantity}
                  </Text>
                  <Text
                    style={[styles.itemPrice, { color: theme.colors.text }]}
                  >
                    {formatPrice(
                      product.price * item.quantity,
                      product.currency,
                    )}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View
          style={[styles.infoSection, { borderTopColor: theme.colors.border }]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.subText }]}>
              DELIVERY
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {deliveryMethod?.title}
              </Text>
              <Text style={[styles.subValue, { color: theme.colors.subText }]}>
                {deliveryMethod?.time}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.subText }]}>
              ADDRESS
            </Text>
            <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: 20 }}>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {shippingAddress?.fullName}
              </Text>
              <Text
                style={[
                  styles.subValue,
                  { color: theme.colors.subText, textAlign: 'right' },
                ]}
                numberOfLines={2}
              >
                {shippingAddress?.addressLine1}, {shippingAddress?.city}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.subText }]}>
              PAYMENT
            </Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {paymentMethod === 'card'
                ? 'Credit Card'
                : paymentMethod === 'cash'
                ? 'Cash on Delivery'
                : 'Apple Pay'}
            </Text>
          </View>
        </View>

        <View
          style={[styles.summaryBox, { borderTopColor: theme.colors.border }]}
        >
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: theme.colors.subText }]}
            >
              SUBTOTAL
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: theme.colors.subText }]}
            >
              SHIPPING
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 16 }]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              TOTAL
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {formatPrice(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlePlaceOrder}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payText}>PLACE ORDER</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  scroll: {
    padding: 24,
    paddingTop: 100,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 8,
  },
  itemsList: {
    marginBottom: 40,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  itemImage: {
    width: 80,
    height: 120, // Taller aspect ratio
    resizeMode: 'cover',
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemQty: {
    fontSize: 10,
    marginBottom: 8,
    color: '#666',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    paddingVertical: 32,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    width: 80,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  subValue: {
    fontSize: 11,
    marginTop: 4,
    color: '#666',
    textAlign: 'right',
  },
  summaryBox: {
    paddingVertical: 32,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  payButton: {
    height: 56,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
