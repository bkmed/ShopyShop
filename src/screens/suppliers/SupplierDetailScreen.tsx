import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { suppliersDb, supplierProductsDb, Supplier, SupplierProduct } from '../../database';

export const SupplierDetailScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const supplierId = route.params?.supplierId;

    const [loading, setLoading] = useState(true);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<SupplierProduct[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [supplierData, productsData] = await Promise.all([
                suppliersDb.getById(supplierId),
                supplierProductsDb.getBySupplier(supplierId),
            ]);
            setSupplier(supplierData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading supplier details:', error);
            Alert.alert(t('common.error'), t('common.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [supplierId, t]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    if (loading || !supplier) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.header}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                        {supplier.name}
                    </Text>
                    {supplier.isActive ? (
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                                {t('common.active')}
                            </Text>
                        </View>
                    ) : (
                        <View style={[styles.badge, { backgroundColor: '#EF444420' }]}>
                            <Text style={[styles.badgeText, { color: '#EF4444' }]}>
                                {t('common.inactive')}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        {t('suppliers.contactInfo')}
                    </Text>
                    {supplier.contactPerson && (
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.subText }]}>
                                {t('suppliers.contactPerson')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {supplier.contactPerson}
                            </Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.colors.subText }]}>
                            {t('common.email')}:
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                            {supplier.email}
                        </Text>
                    </View>
                    {supplier.phone && (
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.subText }]}>
                                {t('common.phone')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {supplier.phone}
                            </Text>
                        </View>
                    )}
                    {supplier.address && (
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.subText }]}>
                                {t('common.address')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {supplier.address}
                            </Text>
                        </View>
                    )}
                    {supplier.website && (
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.subText }]}>
                                {t('suppliers.website')}:
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
                                {supplier.website}
                            </Text>
                        </View>
                    )}
                </View>

                {supplier.notes && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {t('suppliers.notes')}
                        </Text>
                        <Text style={[styles.notes, { color: theme.colors.subText }]}>
                            {supplier.notes}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('SupplierAddEdit', { supplierId: supplier.id })}
                >
                    <Text style={styles.editButtonText}>{t('common.edit')}</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('suppliers.products')} ({products.length})
                </Text>
                {products.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                        {t('suppliers.noProducts')}
                    </Text>
                ) : (
                    products.map((product) => (
                        <View key={product.id} style={styles.productItem}>
                            <Text style={[styles.productName, { color: theme.colors.text }]}>
                                {product.productId}
                            </Text>
                            <View style={styles.productInfo}>
                                <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                                    {product.currency} {product.supplierPrice.toFixed(2)}
                                </Text>
                                {product.isPreferred && (
                                    <View style={[styles.preferredBadge, { backgroundColor: '#10B98120' }]}>
                                        <Text style={[styles.preferredText, { color: '#10B981' }]}>
                                            ⭐ {t('suppliers.preferred')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
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
    card: {
        margin: 16,
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        width: 120,
    },
    infoValue: {
        fontSize: 14,
        flex: 1,
    },
    notes: {
        fontSize: 14,
        lineHeight: 20,
    },
    editButton: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    productItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
    },
    preferredBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    preferredText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
});
