import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShortTermPropertyHeaderProps {
  title: string;
  district: string;
  region: string;
  averageRating?: number | null;
  totalReviews?: number;
  textColor: string;
  tintColor: string;
  secondaryText: string;
}

export default function ShortTermPropertyHeader({
  title,
  district,
  region,
  averageRating,
  totalReviews,
  textColor,
  tintColor,
  secondaryText,
}: ShortTermPropertyHeaderProps) {
  const formatPrice = (amount: number, curr: string) => {
    return `${curr} ${amount?.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={18} color={tintColor} />
        <Text style={[styles.locationText, { color: textColor }]}>
          {district}, {region}
        </Text>
      </View>
      
      {/* Rating */}
      {averageRating && averageRating > 0 && (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={[styles.ratingText, { color: textColor }]}>
            {averageRating.toFixed(1)}
          </Text>
          {totalReviews && totalReviews > 0 && (
            <Text style={[styles.reviewsText, { color: secondaryText }]}>
              ({totalReviews} reviews)
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 34,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
  },
  reviewsText: {
    fontSize: 14,
  },
  priceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  priceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  priceLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
