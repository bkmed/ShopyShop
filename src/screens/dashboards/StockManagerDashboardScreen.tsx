import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { productsDb } from '../../database/productsDb';
import { inventoryDb } from '../../database/inventoryDb';

export const StockManagerDashboardScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation<any>();

  const [stats, setStats] = useState({
    lowStock: 0,
    totalItems: 0,
    recentLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [products, logs] = await Promise.all([
        productsDb.getAll(),
        inventoryDb.getLogs(),
      ]);

      const lowStock = products.filter(p => p.stockQuantity < 10).length;

      setStats({
        lowStock,
        totalItems: products.reduce((acc, p) => acc + p.stockQuantity, 0),
        recentLogs: logs.length,
      });
    } catch (error) {
      console.error('Error loading stock manager stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        {t('inventory.inventoryControl')}
      </Text>

      <View style={styles.mainStats}>
        <View
          style={[
            styles.stockAlertCard,
            { backgroundColor: stats.lowStock > 0 ? '#FF3B3020' : '#4CD96420' },
          ]}
        >
          <Text style={{ fontSize: 40 }}>
            {stats.lowStock > 0 ? '⚠️' : '✅'}
          </Text>
          <View style={{ marginLeft: 20 }}>
            <Text
              style={[
                styles.alertValue,
                { color: stats.lowStock > 0 ? '#FF3B30' : '#4CD964' },
              ]}
            >
              {stats.lowStock} {t('inventory.lowStockAlerts')}
            </Text>
            <Text style={[styles.alertSub, { color: theme.colors.subText }]}>
              {t('inventory.immediateAttention')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[styles.smallStat, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.smallValue, { color: theme.colors.text }]}>
            {stats.totalItems}
          </Text>
          <Text style={[styles.smallLabel, { color: theme.colors.subText }]}>
            {t('inventory.totalUnits')}
          </Text>
        </View>
        <View
          style={[styles.smallStat, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.smallValue, { color: theme.colors.text }]}>
            {stats.recentLogs}
          </Text>
          <Text style={[styles.smallLabel, { color: theme.colors.subText }]}>
            {t('inventory.recentMovements')}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('inventory.warehouseOps')}
      </Text>
      <View style={styles.opsGrid}>
        <TouchableOpacity
          style={[styles.opBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={{ fontSize: 24 }}>📋</Text>
          <Text style={[styles.opText, { color: theme.colors.text }]}>
            {t('inventory.fullInventory')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('StockReceptionList')}
        >
          <Text style={{ fontSize: 24 }}>📥</Text>
          <Text style={[styles.opText, { color: theme.colors.text }]}>
            {t('navigation.stockReception') || 'Reception'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('PickPackList')}
        >
          <Text style={{ fontSize: 24 }}>📦</Text>
          <Text style={[styles.opText, { color: theme.colors.text }]}>
            {t('navigation.pickPack') || 'Pick & Pack'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('SupplierList')}
        >
          <Text style={{ fontSize: 24 }}>🚚</Text>
          <Text style={[styles.opText, { color: theme.colors.text }]}>
            {t('suppliers.title') || 'Suppliers'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 24,
      marginTop: 10,
    },
    mainStats: {
      marginBottom: 24,
    },
    stockAlertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 28,
      borderRadius: 28,
      ...theme.shadows.medium,
    },
    alertValue: {
      fontSize: 22,
      fontWeight: '800',
    },
    alertSub: {
      fontSize: 13,
      marginTop: 4,
      fontWeight: '500',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    smallStat: {
      width: '48%',
      padding: 24,
      borderRadius: 24,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    smallValue: {
      fontSize: 28,
      fontWeight: '900',
    },
    smallLabel: {
      fontSize: 13,
      marginTop: 4,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 20,
    },
    opsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      paddingBottom: 40,
    },
    opBtn: {
      flex: 1,
      minWidth: '45%',
      padding: 24,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.small,
    },
    opText: {
      marginTop: 12,
      fontWeight: '700',
      fontSize: 14,
      textAlign: 'center',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
