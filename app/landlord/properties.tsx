import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { useLandlordProperties } from '@/hooks/useLandlordProperties';
import { useLandlordShortTermProperties } from '@/hooks/useLandlordShortTermProperties';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LandlordPropertiesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const [selectedTab, setSelectedTab] = useState<'long-term' | 'short-term'>('long-term');
  const [refreshing, setRefreshing] = useState(false);

  // Long-term properties
  const {
    properties: longTermProperties,
    loading: longTermLoading,
    error: longTermError,
    refetch: refetchLongTerm,
  } = useLandlordProperties();

  // Short-term properties
  const {
    properties: shortTermProperties,
    loading: shortTermLoading,
    error: shortTermError,
    refetch: refetchShortTerm,
  } = useLandlordShortTermProperties(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === 'long-term') {
        await refetchLongTerm();
      } else {
        await refetchShortTerm();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const properties = selectedTab === 'long-term' ? longTermProperties : shortTermProperties;
  const loading = selectedTab === 'long-term' ? longTermLoading : shortTermLoading;
  const error = selectedTab === 'long-term' ? longTermError : shortTermError;

  const formatPrice = (amount: number, currency: string = 'TZS') => {
    return `${currency} ${amount?.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'PUBLISHED':
      case 'AVAILABLE':
        return '#10b981';
      case 'DRAFT':
        return '#f59e0b';
      case 'PENDING':
      case 'PENDING_REVIEW':
        return '#3b82f6';
      case 'INACTIVE':
      case 'REJECTED':
        return '#ef4444';
      default:
        return secondaryText;
    }
  };

  const renderPropertyCard = ({ item: property }: { item: any }) => {
    const isLongTerm = selectedTab === 'long-term';
    const thumbnail = isLongTerm 
      ? property.media?.images?.[0] 
      : property.thumbnail || property.images?.[0];
    
    const isDraft = !property.status || property.status === 'DRAFT';
    const isActive = property.status === 'ACTIVE' || property.status === 'AVAILABLE' || property.status === 'PUBLISHED';
    
    return (
      <View style={[styles.propertyCard, { backgroundColor: cardBg, borderColor }]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => {
            if (isLongTerm) {
              router.push(`/property/${property.propertyId}` as any);
            } else {
              router.push(`/short-property/${property.propertyId}` as any);
            }
          }}
          activeOpacity={0.7}
        >
          {/* Property Image */}
          <View style={styles.imageContainer}>
            {thumbnail ? (
              <Image
                source={{ uri: thumbnail }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: `${tintColor}20` }]}>
                <Ionicons name="home" size={40} color={tintColor} />
              </View>
            )}
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(property.status || 'DRAFT') },
              ]}
            >
              <Text style={styles.statusText}>
                {(property.status || 'DRAFT').toUpperCase()}
              </Text>
            </View>
            {!isLongTerm && (
              <View style={styles.nightlyBadge}>
                <Text style={styles.nightlyBadgeText}>Nightly</Text>
              </View>
            )}
          </View>

          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={2}>
              {property.title}
            </Text>
            
            <View style={styles.propertyLocation}>
              <Ionicons name="location-outline" size={14} color={secondaryText} />
              <Text style={[styles.locationText, { color: secondaryText }]} numberOfLines={1}>
                {property.district || property.address?.district}, {property.region || property.address?.region}
              </Text>
            </View>

            <View style={styles.propertyDetails}>
              <Text style={[styles.detailsText, { color: secondaryText }]}>
                {isLongTerm 
                  ? `${property.specifications?.bedrooms || property.bedrooms || 0} bed • ${property.specifications?.bathrooms || property.bathrooms || 0} bath`
                  : `${property.propertyType} • ${property.maxGuests || 0} guests`
                }
              </Text>
            </View>

            {!isLongTerm && property.averageRating && property.averageRating > 0 && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={[styles.ratingText, { color: textColor }]}>
                  {property.averageRating.toFixed(1)}
                </Text>
                {property.ratingSummary?.totalReviews && (
                  <Text style={[styles.reviewsText, { color: secondaryText }]}>
                    ({property.ratingSummary.totalReviews})
                  </Text>
                )}
              </View>
            )}

            <View style={styles.propertyFooter}>
              <View>
                <Text style={[styles.propertyPrice, { color: textColor }]}>
                  {isLongTerm
                    ? formatPrice(property.pricing?.monthlyRent || 0, property.pricing?.currency)
                    : formatPrice(property.nightlyRate || 0, property.currency)}
                </Text>
                <Text style={[styles.priceUnit, { color: secondaryText }]}>
                  {isLongTerm ? 'per month' : 'per night'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { borderTopColor: borderColor }]}>
          {/* Publish Button (only for drafts) */}
          {isDraft && (
            <TouchableOpacity
              style={[styles.actionButton, styles.publishButton]}
              onPress={() => {
                Alert.alert('Publish Property', 'Publishing functionality coming soon!');
              }}
            >
              <Text style={styles.publishButtonText}>Publish</Text>
            </TouchableOpacity>
          )}

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() => {
              if (isLongTerm) {
                router.push(`/landlord/property/${property.propertyId}` as any);
              } else {
                router.push(`/landlord/short-property/${property.propertyId}` as any);
              }
            }}
          >
            <Text style={[styles.actionButtonText, { color: textColor }]}>Edit</Text>
          </TouchableOpacity>

          {/* Calendar Button */}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() => {
              Alert.alert('Calendar', 'Calendar management coming soon!');
            }}
          >
            <Ionicons name="calendar-outline" size={16} color={textColor} />
            <Text style={[styles.actionButtonText, { color: textColor }]}>Calendar</Text>
          </TouchableOpacity>

          {/* Bookings Button (only for active properties) */}
          {isActive && !isLongTerm && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={() => {
                Alert.alert('Bookings', 'Bookings management coming soon!');
              }}
            >
              <Text style={[styles.actionButtonText, { color: textColor }]}>Bookings</Text>
            </TouchableOpacity>
          )}

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#ef4444' }]}
            onPress={() => {
              Alert.alert(
                'Delete Property',
                'Are you sure you want to delete this property? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Delete', 'Property deletion functionality coming soon!');
                    },
                  },
                ]
              );
            }}
          >
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Properties</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/list-property')} style={styles.addButton}>
          <Ionicons name="add" size={24} color={tintColor} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'long-term' && { borderBottomColor: tintColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setSelectedTab('long-term')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'long-term' ? tintColor : secondaryText },
            ]}
          >
            Long-term
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'short-term' && { borderBottomColor: tintColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setSelectedTab('short-term')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'short-term' ? tintColor : secondaryText },
            ]}
          >
            Short-term
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={properties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.propertyId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tintColor} />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[styles.loadingText, { color: secondaryText }]}>Loading properties...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: tintColor }]}
                onPress={handleRefresh}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={64} color={secondaryText} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No Properties Yet</Text>
              <Text style={[styles.emptyText, { color: secondaryText }]}>
                Start listing your {selectedTab === 'long-term' ? 'long-term' : 'short-term'} properties
              </Text>
              <TouchableOpacity
                style={[styles.addPropertyButton, { backgroundColor: tintColor }]}
                onPress={() => router.push('/(tabs)/list-property')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addPropertyButtonText}>Add Property</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  addPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addPropertyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  propertyCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 140,
    height: 140,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  nightlyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  nightlyBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  propertyDetails: {
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 13,
  },
  propertyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  propertyPrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  publishButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
