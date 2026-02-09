import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { inventoryDb, InventoryLog } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const StockMovementScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryDb.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading inventory logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = logs.filter(
    l =>
      l.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: InventoryLog }) => (
    <View style={[styles.logCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.logHeader}>
        <Text style={[styles.productName, { color: theme.colors.text }]}>
          {item.productName}
        </Text>
        <Text
          style={[
            styles.change,
            { color: item.change > 0 ? '#10B981' : '#EF4444' },
          ]}
        >
          {item.change > 0 ? '+' : ''}
          {item.change}
        </Text>
      </View>

      <Text style={[styles.reason, { color: theme.colors.subText }]}>
        {item.reason}
      </Text>

      <View style={styles.logFooter}>
        <Text style={[styles.date, { color: theme.colors.subText }]}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={[styles.performedBy, { color: theme.colors.subText }]}>
          👤 {item.performedBy}
        </Text>
      </View>
    </View>
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
      <GlassHeader title={t('inventory.history')} />

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
        data={filteredLogs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
              {t('inventory.noLogs') || 'No stock movements found'}
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
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  logCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  change: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reason: {
    fontSize: 14,
    marginBottom: 12,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
  },
  performedBy: {
    fontSize: 12,
  },
  empty: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
