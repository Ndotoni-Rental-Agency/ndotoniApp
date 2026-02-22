import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface PropertyCardProps {
  propertyId: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  bedrooms?: number;
  priceUnit: 'night' | 'month';
  propertyType?: string;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorited?: boolean;
}

export default function PropertyCard({
  propertyId,
  title,
  location,
  price,
  currency = 'TZS',
  rating,
  reviews,
  thumbnail,
  bedrooms,
  priceUnit,
  propertyType,
  onPress,
  onFavoritePress,
  isFavorited = false,
}: PropertyCardProps) {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('en-US');
  };

  const formatCurrency = (curr: string) => {
    return curr === 'TZS' ? 'Tshs' : curr;
  };

  // Default navigation handler if none provided
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to property details based on rental type
      if (priceUnit === 'night') {
        router.push(`/short-property/${propertyId}`);
      } else {
        router.push(`/property/${propertyId}`);
      }
    }
  };

  // Ensure all text values are strings
  const safeLocation = String(location || 'Unknown Location');
  const safeCurrency = String(currency || 'TZS');
  const safePrice = Number(price) || 0;
  const safeRating = Number(rating) || 0;
  const safeBedrooms = Number(bedrooms) || 0;

  // Normalize location - capitalize first letter of each word
  const normalizeLocation = (loc: string) => {
    return loc
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format property type for display
  const formatPropertyType = (type?: string) => {
    if (!type) return null;
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Property Image with Enhanced Shadow */}
      <View style={styles.imageContainer}>
        {thumbnail ? (
          <Image 
            source={{ uri: thumbnail }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: cardBg }]}>
            <Ionicons name="image-outline" size={48} color="#999" />
          </View>
        )}
        {/* Favorite Icon with Better Backdrop */}
        <TouchableOpacity 
          style={styles.favoriteIcon}
          onPress={onFavoritePress}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorited ? "#FF385C" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      {/* Property Info with Better Spacing */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={[styles.location, { color: textColor }]} numberOfLines={1}>
            {normalizeLocation(safeLocation)}
          </Text>
          {safeRating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={13} color="#FFB800" />
              <Text style={[styles.ratingText, { color: textColor }]}>{safeRating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.detailsRow}>
          {propertyType && (
            <Text style={styles.propertyType}>
              {formatPropertyType(propertyType)}
            </Text>
          )}
          {propertyType && safeBedrooms > 0 && (
            <Text style={styles.separator}>•</Text>
          )}
          {safeBedrooms > 0 && (
            <Text style={styles.bedrooms}>
              {safeBedrooms} bed{safeBedrooms > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: textColor }]}>
            {formatCurrency(safeCurrency)} {formatPrice(safePrice)}
          </Text>
          <Text style={styles.priceUnit}>
            {' '}/ {priceUnit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.05,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 1.05,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    gap: 4,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    color: '#717171',
    marginHorizontal: 6,
  },
  bedrooms: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '400',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '400',
  },
});
