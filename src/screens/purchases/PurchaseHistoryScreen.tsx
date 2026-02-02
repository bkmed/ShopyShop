import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { Order } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

export const PurchaseHistoryScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const [purchases, setPurchases] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            if (user) {
                const data = await ordersDb.getByUserId(user.id);
                // Only show completed or shipped orders maybe? 
                // For now, show all user orders as "Purchases"
                setPurchases(data);
            }
        } catch (error) {
            console.error('Error loading purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPurchases();
        }, [user]),
    );

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('PurchaseDetail', { id: item.id })}
        >
            <View style={styles.row}>
                <View>
                    <Text style={[styles.orderId, { color: theme.colors.text }]}>
                        #{item.id}
                    </Text>
                    <Text style={[styles.date, { color: theme.colors.subText }]}>
                        {item.createdAt}
                    </Text>
                </View>
                <View style={styles.rightInfo}>
                    <Text style={[styles.amount, { color: theme.colors.primary }]}>
                        {item.currency} {item.totalAmount}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Text style={[styles.statusText, { color: theme.colors.primary }]}>
                            {t(`orders.${item.status}`)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {t('purchases.title')}
                </Text>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={purchases}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ fontSize: 40, marginBottom: 16 }}>📦</Text>
                            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                                {t('orders.noOrders')}
                            </Text>
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
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
    },
    list: {
        paddingBottom: 40,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
