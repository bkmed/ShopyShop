import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { selectCartItems, clearCart } from '../../store/slices/cartSlice';
import { productsDb } from '../../database/productsDb';
import { promosDb } from '../../database/promosDb';
import { ordersDb } from '../../database/ordersDb'; // Assuming this exists or will use a similar pattern
import { Product } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';

export const CheckoutScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(user?.addresses?.[0] || '');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [cartItems]);

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
      console.error('Error loading checkout products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => {
      const p = products[item.productId];
      return acc + (p?.price || 0) * item.quantity;
    }, 0);
    return { subtotal, total: Math.max(0, subtotal - discount) };
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      // Logic for category-based discount
      // For simplicity, we'll check if the promo applies to ANY category in the cart
      // or if we have a robust calculation per item.
      // Let's assume promosDb handles logic returns a flat discount amount or we need to calc it here.
      // Updated promosDb.validatePromo returns percentage.

      // We need to apply percentage to eligible items.
      let totalDiscount = 0;

      const promoObj = await promosDb.getByCode(promoCode);
      if (!promoObj) {
        Alert.alert(
          t('common.error'),
          t('cart.invalidPromo') || 'Invalid Promo Code',
        );
        return;
      }

      await promosDb.validatePromo(promoCode, 'all'); // Check generic validity
      // Actually we need to check per item.

      for (const item of cartItems) {
        const p = products[item.productId];
        if (p) {
          const itemRelevance = await promosDb.validatePromo(
            promoCode,
            p.categoryId,
          );
          if (itemRelevance > 0) {
            totalDiscount += (p.price * item.quantity * itemRelevance) / 100;
          }
        }
      }

      if (totalDiscount > 0) {
        setDiscount(totalDiscount);
        Alert.alert(
          t('common.success'),
          `${t('cart.discountApplied') || 'Discount Applied'}: ${formatPrice(
            totalDiscount,
          )}`,
        );
      } else {
        Alert.alert(
          t('common.info'),
          t('cart.promoNotApplicable') ||
            'Promo code not applicable to these items',
        );
        setDiscount(0);
      }
    } catch (error) {
      console.error('Promo error:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert(
        t('common.error'),
        t('cart.addressRequired') || 'Address is required',
      );
      return;
    }

    setProcessing(true);
    try {
      const { total } = calculateTotal();
      const order = {
        userId: user?.id || 'guest',
        userName: user?.name,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: products[item.productId]?.name || 'Unknown',
          quantity: item.quantity,
          priceAtPurchase: products[item.productId]?.price || 0,
          currency: products[item.productId]?.currency || 'USD',
        })),
        totalAmount: total,
        currency: 'USD', // Should be dynamic
        status: 'pending',
        paymentStatus: 'pending' as const, // explicitly cast to literal type
        shippingAddress: address,
        billingAddress: address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Assuming ordersDb.add exists and accepts this structure
      // If ordersDb doesn't exist yet, we might need to mock or create it.
      // Based on file list, ordersDb.ts exists.
      await ordersDb.add(order as any);

      dispatch(clearCart());
      Alert.alert(
        t('common.success'),
        t('cart.orderPlaced') || 'Order placed successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
      );
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, total } = calculateTotal();

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('cart.shippingAddress') || 'Shipping Address'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your address"
          placeholderTextColor={theme.colors.subText}
          multiline
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('cart.paymentMethod') || 'Payment Method'}
        </Text>
        <View style={styles.paymentOptions}>
          {['card', 'cash'].map(method => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                paymentMethod === method && {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primary + '10',
                },
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={{ fontSize: 24 }}>
                {method === 'card' ? '💳' : '💵'}
              </Text>
              <Text style={[styles.paymentText, { color: theme.colors.text }]}>
                {method === 'card' ? 'Credit Card' : 'Cash on Delivery'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('cart.promoCode') || 'Promo Code'}
        </Text>
        <View style={styles.promoRow}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginBottom: 0,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="CODE123"
            placeholderTextColor={theme.colors.subText}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleApplyPromo}
          >
            <Text style={styles.applyBtnText}>
              {t('common.apply') || 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('cart.subtotal')}
          </Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {formatPrice(subtotal)}
          </Text>
        </View>
        {discount > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: '#4CAF50' }]}>
              {t('cart.discount') || 'Discount'}
            </Text>
            <Text style={[styles.value, { color: '#4CAF50' }]}>
              -{formatPrice(discount)}
            </Text>
          </View>
        )}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            {t('cart.total')}
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
            {formatPrice(total)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkoutBtn, { backgroundColor: theme.colors.primary }]}
        onPress={handlePlaceOrder}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.checkoutBtnText}>
            {t('cart.placeOrder') || 'Place Order'}
          </Text>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  paymentText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  applyBtn: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  checkoutBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
