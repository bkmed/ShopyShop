import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { reclamationsDb } from '../../database';
import { Reclamation } from '../../database/schema';

export const ReclamationDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { id } = route.params;

  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const data = await reclamationsDb.getById(id);
      setReclamation(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!reclamation) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Reclamation not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>Status</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(reclamation.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(reclamation.status) }]}>
              {t(`reclamations.${reclamation.status}`) || reclamation.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>{t('reclamations.reason')}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{reclamation.reason}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>{t('reclamations.description')}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{reclamation.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>{t('orders.orderNumber')}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{reclamation.orderId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>Date</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {new Date(reclamation.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved': return '#4CAF50';
    case 'rejected': return '#F44336';
    case 'investigating': return '#FF9800';
    default: return '#2196F3';
  }
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
  card: {
    padding: 24,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    lineHeight: 26,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 12,
  },
});
