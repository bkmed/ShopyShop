import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { inventoryDb } from '../../database/inventoryDb';
import { productsDb } from '../../database/productsDb';
import { Product, InventoryLog } from '../../database/schema';

export const InventoryDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prod, history] = await Promise.all([
          productsDb.getById(id),
          inventoryDb.getLogs(id),
        ]);
        setProduct(prod);
        setLogs(history);
      } catch (error) {
        console.error('Error loading inventory details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

  if (!product) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('inventory.notFound')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {product.name}
        </Text>
        <Text style={[styles.sku, { color: theme.colors.subText }]}>
          SKU: {product.id}
        </Text>
        <View style={styles.stockBadge}>
          <Text style={[styles.stockVal, { color: theme.colors.primary }]}>
            {product.stockQuantity}
          </Text>
          <Text style={[styles.stockLabel, { color: theme.colors.subText }]}>
            {t('inventory.currentStock') || 'CURRENT STOCK'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('inventory.history') || 'Stock History'}
          </Text>
          <TouchableOpacity
            style={[
              styles.adjustBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate('InventoryAdd', { product })}
          >
            <Text style={styles.adjustBtnText}>
              {t('inventory.adjust') || 'Adjust'}
            </Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <Text
            style={{
              color: theme.colors.subText,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {t('inventory.noHistory') || 'No stock movement recorded yet.'}
          </Text>
        ) : (
          logs.map(log => (
            <View
              key={log.id}
              style={[
                styles.logItem,
                { borderLeftColor: log.change > 0 ? '#4CD964' : '#FF3B30' },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.logReason, { color: theme.colors.text }]}>
                  {log.reason}
                </Text>
                <Text style={[styles.logDate, { color: theme.colors.subText }]}>
                  {log.createdAt}
                </Text>
              </View>
              <Text
                style={[
                  styles.logChange,
                  { color: log.change > 0 ? '#4CD964' : '#FF3B30' },
                ]}
              >
                {log.change > 0 ? '+' : ''}
                {log.change}
              </Text>
            </View>
          ))
        )}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sku: {
    fontSize: 14,
    marginTop: 4,
  },
  stockBadge: {
    marginTop: 20,
    alignItems: 'center',
  },
  stockVal: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  stockLabel: {
    fontSize: 10,
    letterSpacing: 2,
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adjustBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adjustBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logItem: {
    padding: 16,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  logReason: {
    fontSize: 16,
    fontWeight: '600',
  },
  logDate: {
    fontSize: 12,
    marginTop: 4,
  },
  logChange: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
