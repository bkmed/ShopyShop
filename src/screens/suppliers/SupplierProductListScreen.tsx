import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { supplierProductsDb, suppliersDb, productsDb, Supplier, SupplierProduct, Product } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

interface ProductWithSupplierInfo extends Product {
    supplierPrice: number;
    supplierSKU?: string;
    isPreferred: boolean;
}

export const SupplierProductListScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { supplierId } = route.params;

    const [loading, setLoading] = useState(true);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [products, setProducts] = useState<ProductWithSupplierInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [supplierData, supplierProductsData, allProducts] = await Promise.all([
                suppliersDb.getById(supplierId),
                supplierProductsDb.getBySupplier(supplierId),
                productsDb.getAll(),
            ]);

            setSupplier(supplierData);

            const enrichedProducts = supplierProductsData.map((sp) => {
                const product = allProducts.find((p) => p.id === sp.productId);
                return {
                    ...product!,
                    supplierPrice: sp.supplierPrice,
                    supplierSKU: sp.supplierSKU,
                    isPreferred: sp.isPreferred,
                };
            }).filter(p => !!p.id);

            setProducts(enrichedProducts);
        } catch (error) {
            console.error('Error loading supplier products:', error);
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierSKU?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProduct = ({ item }: { item: ProductWithSupplierInfo }) => (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Image
                source={{ uri: item.imageUris?.[0] || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.sku, { color: theme.colors.subText }]}>
                    SKU: {item.supplierSKU || item.id}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: theme.colors.primary }]}>
                        {item.currency} {item.supplierPrice.toFixed(2)}
                    </Text>
                    {item.isPreferred && (
                        <View style={[styles.preferredBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.preferredText, { color: theme.colors.primary }]}>
                                {t('suppliers.preferred')}
                            </Text>
                        </View>
                    )}
                </View>
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
            <GlassHeader title={supplier?.name || t('suppliers.products')} />

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
                    placeholder={t('catalog.searchProducts')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                            {t('catalog.noProducts')}
                        </Text>
                    </View>
                }
            />
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
        padding: 16,
    },
    searchInput: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    productCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    sku: {
        fontSize: 12,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
    },
    preferredBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    preferredText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    empty: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
