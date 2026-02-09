import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export const OrderConfirmationScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || {};

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          SUCCESS
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
          YOUR ORDER HAS BEEN PLACED SUCCESSFULLY.
        </Text>

        <View
          style={[
            styles.orderRefBox,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.refLabel, { color: theme.colors.subText }]}>
            ORDER NUMBER
          </Text>
          <Text style={[styles.refValue, { color: theme.colors.text }]}>
            {orderId}
          </Text>
        </View>

        <Text style={[styles.emailInfo, { color: theme.colors.subText }]}>
          WE HAVE SENT A CONFIRMATION EMAIL TO YOUR REGISTERED ADDRESS.
        </Text>

        <TouchableOpacity
          style={[styles.receiptButton, { borderColor: theme.colors.text }]}
          onPress={() => {
            // Simulate download
            alert(t('common.downloading') || 'Downloading receipt...');
            setTimeout(() => {
              alert(
                t('common.downloadSuccess') ||
                  'Receipt downloaded successfully',
              );
            }, 1500);
          }}
        >
          <Text style={[styles.receiptText, { color: theme.colors.text }]}>
            DOWNLOAD RECEIPT
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: theme.colors.text }]}
          onPress={handleContinueShopping}
        >
          <Text style={[styles.doneText, { color: theme.colors.background }]}>
            CONTINUE SHOPPING
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 30,
    fontWeight: '200',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 1,
    marginBottom: 48,
    maxWidth: 240,
    textTransform: 'uppercase',
  },
  orderRefBox: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  refValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  emailInfo: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5,
    marginBottom: 48,
    maxWidth: 260,
    color: '#666',
  },
  receiptButton: {
    borderBottomWidth: 1,
    paddingBottom: 4,
    borderColor: '#000',
  },
  receiptText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    padding: 20,
  },
  doneButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  doneText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#FFF',
  },
});
