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
import { reclamationsDb, Reclamation, purchasesDb, Purchase } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const AdminReclamationDetailScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { reclamationId } = route.params;

    const [loading, setLoading] = useState(true);
    const [reclamation, setReclamation] = useState<Reclamation | null>(null);
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [updating, setUpdating] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reclamationsDb.getById(reclamationId);
            if (data) {
                setReclamation(data);
                const pData = await purchasesDb.getByOrderId(data.orderId);
                setPurchase(pData);
            }
        } catch (error) {
            console.error('Error loading admin reclamation detail:', error);
        } finally {
            setLoading(false);
        }
    }, [reclamationId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleUpdateStatus = async (newStatus: Reclamation['status']) => {
        if (!reclamation) return;
        try {
            setUpdating(true);
            await reclamationsDb.updateStatus(reclamation.id, newStatus);
            Alert.alert(t('common.success'), t('admin.reclamations.statusUpdated'));
            loadData();
        } catch (error) {
            console.error('Error updating reclamation status:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !reclamation) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return '#10B981';
            case 'in_progress': return '#3B82F6';
            case 'pending': return '#F59E0B';
            case 'rejected': return '#EF4444';
            default: return theme.colors.subText;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={t('reclamations.detail')} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{reclamation.reason}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reclamation.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(reclamation.status) }]}>
                                {t(`reclamations.status.${reclamation.status}`)}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: theme.colors.text }]}>
                        {reclamation.description}
                    </Text>

                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>{t('orders.order')}:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>#{reclamation.orderId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>{t('common.date')}:</Text>
                        <Text style={[styles.value, { color: theme.colors.text }]}>
                            {new Date(reclamation.createdAt).toLocaleString()}
                        </Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>
                        {t('admin.reclamations.actions') || 'Manage Reclamation'}
                    </Text>

                    <View style={styles.statusButtons}>
                        {['in_progress', 'resolved', 'rejected'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    { borderColor: getStatusColor(status) },
                                    reclamation.status === status && { backgroundColor: getStatusColor(status) + '20' }
                                ]}
                                onPress={() => handleUpdateStatus(status as Reclamation['status'])}
                                disabled={updating}
                            >
                                <Text style={[styles.statusBtnText, { color: getStatusColor(status) }]}>
                                    {t(`reclamations.status.${status}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {purchase && (
                    <TouchableOpacity
                        style={[styles.orderLink, { backgroundColor: theme.colors.surface }]}
                        onPress={() => navigation.navigate('AdminPurchaseDetail', { purchaseId: purchase.id })}
                    >
                        <Text style={[styles.orderLinkLabel, { color: theme.colors.text }]}>
                            {t('admin.reclamations.viewOrder') || 'View Associated Order'}
                        </Text>
                        <Text style={{ color: theme.colors.primary }}>→</Text>
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
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
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
    description: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
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
    orderLink: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 40,
    },
    orderLinkLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
});
