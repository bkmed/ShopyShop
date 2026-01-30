import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { selectAllProducts } from '../../store/slices/productsSlice';
import { selectAllCategories } from '../../store/slices/categoriesSlice';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'category';
  originalItem: any;
}

export const SearchOverlay = ({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SearchResult) => void;
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const { setActiveTab } = React.useContext(WebNavigationContext) as any;

  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectAllCategories);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search Products
    products.forEach(p => {
      if (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: p.id,
          title: p.name,
          subtitle: `${p.currency} ${p.price}`,
          type: 'product',
          originalItem: p,
        });
      }
    });

    // Search Categories
    categories.forEach(c => {
      if (c.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: c.id,
          title: c.name,
          subtitle: t('navigation.catalog'),
          type: 'category',
          originalItem: c,
        });
      }
    });

    return searchResults;
  }, [query, products, categories, t]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return '📦';
      case 'category':
        return '📁';
      default:
        return '🔍';
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => {
        if (Platform.OS === 'web') {
          if (item.type === 'product') {
            setActiveTab('Catalog', 'ProductDetails', { productId: item.id });
          } else {
            setActiveTab('Catalog');
          }
        } else {
          onSelect(item);
        }
        onClose();
      }}
    >
      <View
        style={[
          styles.typeIcon,
          { backgroundColor: `${theme.colors.primary}15` },
        ]}
      >
        <Text style={{ fontSize: 18 }}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.resultText}>
        <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.resultSubtitle, { color: theme.colors.subText }]}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
      >
        <View
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[
              styles.searchBar,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={query}
              onChangeText={setQuery}
              placeholder={
                t('common.searchPlaceholderGlobal') || 'Search products...'
              }
              placeholderTextColor={theme.colors.subText}
              autoFocus
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => `${item.type}-${item.id}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              query ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ color: theme.colors.subText }}>
                    {t('search.noResultsFor', { query })}
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchIcon: { fontSize: 20, marginRight: 12 },
  input: { flex: 1, fontSize: 18 },
  closeButton: { paddingLeft: 16 },
  list: { padding: 16 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultText: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: '600' },
  resultSubtitle: { fontSize: 13 },
  emptyContainer: { padding: 40, alignItems: 'center' },
});
