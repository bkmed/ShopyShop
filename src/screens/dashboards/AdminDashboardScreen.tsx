import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { ordersDb } from '../../database/ordersDb';
import { productsDb } from '../../database/productsDb';
import { categoriesDb } from '../../database/categoriesDb';

export const AdminDashboardScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalCategories: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [orders, products, categories] = await Promise.all([
                ordersDb.getAll(),
                productsDb.getAll(),
                categoriesDb.getAll(),
            ]);

            const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

            setStats({
                totalOrders: orders.length,
                totalProducts: products.length,
                totalCategories: categories.length,
                revenue,
            });
        } catch (error) {
            console.error('Error loading admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, []),
    );

    const StatCard = ({ title, value, icon, color }: any) => (
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Text style={{ fontSize: 24 }}>{icon}</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: theme.colors.subText }]}>{title}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Console</Text>

            <View style={styles.statsGrid}>
                <StatCard title="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon="💰" color="#4CD964" />
                <StatCard title="Orders" value={stats.totalOrders} icon="🛍️" color="#5856D6" />
                <StatCard title="Products" value={stats.totalProducts} icon="📦" color="#FF9500" />
                <StatCard title="Categories" value={stats.totalCategories} icon="📂" color="#FF2D55" />
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Products')}
                >
                    <Text style={{ fontSize: 24 }}>➕</Text>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Manage Products</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Categories')}
                >
                    <Text style={{ fontSize: 24 }}>📁</Text>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Manage Categories</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Orders')}
                >
                    <Text style={{ fontSize: 24 }}>🚚</Text>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>View All Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Analytics')}
                >
                    <Text style={{ fontSize: 24 }}>📈</Text>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>Global Analytics</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        width: '48%',
        padding: 24,
        borderRadius: 28,
        marginBottom: 16,
        ...theme.shadows.medium,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
    },
    statTitle: {
        fontSize: 13,
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 40,
    },
    actionBtn: {
        flex: 1,
        minWidth: '45%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.small,
    },
    actionText: {
        marginTop: 12,
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
