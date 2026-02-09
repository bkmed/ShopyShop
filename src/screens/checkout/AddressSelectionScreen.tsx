import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlassHeader } from '../../components/common/GlassHeader';
import { addressesDb, Address } from '../../database/checkoutDb';

export const AddressSelectionScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { deliveryMethod } = route.params || {};

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await addressesDb.getAll(user.id);
      setAddresses(data);
      // Auto select default
      const defaultAddr = data.find(a => a.isDefault);
      if (defaultAddr && !selectedAddressId) {
        setSelectedAddressId(defaultAddr.id);
      } else if (data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [user]),
  );

  const handleContinue = () => {
    if (!selectedAddressId) return;
    const address = addresses.find(a => a.id === selectedAddressId);
    // Navigate to Payment or Review
    // Let's go to Payment first
    navigation.navigate('PaymentSelection', {
      deliveryMethod,
      shippingAddress: address,
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <GlassHeader
        title={t('checkout.shippingAddress') || 'SHIPPING ADDRESS'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={[styles.addButton, { borderColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddressAddEdit')}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
            + {t('checkout.addNewAddress') || 'ADD NEW ADDRESS'}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          addresses.map(addr => (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    selectedAddressId === addr.id
                      ? theme.colors.primary
                      : 'transparent',
                  borderWidth: selectedAddressId === addr.id ? 2 : 0,
                },
              ]}
              onPress={() => setSelectedAddressId(addr.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.name, { color: theme.colors.text }]}>
                  {addr.fullName}
                </Text>
                {addr.isDefault && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Text style={styles.badgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.text, { color: theme.colors.text }]}>
                {addr.addressLine1}
              </Text>
              <Text style={[styles.text, { color: theme.colors.text }]}>
                {addr.city}, {addr.postalCode}
              </Text>
              <Text
                style={[
                  styles.text,
                  { color: theme.colors.subText, marginTop: 4 },
                ]}
              >
                {addr.phone}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedAddressId
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
          onPress={handleContinue}
          disabled={!selectedAddressId}
        >
          <Text style={styles.continueText}>
            {t('common.continue') || 'CONTINUE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingTop: 100,
  },
  addButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  addressCard: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#000',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  continueButton: {
    height: 56,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
