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
        height: 56,
        paddingHorizontal: 16,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
        color: '#000',
    },
    addButton: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    addButtonText: {
        fontSize: 28,
        color: '#FFF',
        fontWeight: '300',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    supplierCard: {
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    supplierInfo: {
        marginBottom: 16,
    },
    supplierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    supplierName: {
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#000',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: 'transparent',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#000',
    },
    supplierDetails: {
        gap: 6,
    },
    detail: {
        fontSize: 13,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    actionButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
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
        fontSize: 14,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#999',
    },
});
