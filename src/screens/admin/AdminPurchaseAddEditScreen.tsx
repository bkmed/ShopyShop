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
import { purchasesDb, Purchase } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const AdminPurchaseAddEditScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { purchaseId } = route.params || {};
  const isEditing = !!purchaseId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Form state
  const [userName, setUserName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [status, setStatus] = useState<Purchase['status']>('pending');
  const [currency, setCurrency] = useState('USD');
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      loadPurchase();
    }
  }, [purchaseId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!orderId.trim()) newErrors.orderId = t('common.required');
    if (!userName.trim()) newErrors.userName = t('common.required');
    if (!totalAmount.trim()) newErrors.totalAmount = t('common.required');
    else if (isNaN(parseFloat(totalAmount)))
      newErrors.totalAmount = t('common.invalidAmount') || 'Invalid amount';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadPurchase = async () => {
    try {
      const purchase = await purchasesDb.getById(purchaseId);
      if (purchase) {
        setUserName(purchase.userName);
        setTotalAmount(purchase.totalAmount.toString());
        setStatus(purchase.status);
        setCurrency(purchase.currency);
        setOrderId(purchase.orderId);
      } else {
        Alert.alert(
          t('common.error'),
          t('common.notFound') || 'Purchase not found',
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading purchase:', error);
      Alert.alert(
        t('common.error'),
        t('common.loadFailed') || 'Failed to load purchase',
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert(
        t('common.error'),
        t('common.fillRequired') || 'Please fill all required fields correctly',
      );
      return;
    }

    try {
      setLoading(true);
      const purchaseData: Partial<Purchase> = {
        userName,
        totalAmount: parseFloat(totalAmount),
        status,
        currency,
        orderId,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await purchasesDb.update(purchaseId, purchaseData);
        Alert.alert(
          t('common.success'),
          t('common.saved') || 'Saved successfully',
        );
      } else {
        await purchasesDb.add({
          ...purchaseData,
          createdAt: new Date().toISOString(),
          items: [], // Init efficiently
          userId: 'admin-entry', // Placeholder or select user
        } as Omit<Purchase, 'id'>);
        Alert.alert(
          t('common.success'),
          t('common.added') || 'Added successfully',
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving purchase:', error);
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
    value: Purchase['status'];
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
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={styles.requiredStar}>*</Text>
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
            ? t('adminPurchases.edit') || 'Edit Purchase'
            : t('adminPurchases.add') || 'Add Purchase'
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
          <RequiredLabel label={t('common.user') || 'User'} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.userName ? '#EF4444' : theme.colors.border,
              },
            ]}
            value={userName}
            onChangeText={text => {
              setUserName(text);
              if (errors.userName) setErrors({ ...errors, userName: '' });
            }}
            placeholder={t('common.namePlaceholder') || 'Enter name'}
            placeholderTextColor={theme.colors.subText}
          />
          {errors.userName && (
            <Text style={styles.errorText}>{errors.userName}</Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <RequiredLabel label={t('common.amount') || 'Amount'} />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: errors.totalAmount
                    ? '#EF4444'
                    : theme.colors.border,
                },
              ]}
              value={totalAmount}
              onChangeText={text => {
                setTotalAmount(text);
                if (errors.totalAmount)
                  setErrors({ ...errors, totalAmount: '' });
              }}
              placeholder="0.00"
              placeholderTextColor={theme.colors.subText}
              keyboardType="numeric"
            />
            {errors.totalAmount && (
              <Text style={styles.errorText}>{errors.totalAmount}</Text>
            )}
          </View>
          <View style={[styles.formGroup, { width: 100 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {(t('common.currency') || 'Currency').toUpperCase()}
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
              value={currency}
              onChangeText={setCurrency}
              placeholder="USD"
              placeholderTextColor={theme.colors.subText}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {(t('common.status') || 'Status').toUpperCase()}
          </Text>
          <View style={styles.statusGrid}>
            <StatusButton
              value="pending"
              label={t('orders.status.pending')}
              color="#F59E0B"
            />
            <StatusButton
              value="processing"
              label={t('orders.status.processing')}
              color="#3B82F6"
            />
            <StatusButton
              value="shipped"
              label={t('orders.status.shipped')}
              color="#8B5CF6"
            />
            <StatusButton
              value="delivered"
              label={t('orders.status.delivered')}
              color="#10B981"
            />
            <StatusButton
              value="cancelled"
              label={t('orders.status.cancelled')}
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
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requiredStar: {
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 10,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderRadius: 0,
    paddingHorizontal: 16,
    fontSize: 13,
    borderWidth: 1,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 0,
  },
  statusButtonText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  saveButton: {
    height: 56,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
