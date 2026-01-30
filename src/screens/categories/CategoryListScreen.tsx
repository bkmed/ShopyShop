import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { categoriesDb } from '../../database/categoriesDb';
import { Category } from '../../database/schema';

export const CategoryListScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesDb.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCategories();
        }, []),
    );

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('CategoryDetail', { id: item.id })}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={{ fontSize: 24 }}>📂</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                    {item.name}
                </Text>
                <Text style={[styles.categoryDesc, { color: theme.colors.subText }]} numberOfLines={1}>
                    {item.description || t('categories.noDescription')}
                </Text>
            </View>
            <Text style={{ color: theme.colors.primary }}>➔</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {t('categories.title')}
                </Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('CategoryAdd')}
                >
                    <Text style={styles.addButtonText}>+ {t('common.add')}</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={{ marginRight: 8 }}>🔍</Text>
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text }]}
                    placeholder={t('categories.search')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredCategories}
                    keyExtractor={item => item.id}
                    renderItem={renderCategoryItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.colors.subText }}>
                                {t('categories.noCategories')}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 100,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    categoryDesc: {
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
});
