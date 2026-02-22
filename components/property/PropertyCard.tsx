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

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Property Image */}
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
        <TouchableOpacity 
          style={styles.favoriteIcon}
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={22} 
            color={isFavorited ? "#ef4444" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      {/* Property Info */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={[styles.location, { color: textColor }]} numberOfLines={1}>
            {normalizeLocation(safeLocation)}
          </Text>
          {safeBedrooms > 0 && (
            <Text style={styles.bedrooms}>
              {safeBedrooms} bed{safeBedrooms > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {safeRating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={[styles.ratingText, { color: textColor }]}>{safeRating.toFixed(1)}</Text>
          </View>
        )}
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: textColor }]}>
            {formatCurrency(safeCurrency)} {formatPrice(safePrice)}
          </Text>
          <Text style={styles.priceUnit}>
            {' '}per {priceUnit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.95,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 0.95,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    gap: 2,
    paddingHorizontal: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bedrooms: {
    fontSize: 14,
    color: '#717171',
    flexShrink: 0,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceUnit: {
    fontSize: 14,
    color: '#717171',
    marginLeft: 2,
  },
});
