import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { suppliersDb, Supplier } from '../../database';

export const SupplierListScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const loadSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await suppliersDb.getAll();
            setSuppliers(data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
            Alert.alert(t('common.error'), t('common.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useFocusEffect(
        useCallback(() => {
            loadSuppliers();
        }, [loadSuppliers])
    );

    const handleSearch = useCallback(
        async (query: string) => {
            setSearchQuery(query);
            if (query.trim() === '') {
                loadSuppliers();
            } else {
                try {
                    const results = await suppliersDb.search(query);
                    setSuppliers(results);
                } catch (error) {
                    console.error('Error searching suppliers:', error);
                }
            }
        },
        [loadSuppliers]
    );

    const handleDelete = useCallback(
        async (id: string, name: string) => {
            Alert.alert(
                t('common.deleteTitle'),
                t('suppliers.deleteConfirm', { name }),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await suppliersDb.delete(id);
                                Alert.alert(t('common.success'), t('suppliers.deleted'));
                                loadSuppliers();
                            } catch (error) {
                                console.error('Error deleting supplier:', error);
                                Alert.alert(t('common.error'), t('common.deleteError'));
                            }
                        },
                    },
                ]
            );
        },
        [t, loadSuppliers]
    );

    const renderSupplier = ({ item }: { item: Supplier }) => (
        <TouchableOpacity
            style={[styles.supplierCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('SupplierDetail', { supplierId: item.id })}
        >
            <View style={styles.supplierInfo}>
                <View style={styles.supplierHeader}>
                    <Text style={[styles.supplierName, { color: theme.colors.text }]}>
                        {item.name}
                    </Text>
                    {item.isActive && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                                {t('common.active')}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.supplierDetails}>
                    {item.contactPerson && (
                        <Text style={[styles.detail, { color: theme.colors.subText }]}>
                            👤 {item.contactPerson}
                        </Text>
                    )}
                    <Text style={[styles.detail, { color: theme.colors.subText }]}>
                        📧 {item.email}
                    </Text>
                    {item.phone && (
                        <Text style={[styles.detail, { color: theme.colors.subText }]}>
                            📞 {item.phone}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('SupplierAddEdit', { supplierId: item.id });
                    }}
                >
                    <Text style={styles.actionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id, item.name);
                    }}
                >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TextInput
                    style={[
                        styles.searchInput,
                        {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                        },
                    ]}
                    placeholder={t('suppliers.searchPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('SupplierAddEdit', {})}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {suppliers.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                        {searchQuery ? t('search.noResultsFor') + ' "' + searchQuery + '"' : t('suppliers.noSuppliers')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={suppliers}
                    renderItem={renderSupplier}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    supplierCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    supplierInfo: {
        flex: 1,
    },
    supplierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    supplierName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    supplierDetails: {
        gap: 4,
    },
    detail: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
