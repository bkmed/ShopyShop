import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../utils/currencyUtils';
import { Product } from '../database/schema';

const { width } = Dimensions.get('window');

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export const ProductCard = ({
  product,
  onPress,
  onAddToCart,
}: ProductCardProps) => {
  const { theme } = useTheme();
  const { formatPrice } = useCurrency();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {product.imageUris && product.imageUris[0] ? (
          <Image source={{ uri: product.imageUris[0] }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: 'rgba(0,0,0,0.03)' },
            ]}
          >
            <Text style={{ fontSize: 40 }}>📦</Text>
          </View>
        )}
        {product.stockQuantity === 0 && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.name, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {product.name}
          </Text>
        </View>

        <Text style={[styles.price, { color: theme.colors.text }]}>
          {formatPrice(product.price, product.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width / 2 - 24,
    marginBottom: 32,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  price: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  soldOutBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  soldOutText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
});
