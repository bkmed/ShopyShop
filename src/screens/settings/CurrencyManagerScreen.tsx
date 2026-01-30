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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { currenciesDb } from '../../database/currenciesDb';
import { Currency } from '../../database/schema';

export const CurrencyManagerScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCurrency, setNewCurrency] = useState({ code: '', symbol: '' });

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

    const handleAdd = async () => {
        if (!newCurrency.code || !newCurrency.symbol) {
            Alert.alert(t('common.error'), t('common.errorEmptyFields'));
            return;
        }
        try {
            await currenciesDb.add(newCurrency.code, newCurrency.symbol);
            setNewCurrency({ code: '', symbol: '' });
            loadCurrencies();
        } catch (error) {
            Alert.alert(t('common.error'), t('common.saveError'));
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            t('common.confirm') || 'Confirm',
            t('currencies.confirmDelete') || 'Are you sure you want to delete this currency?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await currenciesDb.delete(id);
                        loadCurrencies();
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                {t('settings.currency')}
            </Text>

            <View style={[styles.addForm, { backgroundColor: theme.colors.surface }]}>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder="Code (e.g. EUR)"
                    value={newCurrency.code}
                    onChangeText={text => setNewCurrency({ ...newCurrency, code: text.toUpperCase() })}
                />
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder="Symbol (e.g. €)"
                    value={newCurrency.symbol}
                    onChangeText={text => setNewCurrency({ ...newCurrency, symbol: text })}
                />
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleAdd}
                >
                    <Text style={styles.addBtnText}>{t('common.add')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
                <FlatList
                    data={currencies}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.item, { borderBottomColor: theme.colors.border }]}>
                            <View>
                                <Text style={[styles.itemCode, { color: theme.colors.text }]}>{item.code}</Text>
                                <Text style={[styles.itemSymbol, { color: theme.colors.subText }]}>{item.symbol}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text style={{ color: '#FF4444' }}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    addForm: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    addBtn: {
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemCode: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemSymbol: {
        fontSize: 14,
    },
});
