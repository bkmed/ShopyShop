import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';
import { reclamationsDb } from '../../database';

export const ReclamationAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const toast = useToast();
  const { user } = useAuth();

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = ['Order not received', 'Damaged item', 'Wrong item', 'Other'];

  const handleSubmit = async () => {
    if (!reason || !description) {
      AlertService.showError(toast, t('common.required'));
      return;
    }

    setLoading(true);
    try {
      await reclamationsDb.add({
        userId: user?.id || 'guest',
        orderId: orderId || 'N/A',
        reason,
        description,
        status: 'pending',
      });

      AlertService.showSuccess(
        toast,
        t('reclamations.submitted') || 'Claim submitted',
      );
      navigation.goBack();
    } catch (error) {
      console.error(error);
      AlertService.showError(toast, t('common.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('reclamations.reason') || 'Reason'}
        </Text>
        <View style={styles.reasonsContainer}>
          {reasons.map(r => (
            <TouchableOpacity
              key={r}
              style={[
                styles.reasonBtn,
                reason === r && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
                { borderColor: theme.colors.border },
              ]}
              onPress={() => setReason(r)}
            >
              <Text
                style={[
                  styles.reasonText,
                  { color: reason === r ? '#FFF' : theme.colors.text },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('orders.orderNumber') || 'Order ID (Optional)'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={orderId}
          onChangeText={setOrderId}
          placeholder={t('reclamations.orderIdPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('reclamations.description') || 'Description'}
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder={t('reclamations.descriptionPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {t('common.submit') || 'Submit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    padding: 20,
    borderRadius: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reasonBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
