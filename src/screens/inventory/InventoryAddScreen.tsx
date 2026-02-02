import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { inventoryDb } from '../../database/inventoryDb';
import { Product } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';

export const InventoryAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const modal = useModal();
  const toast = useToast();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialProduct = route.params?.product as Product;

  const [form, setForm] = useState({
    productId: initialProduct?.id || '',
    change: '',
    reason: '',
  });

  const handleAdjust = async () => {
    if (!form.productId || !form.change || !form.reason) {
      AlertService.showError(
        toast,
        t('common.errorEmptyFields') || 'Please fill required fields'
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
        t('inventory.adjusted') || 'Inventory adjusted successfully'
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Error adjusting inventory:', error);
      AlertService.showError(toast, error.message || t('common.saveError'));
    }
  };

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
            <Text style={[styles.label, { color: theme.colors.subText }]}>
              Product SKU
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={form.productId}
              onChangeText={text => setForm({ ...form, productId: text })}
              placeholder={t('products.skuPlaceholder')}
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('inventory.adjustmentAmount') || 'Adjustment (e.g. +10 or -5)'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.change}
            onChangeText={text => setForm({ ...form, change: text })}
            keyboardType="numbers-and-punctuation"
            placeholder={t('inventory.changePlaceholder')}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('inventory.reason') || 'Reason'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.reason}
            onChangeText={text => setForm({ ...form, reason: text })}
            placeholder={t('inventory.reasonPlaceholder')}
          />
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
});
