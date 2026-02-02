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
import { productsDb } from '../../database/productsDb';
import { Product } from '../../database/schema';

export const ProductAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingProduct = route.params?.product as Product;

  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price?.toString() || '',
    stockQuantity: editingProduct?.stockQuantity?.toString() || '0',
    currency: editingProduct?.currency || 'USD',
    availableDate: editingProduct?.availableDate || new Date().toISOString().split('T')[0],
    unitPrice: editingProduct?.unitPrice?.toString() || '0',
    categoryId: editingProduct?.categoryId || '1',
  });

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert(t('common.error'), t('signUp.errorEmptyFields'));
      return;
    }

    const productData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity, 10),
      categoryId: form.categoryId,
      currency: form.currency,
      imageUris: [],
      isActive: true,
      availableDate: new Date(form.availableDate).toISOString(),
      unitPrice: parseFloat(form.unitPrice),
    };

    try {
      if (editingProduct) {
        await productsDb.update(editingProduct.id, productData);
        Alert.alert(t('common.success'), t('products.productUpdated'));
      } else {
        await productsDb.add(productData);
        Alert.alert(t('common.success'), t('products.productSaved'));
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert(t('common.error'), t('common.saveError'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editingProduct
            ? t('products.editProduct')
            : t('products.addProduct')}
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('products.productName')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
            placeholder={t('products.productNamePlaceholder')}
            placeholderTextColor={theme.colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('products.productDescription')}
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
            value={form.description}
            onChangeText={text => setForm({ ...form, description: text })}
            placeholder={t('products.productDescriptionPlaceholder')}
            placeholderTextColor={theme.colors.subText}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.subText }]}>
              {t('products.productPrice')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={form.price}
              onChangeText={text => setForm({ ...form, price: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.subText}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.subText }]}>
              {t('products.productStock')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={form.stockQuantity}
              onChangeText={text => setForm({ ...form, stockQuantity: text })}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.subText}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('inventory.unitPrice')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.unitPrice}
            onChangeText={text => setForm({ ...form, unitPrice: text })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.colors.subText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('products.availableDate')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={form.availableDate}
            onChangeText={text => setForm({ ...form, availableDate: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.subText}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    height: 120,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
