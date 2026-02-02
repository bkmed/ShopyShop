import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
// We'll assume a reclamationsDb exists or we create it.
// Given the Phase 5 plan, I need to create the system.
// I'll create a local db mock for now or use a new file.
// I'll create reclamationsDb.ts in the next step.
// For now, I'll import it as if it exists.
import { reclamationsDb } from '../../database';
import { Reclamation } from '../../database/schema';

export const ReclamationListScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReclamations();
    const unsubscribe = navigation.addListener('focus', loadReclamations);
    return unsubscribe;
  }, [navigation]);

  const loadReclamations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await reclamationsDb.getByUserId(user.id);
      setReclamations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Reclamation }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('ReclamationDetail', { id: item.id })}
    >
      <View style={styles.header}>
        <Text style={[styles.reason, { color: theme.colors.text }]}>
          {item.reason}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {t(`reclamations.${item.status}`) || item.status}
        </Text>
      </View>
      <Text style={[styles.date, { color: theme.colors.subText }]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text
        style={[styles.desc, { color: theme.colors.subText }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'investigating':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ReclamationAdd')}
      >
        <Text style={styles.addBtnText}>
          + {t('reclamations.add') || 'New Claim'}
        </Text>
      </TouchableOpacity>

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
            <View style={styles.empty}>
              <Text style={{ color: theme.colors.subText }}>
                {t('common.noResult')}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reason: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
});
