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
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';
import { categoriesDb } from '../../database/categoriesDb';
import { Category } from '../../database/schema';

export const CategoryAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const modal = useModal();
  const toast = useToast();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingCategory = route.params?.category as Category;

  const [form, setForm] = useState({
    name: editingCategory?.name || '',
    description: editingCategory?.description || '',
    parentId: editingCategory?.parentId || '',
    availableDate:
      editingCategory?.availableDate || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim())
      newErrors.name =
        t('categories.nameRequired') || 'Category name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      AlertService.showError(
        toast,
        t('common.fillRequired') || 'Please fill all required fields',
      );
      return;
    }

    const categoryData = {
      name: form.name,
      description: form.description,
      parentId: form.parentId || undefined,
      imageUri: '',
      availableDate: new Date(form.availableDate).toISOString(),
    };

    try {
      if (editingCategory) {
        await categoriesDb.update(editingCategory.id, categoryData);
        AlertService.showSuccess(
          toast,
          t('categories.updatedSuccessfully') ||
            'Category updated successfully',
        );
      } else {
        await categoriesDb.add(categoryData);
        AlertService.showSuccess(
          toast,
          t('categories.savedSuccessfully') || 'Category saved successfully',
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving category:', error);
      AlertService.showError(toast, t('common.saveError'));
    }
  };

  const handleDelete = () => {
    AlertService.showConfirmation(
      modal,
      t('common.delete') || 'Delete',
      t('common.confirmDelete') ||
        'Are you sure you want to delete this category?',
      async () => {
        try {
          if (editingCategory) {
            await categoriesDb.delete(editingCategory.id);
            AlertService.showSuccess(
              toast,
              t('categories.deletedSuccessfully') ||
                'Category deleted successfully',
            );
            navigation.goBack();
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          AlertService.showError(toast, t('common.deleteError'));
        }
      },
      t('common.delete'),
    );
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {editingCategory ? t('categories.edit') : t('categories.add')}
        </Text>

        <View style={styles.formGroup}>
          <RequiredLabel label={t('categories.name')} />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: errors.name ? theme.colors.error : 'transparent',
                borderWidth: errors.name ? 1 : 0,
              },
            ]}
            value={form.name}
            onChangeText={text => {
              setForm({ ...form, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder={t('categories.namePlaceholder')}
            placeholderTextColor={theme.colors.subText}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('categories.description')}
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
            placeholder={t('categories.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.subText}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.subText }]}>
            {t('products.availableDate') || 'Available Date'}
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

        {editingCategory && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
          >
            <Text
              style={[styles.deleteButtonText, { color: theme.colors.error }]}
            >
              {t('common.delete') || 'Delete'}
            </Text>
          </TouchableOpacity>
        )}
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
  saveButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
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
