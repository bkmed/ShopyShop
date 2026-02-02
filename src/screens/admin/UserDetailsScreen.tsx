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
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { AlertService } from '../../services/alertService';
import { usersDb } from '../../database/usersDb';
import { UserAccount } from '../../database/schema';

export const UserDetailsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const modal = useModal();
  const toast = useToast();
  const route = useRoute<any>();
  const { id } = route.params;

  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await usersDb.getById(id);
      setUser(data);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (role: string) => {
    try {
      if (user) {
        await usersDb.updateRole(id, role);
        setUser({ ...user, role });
        AlertService.showSuccess(toast, t('profile.updatedSuccessfully'));
      }
    } catch {
      AlertService.showError(toast, t('common.error'));
    }
  };

  const handleDelete = async () => {
    AlertService.showConfirmation(
      modal,
      t('common.deleteTitle'),
      t('common.confirmDelete'),
      async () => {
        await usersDb.delete(id);
        navigation.goBack();
      },
      t('common.delete')
    );
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

  if (!user) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.subText }}>
          {t('common.noResult')}
        </Text>
      </View>
    );
  }

  const roles = ['admin', 'gestionnaire_de_stock', 'user', 'anonyme'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.avatarLarge}>
          <Text style={{ fontSize: 48 }}>👤</Text>
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user.name}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.subText }]}>
          {user.email}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('roles.title')}
        </Text>
        <View style={styles.roleGrid}>
          {roles.map(r => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleOption,
                {
                  backgroundColor:
                    user.role === r
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor: theme.colors.primary,
                  borderWidth: 1,
                },
              ]}
              onPress={() => handleRoleChange(r)}
            >
              <Text
                style={{
                  color: user.role === r ? '#FFF' : theme.colors.primary,
                  fontWeight: 'bold',
                }}
              >
                {t(`roles.${r}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('common.actions')}
        </Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('UserAddEdit', { id: user.id })}
        >
          <Text style={styles.editText}>{t('common.edit') || 'Edit'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  editText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
