import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { currenciesDb } from '../../database/currenciesDb';
import {
  selectSelectedCurrencyCode,
  selectAllCurrencies,
} from '../../store/slices/currenciesSlice';
import { Currency } from '../../database/schema';

export const CurrencySelectionScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const selectedCode = useSelector(selectSelectedCurrencyCode);
  const currencies = useSelector(selectAllCurrencies);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    currenciesDb.init();
  }, []);

  const handleSelect = async (code: string) => {
    setLoading(true);
    try {
      await currenciesDb.setSelected(code);
    } catch (error) {
      console.error('Error setting currency:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === selectedCode;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary
              : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSelect(item.code)}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? theme.colors.primary + '20'
                : theme.colors.background,
            },
          ]}
        >
          <Text
            style={[
              styles.symbol,
              { color: isSelected ? theme.colors.primary : theme.colors.text },
            ]}
          >
            {item.symbol}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.code, { color: theme.colors.text }]}>
            {item.code}
          </Text>
          <Text style={[styles.name, { color: theme.colors.subText }]}>
            {t(`currencies.${item.code.toLowerCase()}`) || item.code}
          </Text>
        </View>
        {isSelected && (
          <View
            style={[
              styles.checkContainer,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.check}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.header, { color: theme.colors.text }]}>
        {t('settings.currency')}
      </Text>
      <Text style={[styles.subHeader, { color: theme.colors.subText }]}>
        {t('currencies.chooseDisplay')}
      </Text>

      {loading && currencies.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={currencies.filter(c => c.isActive)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 32,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
