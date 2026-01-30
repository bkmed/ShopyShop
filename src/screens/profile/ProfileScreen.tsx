import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { notificationService } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { AuthInput } from '../../components/auth/AuthInput';
import { Theme } from '../../theme';
import { selectCartItems } from '../../store/slices/cartSlice';
import { selectAllOrders } from '../../store/slices/ordersSlice';

export const ProfileScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { user, signOut, updateProfile } = useAuth();
  const webContext = React.useContext(WebNavigationContext) as any;
  const setActiveTab = webContext?.setActiveTab;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  // Stats from Redux
  const cartItems = useSelector(selectCartItems);
  const orders = useSelector(selectAllOrders);

  const cartCount = useMemo(() => cartItems.length, [cartItems]);
  const ordersCount = useMemo(() => orders.length, [orders]);

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showModal({
        title: t('common.error'),
        message: t('signUp.errorEmptyFields'),
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
      } as any);
      setIsEditing(false);
      showModal({
        title: t('common.success'),
        message: t('profile.updatedSuccessfully'),
      });
    } catch (error) {
      showModal({ title: t('common.error'), message: t('common.loadFailed') });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(navigation);
    } catch (error) {
      notificationService.showAlert(
        t('common.error'),
        t('profile.logoutError'),
      );
      console.error(error);
    }
  };

  const DashboardStat = ({ label, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + '15' }]}
      >
        <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBackground}>
          <View
            style={[
              styles.backgroundImage,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    {
                      borderColor: theme.colors.surface,
                      borderWidth: 4,
                      backgroundColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {t(`roles.${user?.role}`)}
                  </Text>
                </View>
              </View>

              <View style={styles.headerMainInfo}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>

            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>✎ {t('profile.edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {!isEditing && (
            <View style={styles.statsRow}>
              <DashboardStat
                icon="🛒"
                value={cartCount}
                label={t('navigation.cart')}
                color={theme.colors.primary}
                onPress={() =>
                  setActiveTab
                    ? setActiveTab('Cart')
                    : navigation.navigate('CartTab')
                }
              />
              <DashboardStat
                icon="📦"
                value={ordersCount}
                label={t('navigation.orders')}
                color={theme.colors.secondary}
                onPress={() =>
                  setActiveTab
                    ? setActiveTab('Orders')
                    : navigation.navigate('OrdersTab')
                }
              />
            </View>
          )}

          {isEditing ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👤 {t('profile.edit')}</Text>
              <View style={styles.editForm}>
                <AuthInput
                  label={t('signUp.nameLabel')}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('signUp.namePlaceholder')}
                />
                <AuthInput
                  label={t('signUp.emailLabel')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('signUp.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.viewActions}>
                  <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {t('common.save')}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>
                🚪 {t('profile.logout')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { paddingBottom: 40 },
    headerBackground: { height: 120, width: '100%' },
    backgroundImage: { width: '100%', height: '100%' },
    mainContent: { paddingHorizontal: 20, marginTop: -60 },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      ...theme.shadows.medium,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { fontSize: 40, color: theme.colors.text, fontWeight: 'bold' },
    roleBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    roleBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    headerMainInfo: { marginLeft: 20, flex: 1 },
    userName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
    userEmail: { fontSize: 14, color: theme.colors.subText, marginTop: 4 },
    editButton: {
      marginTop: 20,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
    },
    editButtonText: { color: theme.colors.primary, fontWeight: '600' },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statIcon: { fontSize: 20 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    statLabel: { fontSize: 12, color: theme.colors.subText },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
      ...theme.shadows.small,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    editForm: { gap: 16 },
    viewActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    saveButton: {
      flex: 2,
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.border + '30',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButtonText: { color: theme.colors.text, fontWeight: '600' },
    logoutButton: {
      marginTop: 30,
      backgroundColor: theme.colors.error + '10',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error + '30',
    },
    logoutButtonText: {
      color: theme.colors.error,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
