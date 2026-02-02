import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { reclamationDb } from '../../database/reclamationDb';
import { Reclamation } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

export const ReclamationListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReclamations = async () => {
    try {
      setLoading(true);
      if (user) {
        const data = await reclamationDb.getByUserId(user.id);
        setReclamations(data);
      }
    } catch (error) {
      console.error('Error loading reclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReclamations();
    }, [user]),
  );

  const getStatusColor = (status: Reclamation['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'investigating':
        return '#2D5BFF';
      case 'resolved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return theme.colors.subText;
    }
  };

  const renderItem = ({ item }: { item: Reclamation }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('ReclamationDetail', { id: item.id })}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.reason, { color: theme.colors.text }]}>
          {item.reason}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '15' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={[styles.date, { color: theme.colors.subText }]}>
        {item.createdAt}
      </Text>
      <Text style={[styles.orderId, { color: theme.colors.subText }]}>
        {t('reclamations.orderId')}: {item.orderId}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('reclamations.title')}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('ReclamationAdd')}
        >
          <Text style={styles.addButtonText}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reclamations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>📝</Text>
              <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                {t('common.noData')}
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
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
  list: {
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reason: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  date: {
    fontSize: 13,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
