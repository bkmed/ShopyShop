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
import { stockReceptionDb, StockReception } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const StockReceptionListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [receptions, setReceptions] = useState<StockReception[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockReceptionDb.getAll();
      setReceptions(data);
    } catch (error) {
      console.error('Error loading stock receptions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredReceptions = receptions.filter(
    r =>
      r.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      default:
        return theme.colors.subText;
    }
  };

  const renderItem = ({ item }: { item: StockReception }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        navigation.navigate('StockReceptionDetail', { receptionId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.ref, { color: theme.colors.text }]}>
          {item.referenceNumber || item.id}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {t(`stockReception.${item.status}`)}
          </Text>
        </View>
      </View>

      <Text style={[styles.supplier, { color: theme.colors.subText }]}>
        {item.supplierName}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: theme.colors.subText }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.items, { color: theme.colors.text }]}>
          {item.items.length} {t('stockReception.items')}
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
      <GlassHeader
        title={t('stockReception.title')}
        rightElement={
          <TouchableOpacity
            onPress={() => navigation.navigate('StockReceptionAddEdit')}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              {t('common.add') || '+ ADD'}
            </Text>
          </TouchableOpacity>
        }
      />

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
        data={filteredReceptions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
              {t('stockReception.noReceptions')}
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
    alignItems: 'center',
    marginBottom: 12,
  },
  ref: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  supplier: {
    fontSize: 14,
    marginBottom: 16,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 16,
  },
  date: {
    fontSize: 12,
    color: '#666',
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
