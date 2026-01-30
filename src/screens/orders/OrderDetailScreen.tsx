import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { Order, OrderItem } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

export const OrderDetailScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                const data = await ordersDb.getById(id);
                setOrder(data);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id]);

    const handleUpdateStatus = async (newStatus: Order['status']) => {
        await ordersDb.updateStatus(id, newStatus);
        setOrder(prev => prev ? { ...prev, status: newStatus } : null);
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.subText }}>{t('orders.notFound')}</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: OrderItem }) => (
        <View style={[styles.itemRow, { borderBottomColor: theme.colors.border }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                    {item.productName}
                </Text>
                <Text style={[styles.itemQty, { color: theme.colors.subText }]}>
                    x{item.quantity}
                </Text>
            </View>
            <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
                {item.currency} {item.priceAtPurchase * item.quantity}
            </Text>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.headerId}>#{order.id}</Text>
                <Text style={styles.headerStatus}>{order.status.toUpperCase()}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        {t('orders.items')}
                    </Text>
                    {order.items.map((item, idx) => (
                        <View key={item.productId + idx}>
                            {renderItem({ item })}
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: theme.colors.text }]}>{t('orders.totalAmount')}</Text>
                        <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                            {order.currency} {order.totalAmount}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        {t('orders.shippingAddress')}
                    </Text>
                    <Text style={[styles.address, { color: theme.colors.subText }]}>
                        {order.shippingAddress}
                    </Text>
                </View>

                {user?.role === 'admin' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {t('orders.manageStatus')}
                        </Text>
                        <View style={styles.statusButtons}>
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.statusBtn,
                                        {
                                            backgroundColor: order.status === s ? theme.colors.primary : theme.colors.surface,
                                            borderColor: theme.colors.primary,
                                            borderWidth: 1,
                                        },
                                    ]}
                                    onPress={() => handleUpdateStatus(s as any)}
                                >
                                    <Text
                                        style={{
                                            color: order.status === s ? '#FFF' : theme.colors.primary,
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {s.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerId: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerStatus: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginTop: 8,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemQty: {
        fontSize: 14,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    address: {
        fontSize: 16,
        lineHeight: 22,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    statusBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
