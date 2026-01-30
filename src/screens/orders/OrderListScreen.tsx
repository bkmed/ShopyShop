import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { Order } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

export const OrderListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin' || user?.role === 'gestionnaire_de_stock') {
        const data = await ordersDb.getAll();
        setOrders(data);
      } else if (user) {
        const data = await ordersDb.getByUserId(user.id);
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [user]),
  );

  const filteredOrders = orders.filter(
    o =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.orderId, { color: theme.colors.text }]}>
          #{item.id}
        </Text>
        <Text style={[styles.status, { color: theme.colors.primary }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.date, { color: theme.colors.subText }]}>
          {item.createdAt}
        </Text>
        <Text style={[styles.total, { color: theme.colors.text }]}>
          {item.currency} {item.totalAmount}
        </Text>
      </View>
      {user?.role === 'admin' && item.userName && (
        <Text style={[styles.userLabel, { color: theme.colors.subText }]}>
          {t('orders.customer')}: {item.userName}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('navigation.orders')}
        </Text>
        {user?.role === 'admin' && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate('OrderAdd')}
          >
            <Text style={styles.addButtonText}>+ {t('common.add')}</Text>
          </TouchableOpacity>
        )}
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
          placeholder={t('orders.searchPlaceholder') || 'Search by Order ID...'}
          placeholderTextColor={theme.colors.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.colors.subText }}>
                {t('orders.noOrders') || 'No orders found.'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    height: 50,
  },
  searchInput: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userLabel: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
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
});
