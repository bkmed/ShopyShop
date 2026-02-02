import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { addressesDb, Address } from '../../database/checkoutDb';

export const AddressManagementScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const data = await addressesDb.getAll(user.id);
            setAddresses(data);
        } catch (error) {
            console.error('Error loading addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address: Address) => {
        navigation.navigate('AddressAddEdit', { addressId: address.id });
    };

    const handleDelete = async (id: string) => {
        try {
            await addressesDb.delete(id);
            await loadAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await addressesDb.update(id, { isDefault: true });
            await loadAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {t('checkout.myAddresses') || 'My Addresses'}
                </Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('AddressAddEdit')}
                >
                    <Text style={styles.addButtonText}>+ {t('common.add') || 'Add'}</Text>
                </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                        {t('checkout.noAddresses') || 'No addresses saved yet'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('AddressAddEdit')}
                    >
                        <Text style={styles.buttonText}>{t('checkout.addFirstAddress') || 'Add Your First Address'}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                addresses.map(address => (
                    <View
                        key={address.id}
                        style={[
                            styles.addressCard,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: address.isDefault ? theme.colors.primary : theme.colors.border,
                                borderWidth: address.isDefault ? 2 : 1,
                            },
                        ]}
                    >
                        {address.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: theme.colors.primary }]}>
                                <Text style={styles.defaultText}>{t('checkout.default') || 'Default'}</Text>
                            </View>
                        )}
                        <Text style={[styles.addressName, { color: theme.colors.text }]}>
                            {address.fullName}
                        </Text>
                        <Text style={[styles.addressText, { color: theme.colors.subText }]}>
                            {address.addressLine1}
                        </Text>
                        {address.addressLine2 && (
                            <Text style={[styles.addressText, { color: theme.colors.subText }]}>
                                {address.addressLine2}
                            </Text>
                        )}
                        <Text style={[styles.addressText, { color: theme.colors.subText }]}>
                            {address.city}, {address.state} {address.postalCode}
                        </Text>
                        <Text style={[styles.addressText, { color: theme.colors.subText }]}>
                            {address.country}
                        </Text>
                        <Text style={[styles.addressText, { color: theme.colors.subText }]}>
                            📞 {address.phone}
                        </Text>

                        <View style={styles.actions}>
                            {!address.isDefault && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                                    onPress={() => handleSetDefault(address.id)}
                                >
                                    <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                                        {t('checkout.setDefault') || 'Set as Default'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                                onPress={() => handleEdit(address)}
                            >
                                <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                                    {t('common.edit') || 'Edit'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { borderColor: '#FF4444' }]}
                                onPress={() => handleDelete(address.id)}
                            >
                                <Text style={[styles.actionText, { color: '#FF4444' }]}>
                                    {t('common.delete') || 'Delete'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 20,
    },
    primaryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    addressCard: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    defaultBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addressName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
