import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { reclamationsDb, Reclamation } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const AdminReclamationAddEditScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { reclamationId } = route.params || {};
  const isEditing = !!reclamationId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Reclamation['status']>('pending');

  useEffect(() => {
    if (isEditing) {
      loadReclamation();
    }
  }, [reclamationId]);

  const loadReclamation = async () => {
    try {
      const reclamation = await reclamationsDb.getById(reclamationId);
      if (reclamation) {
        setOrderId(reclamation.orderId);
        setReason(reclamation.reason);
        setDescription(reclamation.description);
        setStatus(reclamation.status);
      } else {
        Alert.alert(
          t('common.error'),
          t('common.notFound') || 'Reclamation not found',
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading reclamation:', error);
      Alert.alert(
        t('common.error'),
        t('common.loadFailed') || 'Failed to load reclamation',
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!orderId || !reason || !description) {
      Alert.alert(
        t('common.error'),
        t('common.required') || 'Please fill all required fields',
      );
      return;
    }

    try {
      setLoading(true);
      const reclamationData: Partial<Reclamation> = {
        orderId,
        reason,
        description,
        status,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await reclamationsDb.update(reclamationId, reclamationData);
        Alert.alert(
          t('common.success'),
          t('common.saved') || 'Saved successfully',
        );
      } else {
        await reclamationsDb.add({
          ...reclamationData,
          createdAt: new Date().toISOString(),
          userId: 'admin-entry',
        } as Omit<Reclamation, 'id'>);
        Alert.alert(
          t('common.success'),
          t('common.added') || 'Added successfully',
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving reclamation:', error);
      Alert.alert(t('common.error'), t('common.saveError') || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const StatusButton = ({
    value,
    label,
    color,
  }: {
    value: Reclamation['status'];
    label: string;
    color: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        {
          backgroundColor: status === value ? color : theme.colors.surface,
          borderColor: color,
          borderWidth: 1,
        },
      ]}
      onPress={() => setStatus(value)}
    >
      <Text
        style={[
          styles.statusButtonText,
          { color: status === value ? '#FFF' : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (initialLoading) {
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
        title={
          isEditing
            ? t('adminReclamations.edit') || 'Edit Claim'
            : t('adminReclamations.add') || 'New Claim'
        }
        showBack
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('common.orderId') || 'Order ID'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={orderId}
            onChangeText={setOrderId}
            placeholder="ORD-001"
            placeholderTextColor={theme.colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('reclamations.reason')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={reason}
            onChangeText={setReason}
            placeholder={t('reclamations.reasonPlaceholder') || 'Enter reason'}
            placeholderTextColor={theme.colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('reclamations.description')}
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('reclamations.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.subText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('common.status')}
          </Text>
          <View style={styles.statusGrid}>
            <StatusButton
              value="pending"
              label={t('reclamations.status.pending')}
              color="#F59E0B"
            />
            <StatusButton
              value="in_progress"
              label={t('reclamations.status.in_progress')}
              color="#3B82F6"
            />
            <StatusButton
              value="resolved"
              label={t('reclamations.status.resolved')}
              color="#10B981"
            />
            <StatusButton
              value="rejected"
              label={t('reclamations.status.rejected')}
              color="#EF4444"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
