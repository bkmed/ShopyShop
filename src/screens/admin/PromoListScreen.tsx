import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { promosDb } from '../../database/promosDb';
import { PromoCode } from '../../database/schema';
import { useCurrency } from '../../utils/currencyUtils';

export const PromoListScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPromos();
        const unsubscribe = navigation.addListener('focus', loadPromos);
        return unsubscribe;
    }, [navigation]);

    const loadPromos = async () => {
        setLoading(true);
        try {
            const data = await promosDb.getAll();
            setPromos(data);
        } catch (error) {
            console.error('Error loading promos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            t('common.delete'),
            t('common.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await promosDb.delete(id);
                        loadPromos();
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: PromoCode }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.info}>
                <Text style={[styles.code, { color: theme.colors.primary }]}>{item.code}</Text>
                <Text style={[styles.detail, { color: theme.colors.subText }]}>
                    {item.percentage}% off • {item.categoryId === 'all' ? 'All' : item.categoryId}
                </Text>
                <Text style={[styles.date, { color: theme.colors.subText }]}>
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.status, { color: item.isActive ? '#4CAF50' : '#F44336' }]}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('PromoAddEdit', { id: item.id })}
                    style={styles.actionBtn}
                >
                    <Text style={{ fontSize: 20 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionBtn}
                >
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Promos</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('PromoAddEdit')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={promos}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ color: theme.colors.subText }}>No promos found</Text>
                        </View>
                    }
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    code: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        marginBottom: 2,
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 8,
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    },
});
