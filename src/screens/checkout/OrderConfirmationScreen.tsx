import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export const OrderConfirmationScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params || {};

    const handleContinueShopping = () => {
        navigation.navigate('Home');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={[styles.title, { color: theme.colors.text }]}>SUCCESS</Text>
                <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
                    YOUR ORDER HAS BEEN PLACED SUCCESSFULLY.
                </Text>

                <View style={[styles.orderRefBox, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.refLabel, { color: theme.colors.subText }]}>ORDER NUMBER</Text>
                    <Text style={[styles.refValue, { color: theme.colors.text }]}>{orderId}</Text>
                </View>

                <Text style={[styles.emailInfo, { color: theme.colors.subText }]}>
                    WE HAVE SENT A CONFIRMATION EMAIL TO YOUR REGISTERED ADDRESS.
                </Text>

                <TouchableOpacity
                    style={[styles.receiptButton, { borderColor: theme.colors.text }]}
                    onPress={() => alert('Download starting...')}
                >
                    <Text style={[styles.receiptText, { color: theme.colors.text }]}>DOWNLOAD RECEIPT</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.doneButton, { backgroundColor: theme.colors.text }]}
                    onPress={handleContinueShopping}
                >
                    <Text style={[styles.doneText, { color: theme.colors.background }]}>CONTINUE SHOPPING</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 30,
        fontWeight: '200',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 20,
        letterSpacing: 1,
        marginBottom: 40,
    },
    orderRefBox: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
    },
    refLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    refValue: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    emailInfo: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 18,
        letterSpacing: 1,
        marginBottom: 40,
    },
    receiptButton: {
        borderWidth: 1,
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    receiptText: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    footer: {
        padding: 20,
    },
    doneButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneText: {
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});
