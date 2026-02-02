import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { promosDb } from '../../database/promosDb';

export const PromoAddEditScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { id } = route.params || {};
    const isEditing = !!id;

    const [code, setCode] = useState('');
    const [percentage, setPercentage] = useState('');
    const [categoryId, setCategoryId] = useState('all');
    const [isActive, setIsActive] = useState(true);
    const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    useEffect(() => {
        if (isEditing) {
            loadPromo();
        }
    }, [id]);

    const loadPromo = async () => {
        const promo = await promosDb.getById(id);
        if (promo) {
            setCode(promo.code);
            setPercentage(promo.percentage.toString());
            setCategoryId(promo.categoryId);
            setIsActive(promo.isActive);
            setExpiryDate(promo.expiryDate.split('T')[0]);
        }
    };

    const handleSave = async () => {
        if (!code || !percentage) {
            Alert.alert('Error', 'Code and Percentage are required');
            return;
        }

        const promoData = {
            code,
            percentage: parseFloat(percentage),
            categoryId,
            isActive,
            expiryDate: new Date(expiryDate).toISOString(),
        };

        try {
            if (isEditing) {
                await promosDb.update(id, promoData);
            } else {
                await promosDb.add(promoData);
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save promo');
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Code</Text>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="SUMMER2024"
                    placeholderTextColor={theme.colors.subText}
                    autoCapitalize="characters"
                />

                <Text style={[styles.label, { color: theme.colors.text }]}>Percentage (%)</Text>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={percentage}
                    onChangeText={setPercentage}
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={theme.colors.subText}
                />

                <Text style={[styles.label, { color: theme.colors.text }]}>Category ID (or 'all')</Text>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={categoryId}
                    onChangeText={setCategoryId}
                    placeholder="electronics"
                    placeholderTextColor={theme.colors.subText}
                />

                <View style={styles.switchRow}>
                    <Text style={[styles.label, { color: theme.colors.text, marginBottom: 0 }]}>Active</Text>
                    <Switch value={isActive} onValueChange={setIsActive} />
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveBtnText}>Save Promo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    form: {
        padding: 20,
        borderRadius: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    saveBtn: {
        marginTop: 32,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
