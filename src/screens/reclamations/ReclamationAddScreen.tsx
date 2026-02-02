import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { reclamationDb } from '../../database/reclamationDb';
import { useAuth } from '../../context/AuthContext';

export const ReclamationAddScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { orderId } = route.params || {};

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description) {
      Alert.alert(t('common.error'), t('payroll.fillRequired'));
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      await reclamationDb.add({
        userId: user.id,
        orderId: orderId || 'MANUAL',
        reason,
        description,
        status: 'pending',
      });
      Alert.alert(t('common.success'), t('reviews.reviewSubmitted'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error submitting reclamation:', error);
      Alert.alert(t('common.error'), t('common.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('reclamations.add')}
        </Text>
        {orderId && (
          <Text style={[styles.orderId, { color: theme.colors.subText }]}>
            {t('reclamations.orderId')}: {orderId}
          </Text>
        )}
      </View>

      <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('reclamations.reason')}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
          placeholder={t('reclamations.reason')}
          placeholderTextColor={theme.colors.subText}
          value={reason}
          onChangeText={setReason}
        />

        <Text
          style={[styles.label, { color: theme.colors.text, marginTop: 20 }]}
        >
          {t('reclamations.description')}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
          placeholder={t('reclamations.description')}
          placeholderTextColor={theme.colors.subText}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? t('common.loading') : t('common.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  orderId: {
    fontSize: 16,
    marginTop: 4,
  },
  form: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 150,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
  },
  submitButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  submitText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
