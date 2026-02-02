import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  selectAllAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
} from '../../store/slices/announcementsSlice';
import { Announcement } from '../../database/schema';
import { formatDate } from '../../utils/dateUtils';
import { rbacService, Permission } from '../../services/rbacService';

export const AnnouncementsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const announcements = useSelector(selectAllAnnouncements);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<
    'news' | 'promotion' | 'alert'
  >('news');

  const canManage = rbacService.hasPermission(user, Permission.MANAGE_SETTINGS);

  const handleCreateAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      authorId: user?.id || '',
      authorName: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
    };

    dispatch(addAnnouncement(announcement));
    setModalVisible(false);
    setNewTitle('');
    setNewContent('');
    setNewCategory('news');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'promotion':
        return '🎁';
      case 'alert':
        return '📢';
      default:
        return '🛒';
    }
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: `${theme.colors.primary}15` },
          ]}
        >
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(item.category)}
          </Text>
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {item.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.author}>{item.authorName}</Text>
        {canManage && (
          <TouchableOpacity
            onPress={() => item.id && dispatch(deleteAnnouncement(item.id))}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('announcements.title') || 'News & Offers'}
        </Text>
      </View>
      <FlatList
        data={[...announcements].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )}
        renderItem={renderItem}
        keyExtractor={item => item.id || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('announcements.noAnnouncements') || 'No news yet.'}
            </Text>
          </View>
        }
      />

      {canManage && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={styles.modalTitle}>
              {t('announcements.addAnnouncement') || 'Add News'}
            </Text>

            <ScrollView>
              <Text style={styles.label}>{t('common.title')}</Text>
              <TextInput
                style={styles.input}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder={t('announcements.titlePlaceholder')}
                placeholderTextColor={theme.colors.subText}
              />

              <Text style={styles.label}>{t('common.message')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newContent}
                onChangeText={setNewContent}
                multiline
                numberOfLines={4}
                placeholder={t('announcements.contentPlaceholder')}
                placeholderTextColor={theme.colors.subText}
              />

              <Text style={styles.label}>
                {t('common.category') || 'Category'}
              </Text>
              <View style={styles.categoryToggle}>
                {(['news', 'promotion', 'alert'] as const).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[
                      styles.categoryOption,
                      { borderColor: theme.colors.border },
                      newCategory === cat && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newCategory === cat && { color: '#FFF' },
                      ]}
                    >
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: theme.colors.text }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleCreateAnnouncement}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  {t('common.publish') || 'Publish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    listContent: { padding: 16, paddingBottom: 100 },
    card: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      ...theme.shadows.small,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 6,
    },
    categoryIcon: { fontSize: 14 },
    categoryText: { fontSize: 10, fontWeight: 'bold' },
    dateText: { fontSize: 12, color: theme.colors.subText },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    content: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
      lineHeight: 20,
      marginBottom: 16,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 12,
    },
    author: { fontSize: 12, fontStyle: 'italic', color: theme.colors.subText },
    deleteButton: { padding: 4 },
    deleteText: { color: theme.colors.error, fontSize: 12, fontWeight: '600' },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    fabIcon: { fontSize: 32, color: '#FFF' },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 500,
      borderRadius: 24,
      padding: 24,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    categoryToggle: { flexDirection: 'row', gap: 8, marginTop: 8 },
    categoryOption: {
      flex: 1,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    },
    categoryOptionText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 24,
    },
    modalButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 100,
      alignItems: 'center',
    },
    emptyContainer: {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: { fontSize: 16, color: theme.colors.subText },
  });
