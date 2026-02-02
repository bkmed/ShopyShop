import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { currenciesDb } from '../../database/currenciesDb';
import { Currency } from '../../database/schema';

export const CurrencyAdminScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<
    Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>
  >({
    code: '',
    symbol: '',
    rate: 1,
    isBase: false,
    isActive: true,
  });

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const data = await currenciesDb.getAll();
      setCurrencies(data);
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const handleSave = async () => {
    if (!form.code || !form.symbol) {
      Alert.alert(t('common.error'), t('common.errorEmptyFields'));
      return;
    }

    try {
      if (editingId) {
        await currenciesDb.update(editingId, form);
      } else {
        await currenciesDb.add(form);
      }
      setEditingId(null);
      setForm({ code: '', symbol: '', rate: 1, isBase: false, isActive: true });
      loadCurrencies();
    } catch {
      Alert.alert(t('common.error'), t('common.saveError'));
    }
  };

  const startEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setForm({
      code: currency.code,
      symbol: currency.symbol,
      rate: currency.rate,
      isBase: currency.isBase,
      isActive: currency.isActive,
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('common.confirm'), t('currencies.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await currenciesDb.delete(id);
          loadCurrencies();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Currency }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardCode, { color: theme.colors.text }]}>
            {item.code}{' '}
            {item.isBase && (
              <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                (Base)
              </Text>
            )}
          </Text>
          <Text style={[styles.cardSymbol, { color: theme.colors.subText }]}>
            {item.symbol}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => startEdit(item)}
            style={styles.actionBtn}
          >
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
          {!item.isBase && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.actionBtn}
            >
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={[styles.cardStats, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
            Rate
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            1 {item.isBase ? item.code : 'USD?'} = {item.rate} {item.code}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
            Status
          </Text>
          <Text
            style={[
              styles.statValue,
              {
                color: item.isActive
                  ? theme.colors.success
                  : theme.colors.error,
              },
            ]}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={currencies}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Currency Management
            </Text>

            <View
              style={[styles.form, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                {editingId ? 'Edit Currency' : 'Add New Currency'}
              </Text>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.subText }]}>
                    Code
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="EUR"
                    value={form.code}
                    onChangeText={text =>
                      setForm({ ...form, code: text.toUpperCase() })
                    }
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.subText }]}>
                    Symbol
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="€"
                    value={form.symbol}
                    onChangeText={text => setForm({ ...form, symbol: text })}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.colors.subText }]}>
                    Rate
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder="1.0"
                    keyboardType="numeric"
                    value={form.rate.toString()}
                    onChangeText={text =>
                      setForm({ ...form, rate: parseFloat(text) || 0 })
                    }
                  />
                </View>
                <View style={styles.formGroupCenter}>
                  <Text style={[styles.label, { color: theme.colors.subText }]}>
                    Base
                  </Text>
                  <Switch
                    value={form.isBase}
                    onValueChange={val => setForm({ ...form, isBase: val })}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.primary,
                    }}
                  />
                </View>
                <View style={styles.formGroupCenter}>
                  <Text style={[styles.label, { color: theme.colors.subText }]}>
                    Active
                  </Text>
                  <Switch
                    value={form.isActive}
                    onValueChange={val => setForm({ ...form, isActive: val })}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.primary,
                    }}
                  />
                </View>
              </View>

              <View style={styles.formActions}>
                {editingId && (
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => {
                      setEditingId(null);
                      setForm({
                        code: '',
                        symbol: '',
                        rate: 1,
                        isBase: false,
                        isActive: true,
                      });
                    }}
                  >
                    <Text style={{ color: theme.colors.text }}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>
                    {editingId ? 'Update' : 'Add Currency'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          loading ? <ActivityIndicator size="large" /> : null
        }
        contentContainerStyle={styles.listContent}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  form: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formGroup: {
    flex: 1,
  },
  formGroupCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardCode: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardSymbol: {
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 20,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
