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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { inventoryDb } from '../../database/inventoryDb';
import { Product } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';

export const InventoryAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialProduct = route.params?.product as Product;

  const [form, setForm] = useState({
    productId: initialProduct?.id || '',
    change: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdjust = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.productId) newErrors.productId = t('common.required');
    if (!form.change) newErrors.change = t('common.required');
    if (!form.reason) newErrors.reason = t('common.required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      AlertService.showError(
        toast,
        t('common.errorEmptyFields') || 'Please fill required fields',
      );
      return;
    }

    try {
      await inventoryDb.adjustStock(
        form.productId,
        parseInt(form.change, 10),
        form.reason,
        user?.id || 'anonymous',
      );
      AlertService.showSuccess(
        toast,
        t('inventory.adjusted') || 'Inventory adjusted successfully',
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Error adjusting inventory:', error);
      AlertService.showError(toast, error.message || t('common.saveError'));
    }
  };

  const RequiredLabel = ({ label }: { label: string }) => (
    <View style={{ flexDirection: 'row' }}>
      <Text style={[styles.label, { color: theme.colors.subText }]}>
        {label}
      </Text>
      <Text style={{ color: theme.colors.error || '#EF4444', marginLeft: 4 }}>
        *
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('inventory.adjustStock') || 'Adjust Stock Level'}
        </Text>

        {!initialProduct && (
          <View style={styles.formGroup}>
            <RequiredLabel label="Product SKU" />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: errors.productId
                    ? theme.colors.error
                    : 'transparent',
                  borderWidth: errors.productId ? 1 : 0,
                },
              ]}
              value={form.productId}
              onChangeText={text => {
                setForm({ ...form, productId: text });
                if (errors.productId) setErrors({ ...errors, productId: '' });
              }}
              placeholder={t('products.skuPlaceholder')}
              placeholderTextColor={theme.colors.subText}
            />
            {errors.productId && (
              <Text style={styles.errorText}>{errors.productId}</Text>
            )}
          </View>
        )}

        <View style={styles.formGroup}>
          <RequiredLabel
            label={
              t('inventory.adjustmentAmount') || 'Adjustment (e.g. +10 or -5)'
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.change ? theme.colors.error : 'transparent',
                borderWidth: errors.change ? 1 : 0,
              },
            ]}
            value={form.change}
            onChangeText={text => {
              setForm({ ...form, change: text });
              if (errors.change) setErrors({ ...errors, change: '' });
            }}
            keyboardType="numbers-and-punctuation"
            placeholder={t('inventory.changePlaceholder')}
            placeholderTextColor={theme.colors.subText}
          />
          {errors.change && (
            <Text style={styles.errorText}>{errors.change}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <RequiredLabel label={t('inventory.reason') || 'Reason'} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.reason ? theme.colors.error : 'transparent',
                borderWidth: errors.reason ? 1 : 0,
              },
            ]}
            value={form.reason}
            onChangeText={text => {
              setForm({ ...form, reason: text });
              if (errors.reason) setErrors({ ...errors, reason: '' });
            }}
            placeholder={t('inventory.reasonPlaceholder')}
            placeholderTextColor={theme.colors.subText}
          />
          {errors.reason && (
            <Text style={styles.errorText}>{errors.reason}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleAdjust}
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
