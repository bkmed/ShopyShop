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
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { stockReceptionDb, productsDb, inventoryDb, StockReception, StockReceptionItem } from '../../database';
import { GlassHeader } from '../../components/common/GlassHeader';
import { useAuth } from '../../context/AuthContext';

export const StockReceptionDetailScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { receptionId } = route.params;

    const [loading, setLoading] = useState(true);
    const [reception, setReception] = useState<StockReception | null>(null);
    const [receivedQuantities, setReceivedQuantities] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await stockReceptionDb.getById(receptionId);
            if (data) {
                setReception(data);
                const initialQs: Record<string, string> = {};
                data.items.forEach(item => {
                    initialQs[item.productId] = item.receivedQuantity.toString();
                });
                setReceivedQuantities(initialQs);
            }
        } catch (error) {
            console.error('Error loading stock reception detail:', error);
        } finally {
            setLoading(false);
        }
    }, [receptionId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleQuantityChange = (productId: string, val: string) => {
        setReceivedQuantities(prev => ({ ...prev, [productId]: val }));
    };

    const handleComplete = async () => {
        if (!reception) return;

        try {
            setSaving(true);
            const updatedItems = reception.items.map(item => ({
                ...item,
                receivedQuantity: parseInt(receivedQuantities[item.productId] || '0', 10),
            }));

            await stockReceptionDb.update(reception.id, {
                items: updatedItems,
                status: 'completed',
                receivedDate: new Date().toISOString(),
                receivedBy: user?.id,
            });

            // Update product inventory
            for (const item of updatedItems) {
                const product = await productsDb.getById(item.productId);
                if (product) {
                    const newStock = product.stockQuantity + item.receivedQuantity;
                    await productsDb.update(product.id, { stockQuantity: newStock });

                    // Log movement
                    await inventoryDb.adjustStock(
                        product.id,
                        item.receivedQuantity,
                        `Stock Reception: ${reception.referenceNumber || reception.id}`,
                        user?.name || 'Unknown'
                    );
                }
            }

            Alert.alert(t('common.success'), t('stockReception.completedSuccess'));
            navigation.goBack();
        } catch (error) {
            console.error('Error completing reception:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setSaving(false);
        }
    };

    if (loading || !reception) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const isEditable = reception.status !== 'completed' && reception.status !== 'cancelled';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={reception.referenceNumber || t('stockReception.detail')} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.label, { color: theme.colors.subText }]}>{t('suppliers.title')}</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>{reception.supplierName}</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.colors.subText }]}>{t('stockReception.status')}</Text>
                            <Text style={[styles.value, { color: theme.colors.text }]}>{t(`stockReception.${reception.status}`)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: theme.colors.subText }]}>{t('stockReception.receivedDate')}</Text>
                            <Text style={[styles.value, { color: theme.colors.text }]}>
                                {reception.receivedDate ? new Date(reception.receivedDate).toLocaleDateString() : '-'}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stockReception.items')}</Text>

                {reception.items.map((item) => (
                    <View key={item.productId} style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.productName}</Text>
                        <View style={styles.itemRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.itemLabel, { color: theme.colors.subText }]}>{t('stockReception.expectedQuantity')}</Text>
                                <Text style={[styles.itemValue, { color: theme.colors.text }]}>{item.expectedQuantity}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.itemLabel, { color: theme.colors.subText }]}>{t('stockReception.receivedQuantity')}</Text>
                                <TextInput
                                    style={[
                                        styles.qtyInput,
                                        {
                                            backgroundColor: theme.colors.background,
                                            color: theme.colors.text,
                                            borderColor: theme.colors.border,
                                        },
                                        !isEditable && { opacity: 0.6 }
                                    ]}
                                    keyboardType="numeric"
                                    value={receivedQuantities[item.productId]}
                                    onChangeText={(val) => handleQuantityChange(item.productId, val)}
                                    editable={isEditable}
                                />
                            </View>
                        </View>
                    </View>
                ))}

                {isEditable && (
                    <TouchableOpacity
                        style={[styles.completeButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleComplete}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.completeButtonText}>{t('stockReception.complete')}</Text>
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
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    itemCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    itemValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    qtyInput: {
        width: 80,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        textAlign: 'center',
        paddingHorizontal: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    completeButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    completeButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
