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
import { useAuth } from '../../context/AuthContext';
import { ordersDb } from '../../database/ordersDb';
import { wishlistDb } from '../../database/wishlistDb';

export const UserDashboardScreen = () => {
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const [stats, setStats] = useState({
        orderCount: 0,
        wishlistCount: 0,
        recentStatus: 'None',
    });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [orders, wishlist] = await Promise.all([
                ordersDb.getByUserId(user.id),
                wishlistDb.getAll(),
            ]);

            setStats({
                orderCount: orders.length,
                wishlistCount: wishlist.length,
                recentStatus: orders.length > 0 ? orders[0].status : 'No orders',
            });
        } catch (error) {
            console.error('Error loading user dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [user]),
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
            <View style={styles.welcome}>
                <Text style={[styles.greeting, { color: theme.colors.text }]}>
                    {getTimeGreeting()}, {user?.name.split(' ')[0] || 'Shopper'} 👋
                </Text>
                <Text style={[styles.subGreeting, { color: theme.colors.subText }]}>
                    Your personalized shopping dashboard
                </Text>
            </View>

            <View style={styles.statsRow}>
                <TouchableOpacity
                    style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Orders')}
                >
                    <Text style={styles.statIcon}>📦</Text>
                    <Text style={[styles.statVal, { color: theme.colors.text }]}>{stats.orderCount}</Text>
                    <Text style={[styles.statLab, { color: theme.colors.subText }]}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Wishlist')}
                >
                    <Text style={styles.statIcon}>❤️</Text>
                    <Text style={[styles.statVal, { color: theme.colors.text }]}>{stats.wishlistCount}</Text>
                    <Text style={[styles.statLab, { color: theme.colors.subText }]}>Saved</Text>
                </TouchableOpacity>
            </View>

            <View
                style={[
                    styles.statusBanner,
                    {
                        backgroundColor: theme.colors.primary,
                        ...theme.shadows.medium,
                    }
                ]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle}>Active Order Status</Text>
                    <Text style={styles.bannerVal}>{stats.recentStatus.toUpperCase()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.bannerBtn}
                    onPress={() => navigation.navigate('Orders')}
                >
                    <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Track Order</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Shopping Experience</Text>
            <View style={styles.menu}>
                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('CatalogTab')}
                >
                    <Text style={styles.menuIcon}>🏬</Text>
                    <Text style={[styles.menuText, { color: theme.colors.text }]}>Browse Catalog</Text>
                    <Text style={{ color: theme.colors.subText }}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Chat')}
                >
                    <Text style={styles.menuIcon}>🤖</Text>
                    <Text style={[styles.menuText, { color: theme.colors.text }]}>Shopping Assistant</Text>
                    <Text style={{ color: theme.colors.subText }}>→</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.menuIcon}>👤</Text>
                    <Text style={[styles.menuText, { color: theme.colors.text }]}>Account Settings</Text>
                    <Text style={{ color: theme.colors.subText }}>→</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    welcome: {
        marginBottom: 30,
        marginTop: 10,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subGreeting: {
        fontSize: 16,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 28,
        marginBottom: 10,
    },
    statVal: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    statLab: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBanner: {
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    bannerTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    bannerVal: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4,
    },
    bannerBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    menu: {
        gap: 12,
        paddingBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
