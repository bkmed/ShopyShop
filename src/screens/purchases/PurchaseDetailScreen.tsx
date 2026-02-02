import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { Order, OrderItem } from '../../database/schema';

export const PurchaseDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersDb.getById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('orders.noOrders')}
        </Text>
      </View>
    );
  }

  const renderItem = (item: OrderItem, index: number) => (
    <View
      key={index}
      style={[styles.itemRow, { borderBottomColor: theme.colors.border }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>
          {item.productName}
        </Text>
        <Text style={[styles.itemQty, { color: theme.colors.subText }]}>
          x{item.quantity}
        </Text>
      </View>
      <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
        {item.currency} {item.priceAtPurchase * item.quantity}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerId}>#{order.id}</Text>
        <Text style={styles.headerStatus}>
          {t(`orders.${order.status}`).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('orders.items')}
          </Text>
          {order.items.map((item, idx) => renderItem(item, idx))}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              {t('common.total')}
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
              {order.currency} {order.totalAmount}
            </Text>
          </View>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('checkout.shippingAddress')}
          </Text>
          <Text style={[styles.address, { color: theme.colors.subText }]}>
            {order.shippingAddress}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.reportButton,
            { borderColor: '#FF4444', borderWidth: 1 },
          ]}
          onPress={() =>
            navigation.navigate('ReclamationAdd', { orderId: order.id })
          }
        >
          <Text style={{ color: '#FF4444', fontWeight: 'bold', fontSize: 16 }}>
            ⚠️ {t('reclamations.add')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerId: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    marginTop: -10,
  },
  section: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemQty: {
    fontSize: 14,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  address: {
    fontSize: 15,
    lineHeight: 22,
  },
  reportButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
