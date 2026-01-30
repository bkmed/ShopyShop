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
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { useAuth } from '../../context/AuthContext';

export const OrderAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [form, setForm] = useState({
    userId: user?.id || '',
    userName: user?.name || '',
    totalAmount: '',
    currency: 'USD',
    shippingAddress: '',
    billingAddress: '',
  });

  const handleCreate = async () => {
    if (!form.totalAmount || !form.shippingAddress) {
      Alert.alert(
        t('common.error'),
        t('common.errorEmptyFields') || 'Please fill required fields',
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
      Alert.alert(
        t('common.success'),
        t('orders.created') || 'Order created successfully',
      );
      navigation.goBack();
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert(t('common.error'), t('common.saveError'));
    }
  };

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
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('orders.totalAmount')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.totalAmount}
            onChangeText={text => setForm({ ...form, totalAmount: text })}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('orders.shippingAddress')}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.shippingAddress}
            onChangeText={text => setForm({ ...form, shippingAddress: text })}
            multiline
            numberOfLines={3}
            placeholder="Enter full address..."
          />
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
});
