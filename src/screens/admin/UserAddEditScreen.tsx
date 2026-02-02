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
import { usersDb } from '../../database/usersDb';

export const UserAddEditScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const roles = ['admin', 'gestionnaire_de_stock', 'user', 'customer'];

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const user = await usersDb.getById(id);
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert(t('common.error'), t('common.errorLoad'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handlSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t('common.error'), t('common.required'));
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await usersDb.update(id, { name, email, role });
        Alert.alert(t('common.success'), t('users.updatedSuccessfully'));
      } else {
        await usersDb.add({
          name,
          email,
          role,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any); // Type assertion might be needed depending on strictness
        Alert.alert(
          t('common.success'),
          t('users.createdSuccessfully') || 'User created',
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert(t('common.error'), t('common.saveError'));
    } finally {
      setLoading(false);
    }
  };

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.formContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('profile.firstName') || 'Name'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('profile.email') || 'Email'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder="john@example.com"
          placeholderTextColor={theme.colors.subText}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('roles.title') || 'Role'}
        </Text>
        <View style={styles.roleContainer}>
          {roles.map(r => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleButton,
                role === r && { backgroundColor: theme.colors.primary },
                { borderColor: theme.colors.primary },
              ]}
              onPress={() => setRole(r)}
            >
              <Text
                style={[
                  styles.roleText,
                  role === r
                    ? { color: '#FFF' }
                    : { color: theme.colors.primary },
                ]}
              >
                {t(`roles.${r}`) || r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handlSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {t('common.save') || 'Save'}
            </Text>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
