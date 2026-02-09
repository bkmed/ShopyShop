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
    Modal,
    Alert,
    Switch,
    ScrollView,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { supplierProductsDb, suppliersDb, productsDb, Supplier, Product } from '../../database';
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
    const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [linkPrice, setLinkPrice] = useState('');
    const [linkSKU, setLinkSKU] = useState('');
    const [isPreferred, setIsPreferred] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [supplierData, supplierProductsData, allProducts] = await Promise.all([
                suppliersDb.getById(supplierId),
                supplierProductsDb.getBySupplier(supplierId),
                productsDb.getAll(),
            ]);

            setSupplier(supplierData);
            setAllCatalogProducts(allProducts);

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

    const handleLinkProduct = async () => {
        if (!selectedProductId || !linkPrice) {
            Alert.alert(t('common.error'), t('common.requiredFields') || 'Product and Price are required');
            return;
        }

        try {
            setIsSaving(true);
            await supplierProductsDb.add({
                supplierId,
                productId: selectedProductId,
                supplierPrice: parseFloat(linkPrice),
                supplierSKU: linkSKU,
                isPreferred,
                currency: supplier?.notes?.includes('EUR') ? 'EUR' : 'USD', // Simplified for now
            });

            Alert.alert(t('common.success'), t('suppliers.productLinked') || 'Product linked successfully');
            setIsModalVisible(false);
            // Reset modal state
            setSelectedProductId('');
            setLinkPrice('');
            setLinkSKU('');
            setIsPreferred(false);
            loadData();
        } catch (error) {
            console.error('Error linking product:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

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
            <GlassHeader
                title={supplier?.name || t('suppliers.products')}
                showBack
                rightElement={
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                }
            />

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

            {/* Link Product Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {t('suppliers.linkProduct') || 'Link Product'}
                        </Text>

                        <ScrollView style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                {t('suppliers.selectProduct') || 'Select Product'} *
                            </Text>
                            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                {allCatalogProducts.length > 0 ? (
                                    <FlatList
                                        data={allCatalogProducts}
                                        keyExtractor={(p) => p.id}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.productSelectCard,
                                                    selectedProductId === item.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                                                ]}
                                                onPress={() => setSelectedProductId(item.id)}
                                            >
                                                <Image source={{ uri: item.imageUris[0] }} style={styles.productSelectImage} />
                                                <Text style={[styles.productSelectName, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                ) : (
                                    <Text style={{ padding: 10 }}>{t('catalog.noProducts')}</Text>
                                )}
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                {t('suppliers.supplierPrice') || 'Supplier Price'} *
                            </Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.colors.subText}
                                value={linkPrice}
                                onChangeText={setLinkPrice}
                                keyboardType="numeric"
                            />

                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                {t('suppliers.supplierSKU') || 'Supplier SKU'}
                            </Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="SUP-001"
                                placeholderTextColor={theme.colors.subText}
                                value={linkSKU}
                                onChangeText={setLinkSKU}
                            />

                            <View style={styles.switchRow}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text, marginBottom: 0 }]}>
                                    {t('suppliers.preferred')}
                                </Text>
                                <Switch
                                    value={isPreferred}
                                    onValueChange={setIsPreferred}
                                    trackColor={{ false: '#ccc', true: theme.colors.primary }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.colors.surface }]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.colors.text }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={handleLinkProduct}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>
                                        {t('common.link') || 'Link'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        height: 56,
        paddingHorizontal: 16,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
        color: '#000',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    productCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
    },
    productImage: {
        width: 80,
        height: 100,
        backgroundColor: '#F5F5F5',
        marginRight: 16,
        resizeMode: 'cover',
    },
    productInfo: {
        flex: 1,
        height: 100,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    productName: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        color: '#000',
    },
    sku: {
        fontSize: 11,
        color: '#666',
        letterSpacing: 0.5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    preferredBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#000',
    },
    preferredText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#000',
    },
    empty: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#999',
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#FFF',
        padding: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 32,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    modalBody: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalInput: {
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#000',
    },
    pickerContainer: {
        height: 140,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        padding: 16,
    },
    productSelectCard: {
        width: 90,
        marginRight: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    productSelectImage: {
        width: 72,
        height: 72,
        marginBottom: 8,
        backgroundColor: '#F5F5F5',
    },
    productSelectName: {
        fontSize: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        paddingTop: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    modalBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    modalBtnText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
