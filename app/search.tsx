import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import PropertyCard from '@/components/property/PropertyCard';
import { api } from '@/lib/api-client';
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
        const result = await api.searchShortTermProperties({
          region: region || 'Dar es Salaam',
          district,
          checkInDate,
          checkOutDate,
        });
        setProperties(result);
      } else {
        const result = await api.searchLongTermProperties({
          region: region || 'Dar es Salaam',
          district,
          moveInDate,
        });
        setProperties(result);
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

            {/* Property Grid */}
            <View style={styles.propertyGrid}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.propertyId}
                  propertyId={property.propertyId}
                  title={property.title}
                  location={property.district || property.region}
                  price={isShortTerm ? property.nightlyRate : property.monthlyRent}
                  currency={property.currency}
                  rating={property.averageRating}
                  thumbnail={property.thumbnail}
                  bedrooms={property.bedrooms || property.maxGuests}
                  priceUnit={isShortTerm ? 'night' : 'month'}
                  onPress={() => {
                    const route = isShortTerm
                      ? `/short-property/${property.propertyId}`
                      : `/property/${property.propertyId}`;
                    router.push(route);
                  }}
                  onFavoritePress={() => console.log('Favorite:', property.propertyId)}
                />
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
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
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
