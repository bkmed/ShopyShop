import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { paymentMethodsDb, PaymentMethod } from '../../database/checkoutDb';

export const PaymentMethodsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await paymentMethodsDb.getAll(user.id);
      setMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await paymentMethodsDb.delete(id);
      await loadMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentMethodsDb.update(id, { isDefault: true });
      await loadMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('checkout.paymentMethods') || 'Payment Methods'}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('PaymentMethodAddEdit')}
        >
          <Text style={styles.addButtonText}>+ {t('common.add') || 'Add'}</Text>
        </TouchableOpacity>
      </View>

      {methods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
            {t('checkout.noPaymentMethods') || 'No payment methods saved yet'}
          </Text>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate('PaymentMethodAddEdit')}
          >
            <Text style={styles.buttonText}>
              {t('checkout.addPaymentMethod') || 'Add Payment Method'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        methods.map(method => (
          <View
            key={method.id}
            style={[
              styles.methodCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: method.isDefault
                  ? theme.colors.primary
                  : theme.colors.border,
                borderWidth: method.isDefault ? 2 : 1,
              },
            ]}
          >
            {method.isDefault && (
              <View
                style={[
                  styles.defaultBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.defaultText}>
                  {t('checkout.default') || 'Default'}
                </Text>
              </View>
            )}

            <View style={styles.methodHeader}>
              <Text style={styles.methodIcon}>
                {getMethodIcon(method.type)}
              </Text>
              <View style={{ flex: 1 }}>
                {method.type === 'card' && (
                  <>
                    <Text
                      style={[styles.methodName, { color: theme.colors.text }]}
                    >
                      {method.cardBrand?.toUpperCase()} •••• {method.cardLast4}
                    </Text>
                    <Text
                      style={[
                        styles.methodDetail,
                        { color: theme.colors.subText },
                      ]}
                    >
                      {method.cardholderName}
                    </Text>
                    <Text
                      style={[
                        styles.methodDetail,
                        { color: theme.colors.subText },
                      ]}
                    >
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </>
                )}
                {method.type === 'paypal' && (
                  <>
                    <Text
                      style={[styles.methodName, { color: theme.colors.text }]}
                    >
                      PayPal
                    </Text>
                    <Text
                      style={[
                        styles.methodDetail,
                        { color: theme.colors.subText },
                      ]}
                    >
                      {method.paypalEmail}
                    </Text>
                  </>
                )}
                {method.type === 'bank_transfer' && (
                  <>
                    <Text
                      style={[styles.methodName, { color: theme.colors.text }]}
                    >
                      {method.bankName}
                    </Text>
                    <Text
                      style={[
                        styles.methodDetail,
                        { color: theme.colors.subText },
                      ]}
                    >
                      •••• {method.accountNumber?.slice(-4)}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              {!method.isDefault && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: theme.colors.primary },
                  ]}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Text
                    style={[styles.actionText, { color: theme.colors.primary }]}
                  >
                    {t('checkout.setDefault') || 'Set as Default'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: '#FF4444' }]}
                onPress={() => handleDelete(method.id)}
              >
                <Text style={[styles.actionText, { color: '#FF4444' }]}>
                  {t('common.delete') || 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={[styles.securityText, { color: theme.colors.subText }]}>
          {t('checkout.securityNote') ||
            'Your payment information is encrypted and secure'}
        </Text>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  methodCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  defaultBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    fontSize: 32,
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 12,
  },
});
