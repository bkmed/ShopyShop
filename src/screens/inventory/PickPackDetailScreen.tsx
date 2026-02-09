import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { pickPackDb, inventoryDb, PickPackOrder } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';
import { useAuth } from '../../context/AuthContext';

export const PickPackDetailScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { pickPackOrderId } = route.params;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<PickPackOrder | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await pickPackDb.getById(pickPackOrderId);
            if (data) {
                setOrder(data);
            }
        } catch (error) {
            console.error('Error loading pick & pack detail:', error);
        } finally {
            setLoading(false);
        }
    }, [pickPackOrderId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const toggleItemStatus = async (productId: string, type: 'picked' | 'packed') => {
        if (!order) return;

        const updatedItems = order.items.map(item => {
            if (item.productId === productId) {
                return { ...item, [type]: !item[type] };
            }
            return item;
        });

        // Determine next status
        let nextStatus = order.status;
        const allPicked = updatedItems.every(i => i.picked);
        const allPacked = updatedItems.every(i => i.packed);

        if (allPacked) {
            nextStatus = 'ready_to_ship';
        } else if (allPicked) {
            nextStatus = 'packing';
        } else {
            nextStatus = 'picking';
        }

        try {
            const updates: Partial<PickPackOrder> = {
                items: updatedItems,
                status: nextStatus,
                assignedTo: user?.id
            };
            if (allPicked && !order.pickedAt) updates.pickedAt = new Date().toISOString();
            if (allPacked && !order.packedAt) updates.packedAt = new Date().toISOString();

            await pickPackDb.update(order.id, updates);
            setOrder({ ...order, ...updates });
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    const handleShip = async () => {
        if (!order) return;

        try {
            setSaving(true);
            const now = new Date().toISOString();

            // Deduct stock for each packed item
            for (const item of order.items) {
                if (item.packed) {
                    try {
                        await inventoryDb.adjustStock(
                            item.productId,
                            -item.quantity,
                            `Shipped Order: ${order.orderNumber}`,
                            user?.name || 'System'
                        );
                    } catch (stockError) {
                        console.error(`Failed to deduct stock for ${item.productName}:`, stockError);
                        // We continue with other items, or we could bail?
                        // For now, let's log it. In a real app, we'd want atomic transactions.
                    }
                }
            }

            await pickPackDb.update(order.id, {
                status: 'shipped',
                shippedAt: now,
            });

            // Update main order status
            await ordersDb.updateStatus(order.orderId, 'shipped');

            Alert.alert(t('common.success'), t('pickPack.shipped'));
            navigation.goBack();
        } catch (error) {
            console.error('Error shipping order:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setSaving(false);
        }
    };

    if (loading || !order) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const isShipped = order.status === 'shipped';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={order.orderNumber} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.label, { color: theme.colors.subText }]}>{t('pickPack.customer')}</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>{order.customerName}</Text>

                    <Text style={[styles.label, { color: theme.colors.subText }]}>{t('checkout.shippingAddress')}</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>{order.shippingAddress}</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.colors.subText }]}>{t('pickPack.status')}</Text>
                            <Text style={[styles.value, { color: theme.colors.text }]}>{t(`pickPack.${order.status}`)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.colors.subText }]}>{t('pickPack.priority')}</Text>
                            <Text style={[styles.value, { color: theme.colors.text }]}>{t(`pickPack.${order.priority}`).toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('pickPack.orders')}</Text>

                {order.items.map((item) => (
                    <View key={item.productId} style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.itemHeader}>
                            <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.productName}</Text>
                            <Text style={[styles.itemQty, { color: theme.colors.primary }]}>x{item.quantity}</Text>
                        </View>

                        {item.location && (
                            <Text style={[styles.location, { color: theme.colors.subText }]}>
                                📍 {item.location}
                            </Text>
                        )}

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[
                                    styles.pickButton,
                                    { borderColor: item.picked ? '#10B981' : theme.colors.border },
                                    item.picked && { backgroundColor: '#10B98120' }
                                ]}
                                onPress={() => toggleItemStatus(item.productId, 'picked')}
                                disabled={isShipped}
                            >
                                <Text style={[styles.actionBtnText, { color: item.picked ? '#10B981' : theme.colors.text }]}>
                                    {item.picked ? '✓ ' + t('pickPack.picked') : t('pickPack.pick')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.packButton,
                                    { borderColor: item.packed ? '#3B82F6' : theme.colors.border },
                                    item.packed && { backgroundColor: '#3B82F620' }
                                ]}
                                onPress={() => toggleItemStatus(item.productId, 'packed')}
                                disabled={isShipped || !item.picked}
                            >
                                <Text style={[styles.actionBtnText, { color: item.packed ? '#3B82F6' : theme.colors.text }]}>
                                    {item.packed ? '✓ ' + t('pickPack.packed') : t('pickPack.pack')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {order.status === 'ready_to_ship' && (
                    <TouchableOpacity
                        style={[styles.shipButton, { backgroundColor: '#10B981' }]}
                        onPress={handleShip}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.shipButtonText}>{t('pickPack.ship')}</Text>
                        )}
                    </TouchableOpacity>
                )}
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
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        marginBottom: 24,
        backgroundColor: '#FFF',
    },
    row: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 24,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 20,
        color: '#000',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 8,
    },
    itemCard: {
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flex: 1,
        color: '#000',
    },
    itemQty: {
        fontSize: 16,
        fontWeight: '700',
    },
    location: {
        fontSize: 12,
        marginBottom: 20,
        fontStyle: 'italic',
        color: '#666',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    pickButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    packButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        fontWeight: '700',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    shipButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 40,
        backgroundColor: '#000',
    },
    shipButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
