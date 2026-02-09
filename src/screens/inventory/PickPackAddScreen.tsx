import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb, pickPackDb, Order, PickPackOrder } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const PickPackAddScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allOrders, allPickPack] = await Promise.all([
        ordersDb.getAll(),
        pickPackDb.getAll(),
      ]);

      // Filter for orders that are pending/processing AND don't have a pick/pack task yet
      const existingPPOrderIds = new Set(allPickPack.map(pp => pp.orderId));

      const availableOrders = allOrders.filter(
        o =>
          (o.status === 'pending' || o.status === 'processing') &&
          !existingPPOrderIds.has(o.id),
      );

      setOrders(availableOrders);
    } catch (error) {
      console.error('Error loading available orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleCreatePickPack = async (order: Order) => {
    try {
      const pickPackData: Omit<
        PickPackOrder,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        orderId: order.id,
        orderNumber: `ORD-${order.id.slice(-6).toUpperCase()}`, // Using last 6 chars for display
        customerId: order.userId,
        customerName: order.userName || t('common.guest'),
        status: 'pending',
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          picked: false,
          packed: false,
        })),
        shippingAddress: order.shippingAddress || '',
        priority: 'normal',
      };

      const newId = await pickPackDb.add(pickPackData);
      Alert.alert(
        t('common.success'),
        t('pickPack.createdSuccessfully') || 'Pick & Pack task created',
      );
      navigation.navigate('PickPackDetail', { pickPackOrderId: newId });
    } catch (error) {
      console.error('Error creating pick pack task:', error);
      Alert.alert(t('common.error'), t('common.saveError'));
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCreatePickPack(item)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.ref, { color: theme.colors.text }]}>
            #{item.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={[styles.customer, { color: theme.colors.subText }]}>
            {item.userName || t('common.guest')}
          </Text>
        </View>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>
          {item.totalAmount.toFixed(2)} {item.currency}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: theme.colors.subText }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.itemsCount, { color: theme.colors.text }]}>
          {item.items.length} {t('common.items')}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      <GlassHeader title={t('pickPack.selectOrder') || 'Select Order'} />

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
              {t('pickPack.noPendingOrders') || 'No pending orders found'}
            </Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
  },
  card: {
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ref: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  customer: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
  },
  itemsCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
