import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CLOUDFRONT_DOMAIN } from '@/lib/config';
import GraphQLClient from '@/lib/graphql-client';
import { getShortTermProperty } from '@/lib/graphql/queries';
import PropertyMapView from '@/components/map/PropertyMapView';
import { getApproximateCoordinates, CoordinatesInput } from '@/lib/geocoding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShortTermPropertyDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [coordinates, setCoordinates] = useState<CoordinatesInput | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#374151' }, 'background');

  const propertyId = params.id as string;

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  useEffect(() => {
    // Fetch coordinates if not available or if they're placeholder (0,0)
    const hasValidCoordinates = property?.coordinates && 
      property.coordinates.latitude !== 0 && 
      property.coordinates.longitude !== 0;
      
    if (property && !hasValidCoordinates) {
      fetchCoordinates();
    } else if (hasValidCoordinates) {
      setCoordinates(property.coordinates);
    }
  }, [property]);

  const fetchCoordinates = async () => {
    if (!property) return;

    try {
      console.log('[ShortTermProperty] Fetching coordinates for:', {
        region: property.region,
        district: property.district,
        ward: property.address?.ward,
      });
      
      const coords = await getApproximateCoordinates({
        region: property.region || '',
        district: property.district || '',
        ward: property.address?.ward,
        street: property.address?.street,
      });

      console.log('[ShortTermProperty] Coordinates result:', coords);

      if (coords) {
        setCoordinates(coords);
      } else {
        console.warn('[ShortTermProperty] No coordinates returned');
      }
    } catch (err) {
      console.error('[ShortTermProperty] Error fetching coordinates:', err);
    }
  };

  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[ShortTermProperty] Fetching from CloudFront:', propertyId);
      
      // Try CloudFront first
      const url = `${CLOUDFRONT_DOMAIN}/short-term-properties/${propertyId}.json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      console.log('[ShortTermProperty] CloudFront response:', response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.deleted) {
          setError('This property is no longer available');
          return;
        }
        console.log('[ShortTermProperty] Property loaded from CloudFront');
        setProperty(data);
        return;
      }

      // CloudFront miss, try GraphQL
      if (response.status === 403 || response.status === 404) {
        console.log('[ShortTermProperty] CloudFront miss, trying GraphQL');
        await fetchFromGraphQL();
        return;
      }

      setError('Failed to load property');
    } catch (err) {
      console.error('[ShortTermProperty] Error:', err);
      setError('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFromGraphQL = async () => {
    try {
      const data = await GraphQLClient.executePublic<{ getShortTermProperty: any }>(
        getShortTermProperty,
        { propertyId }
      );

      if (data.getShortTermProperty) {
        console.log('[ShortTermProperty] Property loaded from GraphQL');
        setProperty(data.getShortTermProperty);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      console.error('[ShortTermProperty] GraphQL error:', err);
      throw err;
    }
  };

  const formatPrice = (amount: number, currency: string = 'TZS') => {
    return `${currency} ${amount?.toLocaleString()}`;
  };

  const images = property?.images || [];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: textColor }]}>Error</Text>
          <Text style={styles.errorText}>{error || 'Property not found'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={fetchPropertyDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Floating Header */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
              onPress={() => console.log('Share')}
            >
              <Ionicons name="share-outline" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
              onPress={() => console.log('Favorite')}
            >
              <Ionicons name="heart-outline" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {images.length > 0 && (
          <View style={styles.imageGalleryContainer}>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setSelectedImageIndex(index);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1} / {images.length}
              </Text>
            </View>
          </View>
        )}

        {/* Property Info */}
        <View style={[styles.contentContainer, { backgroundColor: headerBg }]}>
          {/* Title and Location */}
          <View style={styles.section}>
            <Text style={[styles.propertyTitle, { color: textColor }]}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>
                {property.district}, {property.region}
              </Text>
            </View>
            {property.averageRating && property.averageRating > 0 && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={[styles.ratingText, { color: textColor }]}>
                  {property.averageRating.toFixed(1)}
                </Text>
                {property.ratingSummary?.totalReviews && (
                  <Text style={styles.reviewsText}>
                    ({property.ratingSummary.totalReviews} reviews)
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Property Features */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Property Details</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="people-outline" size={20} color={tintColor} />
                <Text style={[styles.featureText, { color: textColor }]}>
                  {property.maxGuests} guests
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="calendar-outline" size={20} color={tintColor} />
                <Text style={[styles.featureText, { color: textColor }]}>
                  {property.minimumStay} night min
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={20} color={tintColor} />
                <Text style={[styles.featureText, { color: textColor }]}>
                  Check-in: {property.checkInTime}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={20} color={tintColor} />
                <Text style={[styles.featureText, { color: textColor }]}>
                  Check-out: {property.checkOutTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Description */}
          {property.description && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>About this place</Text>
                <Text style={[styles.descriptionText, { color: textColor }]}>
                  {property.description}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Map View */}
          {coordinates && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Location</Text>
                <PropertyMapView
                  latitude={coordinates.latitude}
                  longitude={coordinates.longitude}
                  title={property.title}
                />
                <Text style={styles.mapDisclaimer}>
                  Approximate location shown for privacy
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Amenities</Text>
                <View style={styles.amenitiesList}>
                  {property.amenities.slice(0, 6).map((amenity: string, index: number) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                      <Text style={[styles.amenityText, { color: textColor }]}>{amenity}</Text>
                    </View>
                  ))}
                </View>
                {property.amenities.length > 6 && (
                  <TouchableOpacity style={styles.showMoreButton}>
                    <Text style={[styles.showMoreText, { color: tintColor }]}>
                      Show all {property.amenities.length} amenities
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* House Rules */}
          {property.houseRules && property.houseRules.length > 0 && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>House Rules</Text>
                <View style={styles.rulesList}>
                  {property.houseRules.map((rule: string, index: number) => (
                    <View key={index} style={styles.ruleItem}>
                      <Ionicons name="information-circle-outline" size={20} color="#666" />
                      <Text style={[styles.ruleText, { color: textColor }]}>{rule}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Host Info */}
          {property.host && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Hosted by</Text>
              <View style={styles.hostInfo}>
                <View style={[styles.hostAvatar, { backgroundColor: tintColor }]}>
                  <Text style={styles.hostInitials}>
                    {property.host.firstName?.[0]}{property.host.lastName?.[0]}
                  </Text>
                </View>
                <View style={styles.hostDetails}>
                  <Text style={[styles.hostName, { color: textColor }]}>
                    {property.host.firstName} {property.host.lastName}
                  </Text>
                  {property.host.whatsappNumber && (
                    <Text style={styles.hostContact}>{property.host.whatsappNumber}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View style={[styles.bottomBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: textColor }]}>
            {formatPrice(property.nightlyRate, property.currency)}
          </Text>
          <Text style={styles.priceUnit}>per night</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: tintColor }]}
          onPress={() => console.log('Book now')}
        >
          <Text style={styles.bookButtonText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#666',
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
  imageGalleryContainer: {
    height: 300,
    position: 'relative',
  },
  propertyImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  featureText: {
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  mapDisclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  amenitiesList: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amenityText: {
    fontSize: 15,
  },
  showMoreButton: {
    marginTop: 12,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  hostContact: {
    fontSize: 14,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
