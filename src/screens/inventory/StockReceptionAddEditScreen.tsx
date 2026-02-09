import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    FlatList,
    Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
    stockReceptionDb,
    suppliersDb,
    productsDb,
    StockReception,
    StockReceptionItem,
    Supplier,
    Product,
} from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const StockReceptionAddEditScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { receptionId } = route.params || {};
    const isEditing = !!receptionId;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Form state
    const [referenceNumber, setReferenceNumber] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [items, setItems] = useState<StockReceptionItem[]>([]);
    const [notes, setNotes] = useState('');
    const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal states
    const [supplierModalVisible, setSupplierModalVisible] = useState(false);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [itemQuantity, setItemQuantity] = useState('1');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [allSuppliers, allProducts] = await Promise.all([
                suppliersDb.getAll(),
                productsDb.getAll(),
            ]);
            setSuppliers(allSuppliers);
            setProducts(allProducts);

            if (isEditing) {
                const reception = await stockReceptionDb.getById(receptionId);
                if (reception) {
                    setReferenceNumber(reception.referenceNumber || '');
                    const supplier = allSuppliers.find(s => s.id === reception.supplierId);
                    setSelectedSupplier(supplier || null);
                    setItems(reception.items);
                    setNotes(reception.notes || '');
                    setExpectedDate(reception.expectedDate?.split('T')[0] || '');
                }
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};
        if (!referenceNumber.trim()) newErrors.referenceNumber = t('common.required');
        if (!selectedSupplier) newErrors.supplierId = t('common.required');
        if (items.length === 0) newErrors.items = t('stockReception.errorNoItems') || 'Please add at least one item';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.items) {
                Alert.alert(t('common.error'), newErrors.items);
            } else {
                Alert.alert(t('common.error'), t('common.fillRequired') || 'Please fill required fields');
            }
            return;
        }

        const supplier = selectedSupplier;
        if (!supplier) return; // Should not happen after validation

        try {
            setLoading(true);
            const receptionData = {
                referenceNumber,
                supplierId: supplier.id,
                supplierName: supplier.name,
                status: 'pending' as const,
                items,
                totalCost: items.reduce((acc, item) => acc + (item.unitPrice || 0) * item.expectedQuantity, 0),
                currency: 'USD',
                notes,
                expectedDate: new Date(expectedDate).toISOString(),
            };

            if (isEditing) {
                await stockReceptionDb.update(receptionId, {
                    ...receptionData,
                    updatedAt: new Date().toISOString(),
                });
                Alert.alert(t('common.success'), t('common.saved'));
            } else {
                await stockReceptionDb.add(receptionData);
                Alert.alert(t('common.success'), t('common.added'));
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error saving reception:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            t('common.confirm'),
            t('common.confirmDelete') || 'Are you sure you want to delete this?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await stockReceptionDb.delete(receptionId);
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting reception:', error);
                            Alert.alert(t('common.error'), t('common.deleteError'));
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const addItem = () => {
        if (!selectedProduct || !itemQuantity) return;

        const qty = parseInt(itemQuantity, 10);
        if (isNaN(qty) || qty <= 0) return;

        const newItem: StockReceptionItem = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            expectedQuantity: qty,
            receivedQuantity: 0,
            unitPrice: selectedProduct.unitPrice || 0,
        };

        setItems([...items, newItem]);
        setSelectedProduct(null);
        setItemQuantity('1');
        setProductModalVisible(false);
    };

    const removeItem = (productId: string) => {
        setItems(items.filter(i => i.productId !== productId));
    };

    const RequiredLabel = ({ label }: { label: string }) => (
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
                {label}
            </Text>
            <Text style={{ color: '#EF4444', marginLeft: 4 }}>*</Text>
        </View>
    );

    if (initialLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader
                title={isEditing ? t('stockReception.edit') || 'Edit Reception' : t('stockReception.add') || 'New Reception'}
                showBack
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <RequiredLabel label={t('common.reference') || 'REFERENCE'} />
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            }
                        ]}
                        value={referenceNumber}
                        onChangeText={setReferenceNumber}
                        placeholder="SR-001"
                        placeholderTextColor={theme.colors.subText}
                    />
                </View>

                <View style={styles.formGroup}>
                    <RequiredLabel label={t('suppliers.title')} />
                    <TouchableOpacity
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                justifyContent: 'center',
                                borderColor: errors.supplierId ? '#EF4444' : theme.colors.border,
                                borderWidth: 1,
                            }
                        ]}
                        onPress={() => setSupplierModalVisible(true)}
                    >
                        <Text style={{ color: selectedSupplier ? theme.colors.text : theme.colors.subText }}>
                            {selectedSupplier ? selectedSupplier.name : t('stockReception.selectSupplier') || 'Select Supplier'}
                        </Text>
                    </TouchableOpacity>
                    {errors.supplierId && <Text style={styles.errorText}>{errors.supplierId}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <RequiredLabel label={t('stockReception.expectedDate') || 'EXPECTED DATE'} />
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={expectedDate}
                        onChangeText={setExpectedDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={theme.colors.subText}
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stockReception.items')}</Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setProductModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+ {t('common.add')}</Text>
                    </TouchableOpacity>
                </View>

                {items.map((item) => (
                    <View key={item.productId} style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.productName}</Text>
                            <Text style={[styles.itemSku, { color: theme.colors.subText }]}>{item.sku}</Text>
                            <Text style={[styles.itemQty, { color: theme.colors.text }]}>{t('stockReception.expectedQuantity')}: {item.expectedQuantity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeItem(item.productId)}>
                            <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>{t('common.remove') || 'Remove'}</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.notes') || 'NOTES'}</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border, height: 100 }]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        placeholder="..."
                        placeholderTextColor={theme.colors.subText}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>{t('common.save')}</Text>}
                </TouchableOpacity>

                {isEditing && (
                    <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: '#EF4444' }]}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Supplier Modal */}
            <Modal visible={supplierModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('stockReception.selectSupplier') || 'Select Supplier'}</Text>
                        <FlatList
                            data={suppliers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedSupplier(item);
                                        setSupplierModalVisible(false);
                                    }}
                                >
                                    <Text style={{ color: theme.colors.text }}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.modalClose} onPress={() => setSupplierModalVisible(false)}>
                            <Text style={{ color: theme.colors.primary }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Product Modal */}
            <Modal visible={productModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('stockReception.addProduct') || 'Add Product'}</Text>

                        <Text style={[styles.label, { color: theme.colors.text, marginTop: 16 }]}>{t('products.title').toUpperCase()}</Text>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {products.map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[styles.modalItem, selectedProduct?.id === p.id && { backgroundColor: theme.colors.primary + '20' }]}
                                    onPress={() => setSelectedProduct(p)}
                                >
                                    <Text style={{ color: theme.colors.text }}>{p.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.label, { color: theme.colors.text, marginTop: 16 }]}>{t('stockReception.expectedQuantity').toUpperCase()}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                            value={itemQuantity}
                            onChangeText={setItemQuantity}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.colors.primary, marginTop: 24 }]}
                            onPress={addItem}
                        >
                            <Text style={styles.saveButtonText}>{t('common.add')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalClose} onPress={() => setProductModalVisible(false)}>
                            <Text style={{ color: theme.colors.primary }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
    input: { height: 50, borderRadius: 0, paddingHorizontal: 16, fontSize: 13, borderWidth: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 12 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold' },
    addButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
    addButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    itemCard: { padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEE', flexDirection: 'row', alignItems: 'center' },
    itemName: { fontSize: 14, fontWeight: 'bold' },
    itemSku: { fontSize: 12, marginBottom: 4 },
    itemQty: { fontSize: 12, fontWeight: '600' },
    saveButton: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
    saveButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
    deleteButton: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 16, borderWidth: 1, marginBottom: 40 },
    deleteButtonText: { color: '#EF4444', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 16, padding: 24, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    modalClose: { marginTop: 16, alignItems: 'center' },
});
