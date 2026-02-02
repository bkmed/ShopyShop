import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';
import { promosDb } from '../../database/promosDb';
import { categoriesDb } from '../../database/categoriesDb';
import { Category } from '../../database/schema';
import { Picker } from '@react-native-picker/picker';

export const PromoAddEditScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const modal = useModal();
  const toast = useToast();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const isEditing = !!id;

  const [code, setCode] = useState('');
  const [percentage, setPercentage] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [isActive, setIsActive] = useState(true);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadPromo();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const allCats = await categoriesDb.getAll();
      setCategories(allCats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPromo = async () => {
    const promo = await promosDb.getById(id);
    if (promo) {
      setCode(promo.code);
      setPercentage(promo.percentage.toString());
      setCategoryId(promo.categoryId);
      setIsActive(promo.isActive);
      setExpiryDate(promo.expiryDate.split('T')[0]);
    }
  };

  const handleSave = async () => {
    if (!code || !percentage) {
      AlertService.showError(toast, t('promos.codeAndPercentageRequired'));
      return;
    }

    const promoData = {
      code,
      percentage: parseFloat(percentage),
      categoryId,
      isActive,
      expiryDate: new Date(expiryDate).toISOString(),
    };

    try {
      if (isEditing) {
        await promosDb.update(id, promoData);
      } else {
        await promosDb.add(promoData);
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      AlertService.showError(toast, t('promos.failedToSave'));
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('promos.code')}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={code}
          onChangeText={setCode}
          placeholder={t('promos.codePlaceholder')}
          placeholderTextColor={theme.colors.subText}
          autoCapitalize="characters"
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('promos.percentage')}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={percentage}
          onChangeText={setPercentage}
          keyboardType="numeric"
          placeholder={t('promos.percentagePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('categories.title')}
        </Text>
        <View
          style={[
            styles.pickerContainer,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Picker
            selectedValue={categoryId}
            onValueChange={itemValue => setCategoryId(itemValue)}
            style={{ color: theme.colors.text }}
            dropdownIconColor={theme.colors.text}
          >
            <Picker.Item label={t('promos.allCategories')} value="all" />
            {categories.map(cat => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('promos.expiryDate')}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder={t('common.dateFormatPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <View style={styles.switchRow}>
          <Text
            style={[
              styles.label,
              { color: theme.colors.text, marginBottom: 0 },
            ]}
          >
            {t('common.active')}
          </Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>{t('promos.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    padding: 20,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  saveBtn: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
