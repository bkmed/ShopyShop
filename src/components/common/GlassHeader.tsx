import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../../store/slices/cartSlice';
import { productsDb } from '../../database/productsDb';
import { Product } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

interface GlassHeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  onProfilePress?: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: Platform.OS === 'ios' ? 100 : 70,
      paddingTop: Platform.OS === 'ios' ? 40 : 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      zIndex: 100,
      backgroundColor:
        Platform.OS === 'web'
          ? theme.colors.surface + 'B3' // 70% opacity using theme surface
          : theme.colors.surface + 'E6', // 90% opacity
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '4D', // 30% opacity
      // Web Glassmorphism
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
      }),
      ...theme.shadows.small,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: Platform.OS === 'web' ? 18 : 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: Platform.OS === 'web' ? 8 : 12,
    },
    iconButton: {
      padding: 8,
      borderRadius: 12,
    },
    profileButton: {
      marginLeft: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '33',
    },
    avatarText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    badge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      zIndex: 1,
    },
    badgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    cartDropdown: {
      position: 'absolute',
      top: 60,
      right: 0,
      width: 300,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      ...theme.shadows.large,
      borderWidth: 1,
      borderColor: theme.colors.border + '33',
    },
    cartItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    cartItemInfo: {
      flex: 1,
    },
    cartItemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    cartItemPrice: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '33',
      paddingTop: 12,
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    viewCartBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      marginTop: 16,
    },
    viewCartText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: 14,
    },
  });

export const GlassHeader = ({
  title,
  onMenuPress,
  onSearchPress,
  showBack,
  onBackPress,
  onProfilePress,
}: GlassHeaderProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const { formatPrice } = useCurrency();
  const { setActiveTab } = React.useContext(WebNavigationContext);
  const [showCart, setShowCart] = React.useState(false);
  const [cartProducts, setCartProducts] = React.useState<
    Record<string, Product>
  >({});

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  React.useEffect(() => {
    const loadProducts = async () => {
      const productMap: Record<string, Product> = {};
      for (const item of cartItems) {
        if (!cartProducts[item.productId]) {
          const p = await productsDb.getById(item.productId);
          if (p) productMap[item.productId] = p;
        }
      }
      if (Object.keys(productMap).length > 0) {
        setCartProducts(prev => ({ ...prev, ...productMap }));
      }
    };
    loadProducts();
  }, [cartItems]);

  const totalAmount = cartItems.reduce((acc, item) => {
    const p = cartProducts[item.productId];
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const prevCount = React.useRef(cartCount);

  const isStockManager = user?.role === 'gestionnaire_de_stock';
  const isAdmin = user?.role === 'admin';
  const isManager = isStockManager || isAdmin;

  React.useEffect(() => {
    if (cartCount > prevCount.current) {
      setShowCart(true);
      const timer = setTimeout(() => setShowCart(false), 3000);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  const handleViewCart = () => {
    setShowCart(false);
    if (Platform.OS === 'web') {
      setActiveTab('Cart');
    } else {
      // Assuming navigation is handled externally for mobile or via AppNavigator
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {onMenuPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Text style={{ fontSize: 24 }}>☰</Text>
          </TouchableOpacity>
        )}
        {showBack && (
          <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title || t('home.appName')}</Text>
      </View>

      <View style={styles.rightSection}>
        {onSearchPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
        )}

        {!isManager && (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowCart(!showCart)}
            >
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
              <Text style={{ fontSize: 24 }}>🛒</Text>
            </TouchableOpacity>

            {showCart && cartItems.length > 0 && (
              <View style={styles.cartDropdown}>
                {cartItems.map(item => (
                  <View key={item.productId} style={styles.cartItem}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName} numberOfLines={1}>
                        {cartProducts[item.productId]?.name || '...'}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        {item.quantity} x{' '}
                        {formatPrice(cartProducts[item.productId]?.price || 0)}
                      </Text>
                    </View>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    {t('cart.total') || 'Total'}
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatPrice(totalAmount)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewCartBtn}
                  onPress={handleViewCart}
                >
                  <Text style={styles.viewCartText}>
                    {t('cart.title') || 'View Cart'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <NotificationBell />
        <TouchableOpacity
          style={[styles.iconButton, styles.profileButton]}
          onPress={onProfilePress}
          disabled={!onProfilePress}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? getInitials(user.name) : '??'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
