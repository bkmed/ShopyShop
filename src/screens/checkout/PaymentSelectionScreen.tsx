import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { GlassHeader } from '../../components/common/GlassHeader';

export const PaymentSelectionScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { deliveryMethod, shippingAddress } = route.params || {};

    const [selectedMethod, setSelectedMethod] = useState('card');

    const handleContinue = () => {
        navigation.navigate('ReviewCart', {
            deliveryMethod,
            shippingAddress,
            paymentMethod: selectedMethod
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <GlassHeader title={t('checkout.payment') || "PAYMENT"} showBack onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
                    {t('checkout.choosePayment') || 'CHOOSE PAYMENT METHOD'}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.methodCard,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: selectedMethod === 'card' ? theme.colors.primary : 'transparent',
                            borderWidth: selectedMethod === 'card' ? 2 : 0
                        }
                    ]}
                    onPress={() => setSelectedMethod('card')}
                    activeOpacity={0.8}
                >
                    <View style={styles.row}>
                        <Text style={{ fontSize: 32, marginRight: 16 }}>💳</Text>
                        <View>
                            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>Credit / Debit Card</Text>
                            <Text style={[styles.methodSub, { color: theme.colors.subText }]}>Visa, Mastercard, Amex</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.methodCard,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: selectedMethod === 'cash' ? theme.colors.primary : 'transparent',
                            borderWidth: selectedMethod === 'cash' ? 2 : 0
                        }
                    ]}
                    onPress={() => setSelectedMethod('cash')}
                    activeOpacity={0.8}
                >
                    <View style={styles.row}>
                        <Text style={{ fontSize: 32, marginRight: 16 }}>💵</Text>
                        <View>
                            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>Cash on Delivery</Text>
                            <Text style={[styles.methodSub, { color: theme.colors.subText }]}>Pay when you receive</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.methodCard,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: selectedMethod === 'apple' ? theme.colors.primary : 'transparent',
                            borderWidth: selectedMethod === 'apple' ? 2 : 0
                        }
                    ]}
                    onPress={() => setSelectedMethod('apple')}
                    activeOpacity={0.8}
                >
                    <View style={styles.row}>
                        <Text style={{ fontSize: 32, marginRight: 16 }}>🍎</Text>
                        <View>
                            <Text style={[styles.methodTitle, { color: theme.colors.text }]}>Apple Pay</Text>
                            <Text style={[styles.methodSub, { color: theme.colors.subText }]}>Fast and secure</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueText}>REVIEW ORDER</Text>
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
        paddingTop: 100,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    methodSub: {
        fontSize: 11,
        color: '#666',
        letterSpacing: 0.5,
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
    },
    continueText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});
