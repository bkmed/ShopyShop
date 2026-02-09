import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { pickPackDb, PickPackOrder } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const PickPackListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PickPackOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pickPackDb.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading pick & pack orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredOrders = orders.filter(
    o =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return '#10B981';
      case 'ready_to_ship':
        return '#F59E0B';
      case 'picking':
      case 'packing':
        return '#3B82F6';
      case 'pending':
        return '#6B7280';
      default:
        return theme.colors.subText;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'normal':
        return '#3B82F6';
      case 'low':
        return '#6B7280';
      default:
        return theme.colors.subText;
    }
  };

  const renderItem = ({ item }: { item: PickPackOrder }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        navigation.navigate('PickPackDetail', { pickPackOrderId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.ref, { color: theme.colors.text }]}>
            {item.orderNumber}
          </Text>
          <Text style={[styles.customer, { color: theme.colors.subText }]}>
            {item.customerName}
          </Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) + '20' },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              { color: getPriorityColor(item.priority) },
            ]}
          >
            {t(`pickPack.${item.priority}`)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {t(`pickPack.${item.status}`)}
          </Text>
        </View>
        <Text style={[styles.items, { color: theme.colors.text }]}>
          {item.items.length} {t('pickPack.orders')}
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
      <GlassHeader title={t('pickPack.title')} />

      <View style={styles.header}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder={t('common.searchPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
              {t('pickPack.noOrders')}
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
  header: {
    padding: 16,
  },
  searchInput: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    color: '#000',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ref: {
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    color: '#000',
  },
  customer: {
    fontSize: 13,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  items: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#000',
  },
  empty: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#999',
  },
});
