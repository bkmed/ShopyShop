import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { rbacService, Permission } from '../../services/rbacService';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { useModal } from '../../context/ModalContext';

export const ManageNotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'user' | 'stock'>('all');

  useEffect(() => {
    const isAllowed = rbacService.hasPermission(
      user,
      Permission.MANAGE_SETTINGS,
    );

    if (!isAllowed) {
      showModal({
        title: t('common.error'),
        message: t('common.unauthorized'),
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
      });
      return;
    }
  }, []);

  const handleSend = async () => {
    if (!title || !message) {
      showModal({
        title: t('common.error'),
        message: t('common.required'),
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    try {
      await notificationService.broadcastNotification({
        title,
        body: message,
        targetType,
        senderId: user?.id,
      });

      showModal({
        title: t('common.success'),
        message: t('notifications.sent') || 'Broadcast sent successfully',
        buttons: [{ text: 'OK' }],
      });
      setTitle('');
      setMessage('');
      setTargetType('all');
    } catch (error) {
      console.error(error);
      showModal({
        title: t('common.error'),
        message: t('common.saveError'),
        buttons: [{ text: 'OK' }],
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>
        {t('notifications.broadcastTitle') || 'Broadcast Notification'}
      </Text>

      <Text style={styles.label}>{t('common.title')}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t('common.title')}
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={styles.label}>{t('common.message')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={message}
        onChangeText={setMessage}
        placeholder={t('common.message')}
        placeholderTextColor={theme.colors.subText}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>
        {t('notifications.target') || 'Target Audience'}
      </Text>
      <View style={styles.targetRow}>
        {(['all', 'user', 'stock'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.targetBtn,
              targetType === type && styles.targetBtnSelected,
            ]}
            onPress={() => setTargetType(type)}
          >
            <Text
              style={[
                styles.targetBtnText,
                targetType === type && styles.targetBtnTextSelected,
              ]}
            >
              {t(`common.${type}`) || type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
        <Text style={styles.sendBtnText}>{t('common.send')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.l },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    label: {
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      color: theme.colors.text,
      marginBottom: theme.spacing.l,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    targetRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.l,
      gap: theme.spacing.m,
    },
    targetBtn: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    targetBtnSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    targetBtnText: {
      color: theme.colors.text,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    targetBtnTextSelected: {
      color: '#fff',
    },
    sendBtn: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.l,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
    },
    sendBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
