import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { stockReceptionDb, StockReception } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';

export const StockReceptionListScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [receptions, setReceptions] = useState<StockReception[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await stockReceptionDb.getAll();
            setReceptions(data);
        } catch (error) {
            console.error('Error loading stock receptions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const filteredReceptions = receptions.filter(r =>
        r.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'in_progress': return '#3B82F6';
            case 'cancelled': return '#EF4444';
            default: return theme.colors.subText;
        }
    };

    const renderItem = ({ item }: { item: StockReception }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('StockReceptionDetail', { receptionId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.ref, { color: theme.colors.text }]}>
                    {item.referenceNumber || item.id}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {t(`stockReception.${item.status}`)}
                    </Text>
                </View>
            </View>

            <Text style={[styles.supplier, { color: theme.colors.subText }]}>
                {item.supplierName}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={[styles.date, { color: theme.colors.subText }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.items, { color: theme.colors.text }]}>
                    {item.items.length} {t('stockReception.items')}
                </Text>
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
            <GlassHeader title={t('stockReception.title')} />

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
                    placeholder={t('common.searchPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredReceptions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                            {t('stockReception.noReceptions')}
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
    header: {
        padding: 16,
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
        ...StyleSheet.absoluteFillObject,
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    ref: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    supplier: {
        fontSize: 14,
        marginBottom: 12,
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
    items: {
        fontSize: 14,
        fontWeight: '600',
    },
    empty: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
