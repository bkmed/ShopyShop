import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { categoriesDb } from '../../database/categoriesDb';
import { Category } from '../../database/schema';

export const CategoryDetailScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const data = await categoriesDb.getById(id);
        setCategory(data);
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(t('common.confirmDelete'), t('categories.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await categoriesDb.delete(id);
          navigation.goBack();
        },
      },
    ]);
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

  if (!category) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('categories.noCategories')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.primary + '10' },
        ]}
      >
        <Text style={{ fontSize: 60 }}>📂</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {category.name}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('categories.description')}
        </Text>
        <Text style={[styles.description, { color: theme.colors.subText }]}>
          {category.description || t('categories.noDescription')}
        </Text>

        <View style={styles.statsContainer}>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('common.id')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {category.id}
            </Text>
          </View>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
              {t('categories.parent')}
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {category.parentId || t('common.none')}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.editButton,
              { borderColor: theme.colors.primary, borderWidth: 1 },
            ]}
            onPress={() => navigation.navigate('CategoryAdd', { category })}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {t('common.edit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
            onPress={handleDelete}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    flex: 0.48,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    flex: 0.48,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flex: 0.48,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
