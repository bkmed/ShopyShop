import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { purchasesDb, Purchase, OrderStatus, productsDb } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';
import { useCurrency } from '../../utils/currencyUtils';

export const AdminPurchaseDetailScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { formatPrice } = useCurrency();
    const { purchaseId } = route.params;

    const [loading, setLoading] = useState(true);
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [updating, setUpdating] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await purchasesDb.getById(purchaseId);
            if (data) {
                setPurchase(data);
                setTrackingNumber(data.trackingNumber || '');
            }
        } catch (error) {
            console.error('Error loading admin purchase detail:', error);
        } finally {
            setLoading(false);
        }
    }, [purchaseId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        if (!purchase) return;
        try {
            setUpdating(true);
            await purchasesDb.update(purchase.id, {
                status: newStatus,
                trackingNumber: trackingNumber || undefined
            });
            Alert.alert(t('common.success'), t('admin.purchases.statusUpdated'));
            loadData();
        } catch (error) {
            console.error('Error updating purchase status:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !purchase) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return '#10B981';
            case 'shipped': return '#3B82F6';
            case 'processing': return '#F59E0B';
            case 'pending': return '#6B7280';
            case 'cancelled': return '#EF4444';
            default: return theme.colors.subText;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={`#${purchase.orderId}`} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('orders.info')}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(purchase.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(purchase.status) }]}>
                                {t(`orders.status.${purchase.status}`)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>{t('common.user')}:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>{purchase.userName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>{t('common.date')}:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>
                            {new Date(purchase.createdAt).toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>{t('checkout.paymentMethod')}:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>{purchase.paymentMethod}</Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('admin.purchases.actions') || 'Update Status'}</Text>

                    <Text style={[styles.label, { color: theme.colors.subText, marginBottom: 8 }]}>{t('orders.trackingNumber')}</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder={t('orders.enterTracking')}
                        value={trackingNumber}
                        onChangeText={setTrackingNumber}
                    />

                    <View style={styles.statusButtons}>
                        {['processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    { borderColor: getStatusColor(status) },
                                    purchase.status === status && { backgroundColor: getStatusColor(status) + '20' }
                                ]}
                                onPress={() => handleUpdateStatus(status as OrderStatus)}
                                disabled={updating}
                            >
                                <Text style={[styles.statusBtnText, { color: getStatusColor(status) }]}>
                                    {t(`orders.status.${status}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={[styles.listTitle, { color: theme.colors.text }]}>{t('orders.items')}</Text>
                {purchase.items.map((item, index) => (
                    <View key={index} style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.itemHeader}>
                            <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.productName}</Text>
                            <Text style={[styles.itemQty, { color: theme.colors.primary }]}>x{item.quantity}</Text>
                        </View>
                        <Text style={[styles.itemPrice, { color: theme.colors.subText }]}>
                            {formatPrice(item.priceAtPurchase, purchase.currency)}
                        </Text>
                    </View>
                ))}

                <View style={[styles.totalCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: theme.colors.subText }]}>{t('checkout.subtotal')}</Text>
                        <Text style={[styles.totalValue, { color: theme.colors.text }]}>
                            {formatPrice(purchase.totalAmount, purchase.currency)}
                        </Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text style={[styles.totalLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>{t('checkout.total')}</Text>
                        <Text style={[styles.totalValue, { color: theme.colors.primary, fontWeight: 'bold', fontSize: 20 }]}>
                            {formatPrice(purchase.totalAmount, purchase.currency)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
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
    scroll: {
        padding: 16,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    statusBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    itemCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    itemQty: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    itemPrice: {
        fontSize: 13,
        marginTop: 4,
    },
    totalCard: {
        padding: 20,
        borderRadius: 16,
        marginTop: 12,
        marginBottom: 40,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    grandTotal: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 15,
    },
    totalValue: {
        fontSize: 16,
    },
});
