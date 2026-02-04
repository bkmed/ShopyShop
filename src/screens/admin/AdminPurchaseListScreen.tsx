import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { purchasesDb, Purchase } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';
import { useCurrency } from '../../utils/currencyUtils';

export const AdminPurchaseListScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const { formatPrice } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [purchasesData, statsData] = await Promise.all([
                purchasesDb.getAll(),
                purchasesDb.getStats(),
            ]);
            setPurchases(purchasesData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading admin purchases:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const filteredPurchases = purchases.filter(p => {
        const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.orderId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

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

    const renderStat = (label: string, value: string | number, color?: string) => (
        <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: color || theme.colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{label}</Text>
        </View>
    );

    const renderItem = ({ item }: { item: Purchase }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('AdminPurchaseDetail', { purchaseId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.orderId, { color: theme.colors.text }]}>#{item.orderId}</Text>
                    <Text style={[styles.userName, { color: theme.colors.subText }]}>{item.userName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {t(`orders.status.${item.status}`)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={[styles.date, { color: theme.colors.subText }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.amount, { color: theme.colors.primary }]}>
                    {formatPrice(item.totalAmount, item.currency)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !stats) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={t('admin.purchases.title') || 'Purchase Management'} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
                {stats && (
                    <>
                        {renderStat(t('admin.purchases.total'), stats.total)}
                        {renderStat(t('admin.purchases.revenue'), formatPrice(stats.totalRevenue, 'EUR'), '#10B981')}
                        {renderStat(t('orders.status.pending'), stats.pending, '#6B7280')}
                        {renderStat(t('orders.status.shipped'), stats.shipped, '#3B82F6')}
                    </>
                )}
            </ScrollView>

            <View style={styles.filters}>
                <TextInput
                    style={[
                        styles.searchInput,
                        {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                        },
                    ]}
                    placeholder={t('common.searchPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredPurchases}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                            {t('admin.purchases.noPurchases') || 'No purchases found'}
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
    statsContainer: {
        padding: 16,
        maxHeight: 120,
    },
    statBox: {
        padding: 16,
        borderRadius: 16,
        marginRight: 12,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    filters: {
        padding: 16,
        paddingTop: 0,
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
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userName: {
        fontSize: 14,
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
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    date: {
        fontSize: 12,
    },
    amount: {
        fontSize: 16,
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
