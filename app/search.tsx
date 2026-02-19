import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import PropertyCard from '@/components/property/PropertyCard';
import GraphQLClient from '@/lib/graphql-client';
import { searchShortTermProperties, getPropertiesByLocation } from '@/lib/graphql/queries';
import { toTitleCase, formatDateShort } from '@/lib/utils/common';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#374151' }, 'background');

  // Parse search parameters
  const rentalType = (params.rentalType as string) === 'short-term' ? RentalType.SHORT_TERM : RentalType.LONG_TERM;
  const location = params.location as string;
  const region = params.region as string;
  const district = params.district as string;
  const checkInDate = params.checkInDate as string;
  const checkOutDate = params.checkOutDate as string;
  const moveInDate = params.moveInDate as string;

  const isShortTerm = rentalType === RentalType.SHORT_TERM;

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setError(null);
      
      if (isShortTerm) {
        // For short-term, we need checkIn/checkOut dates and number of guests
        // If not provided, use defaults (today to one month from today, 2 guests)
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        
        const defaultCheckIn = checkInDate || today.toISOString().split('T')[0];
        const defaultCheckOut = checkOutDate || oneMonthLater.toISOString().split('T')[0];
        
        const data = await GraphQLClient.executePublic<{ searchShortTermProperties: any }>(
          searchShortTermProperties,
          {
            input: {
              region: region || 'Dar es Salaam',
              district,
              checkInDate: defaultCheckIn,
              checkOutDate: defaultCheckOut,
              numberOfGuests: 2, // Default to 2 guests
            }
          }
        );
        setProperties(data.searchShortTermProperties?.properties || []);
      } else {
        const data = await GraphQLClient.executePublic<{ getPropertiesByLocation: any }>(
          getPropertiesByLocation,
          {
            region: region || 'Dar es Salaam',
            district,
            moveInDate,
          }
        );
        setProperties(data.getPropertiesByLocation?.properties || []);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [region, district, checkInDate, checkOutDate, moveInDate, rentalType]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProperties();
  };

  const getSearchTitle = () => {
    const locationText = location || district || region || 'Properties';
    return toTitleCase(locationText);
  };

  const getSearchSubtitle = () => {
    if (isShortTerm && checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return `${formatDateShort(checkInDate)} - ${formatDateShort(checkOutDate)} • ${nights} night${nights !== 1 ? 's' : ''}`;
    }
    if (!isShortTerm && moveInDate) {
      return `Move in: ${formatDateShort(moveInDate)}`;
    }
    return isShortTerm ? 'Short-term stays' : 'Long-term rentals';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Search Results</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Searching properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {getSearchTitle()}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {getSearchSubtitle()}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text style={[styles.errorTitle, { color: textColor }]}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={fetchProperties}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : properties.length > 0 ? (
          <>
            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: textColor }]}>
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              </Text>
            </View>

            {/* Property List - Vertical cards like web */}
            <View style={styles.propertyList}>
              {properties.map((property) => (
                <TouchableOpacity
                  key={property.propertyId}
                  style={[styles.searchCard, { backgroundColor: headerBg, borderColor }]}
                  onPress={() => {
                    // Navigate to appropriate property details page
                    if (isShortTerm) {
                      router.push(`/short-property/${property.propertyId}` as any);
                    } else {
                      router.push(`/property/${property.propertyId}` as any);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {/* Horizontal layout: Image on left, content on right */}
                  <View style={styles.cardContent}>
                    {/* Property Image */}
                    <View style={styles.cardImageContainer}>
                      {property.thumbnail ? (
                        <Image
                          source={{ uri: property.thumbnail }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.cardImagePlaceholder, { backgroundColor: borderColor }]}>
                          <Ionicons name="home-outline" size={32} color="#999" />
                        </View>
                      )}
                    </View>

                    {/* Property Details */}
                    <View style={styles.cardDetails}>
                      {/* Location */}
                      <Text style={styles.cardLocation} numberOfLines={1}>
                        {property.district || property.region}
                      </Text>

                      {/* Title */}
                      <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
                        {property.title}
                      </Text>

                      {/* Property Type & Bedrooms */}
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {property.propertyType}
                        {property.bedrooms && ` • ${property.bedrooms} bed${property.bedrooms > 1 ? 's' : ''}`}
                        {property.maxGuests && ` • ${property.maxGuests} guest${property.maxGuests > 1 ? 's' : ''}`}
                      </Text>

                      {/* Price */}
                      <View style={styles.cardPriceRow}>
                        <View style={styles.cardPriceContainer}>
                          <Text style={[styles.cardPrice, { color: textColor }]}>
                            {property.currency} {(isShortTerm ? property.nightlyRate : property.monthlyRent)?.toLocaleString()}
                          </Text>
                          <Text style={styles.cardPriceUnit}>
                            {isShortTerm ? 'per night' : 'per month'}
                          </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: borderColor }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              console.log('Chat:', property.propertyId);
                            }}
                          >
                            <Ionicons name="chatbubble-outline" size={16} color={textColor} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: borderColor }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              console.log('Favorite:', property.propertyId);
                            }}
                          >
                            <Ionicons name="heart-outline" size={16} color={textColor} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ddd" />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No properties found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search criteria or explore other locations
            </Text>
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: tintColor }]}
              onPress={() => router.back()}
            >
              <Text style={styles.exploreButtonText}>Back to Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#717171',
  },
  filterButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  propertyList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  searchCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
  },
  cardImageContainer: {
    width: 120,
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  cardMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardPriceUnit: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
