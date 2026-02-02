import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { reclamationDb } from '../../database/reclamationDb';
import { Reclamation } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

export const ReclamationDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const route = useRoute<any>();
  const { id } = route.params;

  const [reclamation, setReclamation] = useState<Reclamation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReclamation = async () => {
      try {
        setLoading(true);
        const data = await reclamationDb.getById(id);
        setReclamation(data);
      } catch (error) {
        console.error('Error loading reclamation:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReclamation();
  }, [id]);

  const handleUpdateStatus = async (newStatus: Reclamation['status']) => {
    await reclamationDb.updateStatus(id, newStatus);
    setReclamation(prev =>
      prev
        ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() }
        : null,
    );
  };

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

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!reclamation) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('common.noData')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: getStatusColor(reclamation.status) },
        ]}
      >
        <Text style={styles.headerStatus}>
          {reclamation.status.toUpperCase()}
        </Text>
        <Text style={styles.headerDate}>
          {t('reclamations.submitted')}: {reclamation.createdAt}
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('reclamations.reason')}
          </Text>
          <Text style={[styles.reasonText, { color: theme.colors.text }]}>
            {reclamation.reason}
          </Text>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('reclamations.description')}
          </Text>
          <Text
            style={[styles.descriptionText, { color: theme.colors.subText }]}
          >
            {reclamation.description}
          </Text>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('reclamations.orderId')}
          </Text>
          <Text
            style={[
              styles.orderIdText,
              { color: theme.colors.primary, fontWeight: 'bold' },
            ]}
          >
            #{reclamation.orderId}
          </Text>
        </View>

        {user?.role === 'admin' && (
          <View
            style={[styles.section, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('common.update')} {t('reclamations.status')}
            </Text>
            <View style={styles.btnRow}>
              {['pending', 'investigating', 'resolved', 'rejected'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusBtn,
                    {
                      backgroundColor:
                        reclamation.status === s
                          ? getStatusColor(s as any)
                          : 'transparent',
                      borderColor: getStatusColor(s as any),
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleUpdateStatus(s as any)}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      {
                        color:
                          reclamation.status === s
                            ? '#FFF'
                            : getStatusColor(s as any),
                      },
                    ]}
                  >
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerStatus: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  headerDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
  },
  content: {
    padding: 20,
    marginTop: -10,
  },
  section: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  orderIdText: {
    fontSize: 18,
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
