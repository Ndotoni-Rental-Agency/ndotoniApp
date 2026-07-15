import { useThemeColor } from '@/hooks/use-theme-color';
import { Review } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertyReviews } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PropertyReviewsProps {
  propertyId: string;
  averageRating?: number | null;
  totalReviews?: number | null;
  ratingSummary?: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
  } | null;
}

export default function PropertyReviews({
  propertyId,
  averageRating,
  totalReviews,
  ratingSummary,
}: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');

  useEffect(() => {
    fetchReviews();
  }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      const data = await GraphQLClient.executePublic<any>(getPropertyReviews, {
        propertyId,
        limit: 20,
      });
      const items = data.getPropertyReviews?.reviews || [];
      setReviews(items);
    } catch (err) {
      console.error('[PropertyReviews] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no rating data and no reviews
  if (!averageRating && !totalReviews && !loading && reviews.length === 0) {
    return null;
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);
  const hasMore = reviews.length > 3;

  // Rating categories for breakdown
  const categories = ratingSummary ? [
    { label: 'Cleanliness', value: ratingSummary.cleanliness },
    { label: 'Accuracy', value: ratingSummary.accuracy },
    { label: 'Communication', value: ratingSummary.communication },
    { label: 'Location', value: ratingSummary.location },
    { label: 'Value', value: ratingSummary.value },
  ] : [];

  return (
    <View style={styles.container}>
      {/* Header with overall rating */}
      <View style={styles.header}>
        <View style={styles.ratingBig}>
          <Ionicons name="star" size={22} color="#f59e0b" />
          <Text style={[styles.ratingNumber, { color: text }]}>
            {(averageRating ?? 0).toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.title, { color: text }]}>
          {(totalReviews ?? 0)} review{(totalReviews ?? 0) !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Rating breakdown bars */}
      {categories.length > 0 && (
        <View style={styles.breakdown}>
          {categories.map((cat) => (
            <View key={cat.label} style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: subtle }]}>{cat.label}</Text>
              <View style={[styles.barTrack, { backgroundColor: border }]}>
                <View style={[styles.barFill, { width: `${(cat.value / 5) * 100}%`, backgroundColor: text }]} />
              </View>
              <Text style={[styles.breakdownValue, { color: text }]}>{cat.value.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reviews list */}
      {loading ? (
        <ActivityIndicator color={tint} style={{ paddingVertical: 20 }} />
      ) : reviews.length > 0 ? (
        <View style={styles.reviewsList}>
          {visibleReviews.map((review) => (
            <View key={review.reviewId} style={styles.reviewItem}>
              {/* Guest info */}
              <View style={styles.reviewHeader}>
                <View style={[styles.avatar, { backgroundColor: `${tint}15` }]}>
                  <Text style={[styles.avatarText, { color: tint }]}>
                    {(review.guest?.firstName || 'G').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.guestName, { color: text }]}>
                    {review.guest?.firstName || 'Guest'}
                  </Text>
                  <Text style={[styles.reviewDate, { color: subtle }]}>
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={i <= review.overallRating ? '#f59e0b' : border}
                    />
                  ))}
                </View>
              </View>
              {/* Comment */}
              {review.comment && (
                <Text style={[styles.comment, { color: text }]} numberOfLines={showAll ? undefined : 3}>
                  {review.comment}
                </Text>
              )}
              {/* Verified badge */}
              {review.verifiedStay && (
                <View style={styles.verified}>
                  <Ionicons name="checkmark-circle" size={13} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified stay</Text>
                </View>
              )}
            </View>
          ))}

          {/* Show more/less button */}
          {hasMore && (
            <TouchableOpacity
              style={[styles.showMoreBtn, { borderColor: text }]}
              onPress={() => setShowAll(!showAll)}
            >
              <Text style={[styles.showMoreText, { color: text }]}>
                {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text style={[styles.noReviews, { color: subtle }]}>
          No written reviews yet
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  ratingBig: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Rating breakdown
  breakdown: {
    gap: 10,
    marginBottom: 24,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    width: 100,
    fontSize: 13,
  },
  barTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  breakdownValue: {
    width: 28,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Reviews list
  reviewsList: {
    gap: 20,
  },
  reviewItem: {
    gap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  guestName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 1,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  comment: {
    fontSize: 15,
    lineHeight: 22,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  showMoreBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  noReviews: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
