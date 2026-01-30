import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export const CartScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('navigation.cart')}
      </Text>
      <View style={styles.centered}>
        <Text style={{ fontSize: 60 }}>🛒</Text>
        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
          {t('cart.empty') || 'Your cart is empty'}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.buttonText}>
            {t('cart.shop_now') || 'Shop Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, marginTop: 16, marginBottom: 24 },
  button: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
