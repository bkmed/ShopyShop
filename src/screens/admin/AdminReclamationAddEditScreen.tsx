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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const newErrors: Record<string, string> = {};
    if (!orderId.trim()) newErrors.orderId = t('common.required');
    if (!reason.trim()) newErrors.reason = t('common.required');
    if (!description.trim()) newErrors.description = t('common.required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

  const RequiredLabel = ({ label }: { label: string }) => (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label}
      </Text>
      <Text style={{ color: '#EF4444', marginLeft: 4 }}>*</Text>
    </View>
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
          <RequiredLabel label={t('common.orderId') || 'Order ID'} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.orderId ? '#EF4444' : theme.colors.border,
              },
            ]}
            value={orderId}
            onChangeText={text => {
              setOrderId(text);
              if (errors.orderId) setErrors({ ...errors, orderId: '' });
            }}
            placeholder="ORD-001"
            placeholderTextColor={theme.colors.subText}
          />
          {errors.orderId && (
            <Text style={styles.errorText}>{errors.orderId}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label={t('reclamations.reason')} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.reason ? '#EF4444' : theme.colors.border,
              },
            ]}
            value={reason}
            onChangeText={text => {
              setReason(text);
              if (errors.reason) setErrors({ ...errors, reason: '' });
            }}
            placeholder={t('reclamations.reasonPlaceholder') || 'Enter reason'}
            placeholderTextColor={theme.colors.subText}
          />
          {errors.reason && (
            <Text style={styles.errorText}>{errors.reason}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label={t('reclamations.description')} />
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.description
                  ? '#EF4444'
                  : theme.colors.border,
              },
            ]}
            value={description}
            onChangeText={text => {
              setDescription(text);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            placeholder={t('reclamations.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.subText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
