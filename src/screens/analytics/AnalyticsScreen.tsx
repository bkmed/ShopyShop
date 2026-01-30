import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  analyticsService,
  AnalyticsData,
} from '../../services/analyticsService';
import { Theme } from '../../theme';

const { width } = Dimensions.get('window');

export const AnalyticsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const result = await analyticsService.getAnalytics();
    setData(result);
    setLoading(false);
  };

  if (loading || !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const StatCard = ({ label, value, icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Text style={[styles.icon, { color }]}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('navigation.analytics')}</Text>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Revenue"
          value={`$${data.totalRevenue}`}
          icon="💰"
          color="#4CAF50"
        />
        <StatCard
          label="Total Orders"
          value={data.totalOrders}
          icon="📦"
          color={theme.colors.primary}
        />
        <StatCard
          label="Avg Order Value"
          value={`$${data.averageOrderValue}`}
          icon="📈"
          color={theme.colors.secondary}
        />
        <StatCard
          label="Conversion Rate"
          value={`${data.conversionRate}%`}
          icon="🎯"
          color={theme.colors.warning}
        />
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly Sales</Text>
        <View style={styles.placeholderChart}>
          {data.weeklySales.map((s, i) => (
            <View key={i} style={styles.chartBarContainer}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: Math.min(s.amount / 10, 150),
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <Text style={styles.barLabel}>{s.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: {
      width: (width - 52) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      ...theme.shadows.small,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: { fontSize: 20 },
    statLabel: { fontSize: 12, color: theme.colors.subText },
    statValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    chartSection: {
      marginTop: 30,
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 16,
      ...theme.shadows.small,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    placeholderChart: {
      height: 200,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      paddingBottom: 20,
    },
    chartBarContainer: { alignItems: 'center', gap: 8 },
    chartBar: { width: 30, borderRadius: 4 },
    barLabel: { fontSize: 10, color: theme.colors.subText },
  });
