import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addressesDb } from '../../database/checkoutDb';
import { AlertService } from '../../services/alertService';

export const AddressAddEditScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const toast = useToast();
  const { user } = useAuth();

  const addressId = route.params?.addressId;
  const isEditing = !!addressId;

  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [type, setType] = useState<'shipping' | 'billing' | 'both'>('shipping');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadAddress();
    }
  }, [addressId]);

  const loadAddress = async () => {
    try {
      const address = await addressesDb.getById(addressId);
      if (address) {
        setFullName(address.fullName);
        setAddressLine1(address.addressLine1);
        setAddressLine2(address.addressLine2 || '');
        setCity(address.city);
        setState(address.state);
        setPostalCode(address.postalCode);
        setCountry(address.country);
        setPhone(address.phone);
        setIsDefault(address.isDefault);
        setType(address.type);
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };

  const handleSave = async () => {
    if (
      !fullName.trim() ||
      !addressLine1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim() ||
      !country.trim() ||
      !phone.trim()
    ) {
      AlertService.showError(
        toast,
        t('common.fillAllFields') || 'Please fill all required fields',
      );
      return;
    }

    if (!user?.id) {
      AlertService.showError(
        toast,
        t('common.notLoggedIn') || 'You must be logged in',
      );
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await addressesDb.update(addressId, {
          fullName,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          phone,
          isDefault,
          type,
        });
        AlertService.showSuccess(
          toast,
          t('checkout.addressUpdated') || 'Address updated successfully',
        );
      } else {
        await addressesDb.add({
          userId: user.id,
          fullName,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          phone,
          isDefault,
          type,
        });
        AlertService.showSuccess(
          toast,
          t('checkout.addressAdded') || 'Address added successfully',
        );
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving address:', error);
      AlertService.showError(
        toast,
        t('common.saveError') || 'Failed to save address',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {isEditing
          ? t('checkout.editAddress') || 'Edit Address'
          : t('checkout.addAddress') || 'Add Address'}
      </Text>

      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('checkout.fullName') || 'Full Name'} *
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, color: theme.colors.text },
          ]}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('checkout.enterFullName') || 'Enter full name'}
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('checkout.addressLine1') || 'Address Line 1'} *
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, color: theme.colors.text },
          ]}
          value={addressLine1}
          onChangeText={setAddressLine1}
          placeholder={
            t('checkout.enterAddress') ||
            'Street address, P.O. box, company name'
          }
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('checkout.addressLine2') || 'Address Line 2'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, color: theme.colors.text },
          ]}
          value={addressLine2}
          onChangeText={setAddressLine2}
          placeholder={
            t('checkout.apartment') ||
            'Apartment, suite, unit, building, floor, etc.'
          }
          placeholderTextColor={theme.colors.subText}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('checkout.city') || 'City'} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={city}
              onChangeText={setCity}
              placeholder={t('checkout.enterCity') || 'City'}
              placeholderTextColor={theme.colors.subText}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('checkout.state') || 'State/Province'} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={state}
              onChangeText={setState}
              placeholder={t('checkout.enterState') || 'State'}
              placeholderTextColor={theme.colors.subText}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('checkout.postalCode') || 'Postal Code'} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder={t('checkout.enterPostalCode') || 'ZIP/Postal code'}
              placeholderTextColor={theme.colors.subText}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('checkout.country') || 'Country'} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={country}
              onChangeText={setCountry}
              placeholder={t('checkout.enterCountry') || 'Country'}
              placeholderTextColor={theme.colors.subText}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('checkout.phone') || 'Phone Number'} *
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, color: theme.colors.text },
          ]}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('checkout.enterPhone') || 'Phone number'}
          placeholderTextColor={theme.colors.subText}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('checkout.addressType') || 'Address Type'}
        </Text>
        <View style={styles.typeButtons}>
          {(['shipping', 'billing', 'both'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    type === t ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: type === t ? '#FFF' : theme.colors.text },
                ]}
              >
                {t === 'both' ? 'Both' : t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[styles.switchRow, { borderTopColor: theme.colors.border }]}
        >
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('checkout.setAsDefault') || 'Set as default address'}
          </Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading
              ? t('common.saving') || 'Saving...'
              : t('common.save') || 'Save Address'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    fontSize: 14,
    height: 48,
    color: '#000',
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  saveButton: {
    marginTop: 32,
    height: 56,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
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
