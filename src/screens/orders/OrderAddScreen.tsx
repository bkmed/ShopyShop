import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { useAuth } from '../../context/AuthContext';

import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';

export const OrderAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const toast = useToast();

  const [form, setForm] = useState({
    userId: user?.id || '',
    userName: user?.name || '',
    totalAmount: '',
    currency: 'USD',
    shippingAddress: '',
    billingAddress: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.totalAmount.trim()) {
      newErrors.totalAmount = t('common.required');
    } else if (isNaN(parseFloat(form.totalAmount))) {
      newErrors.totalAmount = t('common.invalidAmount');
    }
    if (!form.shippingAddress.trim()) {
      newErrors.shippingAddress = t('common.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      AlertService.showError(
        toast,
        t('common.fillRequired') || 'Please fill required fields',
      );
      return;
    }

    try {
      await ordersDb.add({
        userId: form.userId,
        userName: form.userName,
        items: [], // Simplification for direct creation
        totalAmount: parseFloat(form.totalAmount),
        currency: form.currency,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: form.shippingAddress,
        billingAddress: form.billingAddress || form.shippingAddress,
      });

      AlertService.showSuccess(
        toast,
        t('orders.created') || 'Order created successfully',
      );
      navigation.goBack();
    } catch (error) {
      console.error('Error creating order:', error);
      AlertService.showError(toast, t('common.saveError'));
    }
  };

  const RequiredLabel = ({ label }: { label: string }) => (
    <View style={{ flexDirection: 'row' }}>
      <Text style={[styles.label, { color: theme.colors.subText }]}>
        {label}
      </Text>
      <Text style={{ color: theme.colors.error, marginLeft: 4 }}>*</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('orders.createNew') || 'Create New Order'}
        </Text>

        <View style={styles.formGroup}>
          <RequiredLabel label={t('orders.totalAmount')} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.totalAmount ? theme.colors.error : 'transparent',
                borderWidth: errors.totalAmount ? 1 : 0,
              },
            ]}
            value={form.totalAmount}
            onChangeText={text => {
              setForm({ ...form, totalAmount: text });
              if (errors.totalAmount) setErrors({ ...errors, totalAmount: '' });
            }}
            keyboardType="decimal-pad"
            placeholder={t('common.placeholderAmount')}
          />
          {errors.totalAmount && (
            <Text style={styles.errorText}>{errors.totalAmount}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label={t('orders.shippingAddress')} />
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.shippingAddress ? theme.colors.error : 'transparent',
                borderWidth: errors.shippingAddress ? 1 : 0,
              },
            ]}
            value={form.shippingAddress}
            onChangeText={text => {
              setForm({ ...form, shippingAddress: text });
              if (errors.shippingAddress) setErrors({ ...errors, shippingAddress: '' });
            }}
            multiline
            numberOfLines={3}
            placeholder={t('orders.addressPlaceholder')}
          />
          {errors.shippingAddress && (
            <Text style={styles.errorText}>{errors.shippingAddress}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreate}
        >
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  saveBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
