import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { GlassHeader } from '../../components/common/GlassHeader';

export const DeliveryMethodScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    const [selectedMethod, setSelectedMethod] = useState('standard');

    const methods = [
        {
            id: 'standard',
            title: t('checkout.standardDelivery') || 'Standard Delivery',
            price: 5.90,
            time: '3-5 business days',
            icon: '🚚'
        },
        {
            id: 'express',
            title: t('checkout.expressDelivery') || 'Express Delivery',
            price: 12.90,
            time: '1-2 business days',
            icon: '🚀'
        },
        {
            id: 'pickup',
            title: t('checkout.storePickup') || 'Store Pickup',
            price: 0,
            time: 'Available today',
            icon: '🏪'
        }
    ];

    const handleContinue = () => {
        // Navigate to Address Selection, passing the selected method
        const method = methods.find(m => m.id === selectedMethod);
        navigation.navigate('AddressSelection', { deliveryMethod: method });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={t('checkout.deliveryMethod') || "DELIVERY METHOD"} showBack onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
                    {t('checkout.chooseDelivery') || 'CHOOSE YOUR DELIVERY METHOD'}
                </Text>

                {methods.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.methodCard,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: selectedMethod === method.id ? theme.colors.primary : 'transparent',
                                borderWidth: selectedMethod === method.id ? 2 : 0
                            }
                        ]}
                        onPress={() => setSelectedMethod(method.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.methodHeader}>
                            <View style={styles.iconContainer}>
                                <Text style={{ fontSize: 24 }}>{method.icon}</Text>
                            </View>
                            <View style={styles.methodInfo}>
                                <Text style={[styles.methodTitle, { color: theme.colors.text }]}>{method.title}</Text>
                                <Text style={[styles.methodTime, { color: theme.colors.subText }]}>{method.time}</Text>
                            </View>
                            <Text style={[styles.methodPrice, { color: theme.colors.primary }]}>
                                {method.price === 0 ? 'FREE' : `${method.price.toFixed(2)} €`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueText}>{t('common.continue') || 'CONTINUE'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        padding: 20,
        paddingTop: 100, // Space for GlassHeader
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 24,
    },
    methodCard: {
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    methodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#F5F5F5',
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    methodTime: {
        fontSize: 11,
        color: '#666',
        letterSpacing: 0.5,
    },
    methodPrice: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#E5E5E5',
    },
    continueButton: {
        height: 56,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0, // Sharp aesthetic
    },
    continueText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});
