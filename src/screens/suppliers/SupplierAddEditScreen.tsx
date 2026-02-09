import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { suppliersDb } from '../../database';

export const SupplierAddEditScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const supplierId = route.params?.supplierId;
    const isEditing = !!supplierId;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        notes: '',
        isActive: true,
    });

    useEffect(() => {
        if (isEditing) {
            loadSupplier();
        }
    }, [supplierId]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = t('suppliers.nameRequired');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = t('suppliers.emailRequired');
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = t('common.invalidEmail') || 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loadSupplier = async () => {
        try {
            setLoading(true);
            const supplier = await suppliersDb.getById(supplierId);
            if (supplier) {
                setFormData({
                    name: supplier.name,
                    contactPerson: supplier.contactPerson || '',
                    email: supplier.email,
                    phone: supplier.phone || '',
                    address: supplier.address || '',
                    website: supplier.website || '',
                    notes: supplier.notes || '',
                    isActive: supplier.isActive,
                });
            }
        } catch (error) {
            console.error('Error loading supplier:', error);
            Alert.alert(t('common.error'), t('common.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!validate()) {
            Alert.alert(t('common.error'), t('common.fillRequired') || 'Please fill all required fields correctly');
            return;
        }

        try {
            setSaving(true);
            if (isEditing) {
                await suppliersDb.update(supplierId, formData);
                Alert.alert(t('common.success'), t('suppliers.updated'));
            } else {
                await suppliersDb.add(formData);
                Alert.alert(t('common.success'), t('suppliers.added'));
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error saving supplier:', error);
            Alert.alert(t('common.error'), t('common.saveError'));
        } finally {
            setSaving(false);
        }
    };

    const RequiredLabel = ({ label }: { label: string }) => (
        <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
            <Text style={styles.requiredStar}>*</Text>
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
            <View style={styles.form}>
                <View style={styles.formGroup}>
                    <RequiredLabel label={t('suppliers.name')} />
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: errors.name ? '#EF4444' : theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.namePlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.name}
                        onChangeText={(text) => {
                            setFormData({ ...formData, name: text });
                            if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        {t('suppliers.contactPerson')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.contactPersonPlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.contactPerson}
                        onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <RequiredLabel label={t('common.email')} />
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: errors.email ? '#EF4444' : theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.emailPlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.email}
                        onChangeText={(text) => {
                            setFormData({ ...formData, email: text });
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        {t('common.phone')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.phonePlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        {t('common.address')}
                    </Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.addressPlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        {t('suppliers.website')}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.websitePlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.website}
                        onChangeText={(text) => setFormData({ ...formData, website: text })}
                        keyboardType="url"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        {t('suppliers.notes')}
                    </Text>
                    <TextInput
                        style={[
                            styles.textArea,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder={t('suppliers.notesPlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                        value={formData.notes}
                        onChangeText={(text) => setFormData({ ...formData, notes: text })}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.switchGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        {t('suppliers.isActive')}
                    </Text>
                    <Switch
                        value={formData.isActive}
                        onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                        trackColor={{ false: '#ccc', true: theme.colors.primary }}
                        thumbColor="#FFF"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditing ? t('common.update') : t('common.add')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
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
    form: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requiredStar: {
        color: '#EF4444',
        marginLeft: 4,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        textAlignVertical: 'top',
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    saveButton: {
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
