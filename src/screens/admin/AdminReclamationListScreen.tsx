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
import { reclamationsDb, Reclamation } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const AdminReclamationListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reclamationsDb.getAll();
      setReclamations(data);
    } catch (error) {
      console.error('Error loading admin reclamations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredReclamations = reclamations.filter(r => {
    const matchesSearch =
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return '#10B981';
      case 'in_progress':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return theme.colors.subText;
    }
  };

  const renderItem = ({ item }: { item: Reclamation }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        navigation.navigate('AdminReclamationDetail', {
          reclamationId: item.id,
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerInfo}>
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.reason}
          </Text>
          <Text style={[styles.orderId, { color: theme.colors.subText }]}>
            {t('orders.order')} #{item.orderId}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {t(`reclamations.status.${item.status}`)}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.description, { color: theme.colors.subText }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: theme.colors.subText }]}>
          {new Date(item.createdAt).toLocaleDateString()}
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
        title={t('admin.reclamations.title') || 'Reclamation Management'}
      />

      <View style={styles.filters}>
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
        data={filteredReclamations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
              {t('admin.reclamations.noReclamations') ||
                'No reclamations found'}
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AdminReclamationAddEdit')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFF',
    marginTop: -4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filters: {
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
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
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
  priority: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  empty: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
