import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import { useCategorizedProperties } from '@/hooks/useCategorizedProperties';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from '@/components/search/SearchBar';
import SearchModal, { SearchParams } from '@/components/search/SearchModal';
import PropertyCard from '@/components/property/PropertyCard';

export default function HomeScreen() {
  const [rentalType, setRentalType] = useState<RentalType>(RentalType.LONG_TERM);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Use the categorized properties hook with rental type
  const { appData, isLoading, error, refetch, loadMoreForCategory, hasMoreForCategory } = useCategorizedProperties(
    isAuthenticated, 
    rentalType === RentalType.LONG_TERM ? 'LONG_TERM' : 'SHORT_TERM'
  );
  
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = backgroundColor;
  const borderColor = useThemeColor({ light: '#ebebeb', dark: '#374151' }, 'background');

  // Get properties organized by category with headers
  const getPropertiesByCategory = () => {
    if (!appData) return [];
    
    // Both rental types use the same structure now
    return [
      {
        title: rentalType === RentalType.LONG_TERM ? 'Best Prices' : 'Best Nightly Rates',
        properties: appData.categorizedProperties.lowestPrice?.properties || [],
        category: 'LOWEST_PRICE' as const,
        hasMore: hasMoreForCategory('LOWEST_PRICE'),
      },
      {
        title: rentalType === RentalType.LONG_TERM ? 'Nearby' : 'Recent Stays',
        properties: appData.categorizedProperties.nearby?.properties || [],
        category: 'NEARBY' as const,
        hasMore: hasMoreForCategory('NEARBY'),
      },
      {
        title: rentalType === RentalType.LONG_TERM ? 'Most Viewed' : 'Top Rated',
        properties: appData.categorizedProperties.mostViewed?.properties || [],
        category: 'MOST_VIEWED' as const,
        hasMore: hasMoreForCategory('MOST_VIEWED'),
      },
      {
        title: rentalType === RentalType.LONG_TERM ? 'More Properties' : 'Featured Stays',
        properties: appData.categorizedProperties.more?.properties || [],
        category: 'MORE' as const,
        hasMore: hasMoreForCategory('MORE'),
      },
    ];
  };

  const categorizedProperties = getPropertiesByCategory();

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    console.log('Search params:', params);
    // TODO: Navigate to search results page with params
  };

  const handleLoadMore = async (category: 'LOWEST_PRICE' | 'NEARBY' | 'MOST_VIEWED' | 'MORE') => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      await loadMoreForCategory(category);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    
    // Check if user is near the bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      // Load more for the last section that has more items
      const sectionsWithMore = categorizedProperties.filter(s => s.hasMore && s.properties.length > 0);
      if (sectionsWithMore.length > 0 && !loadingMore) {
        const lastSection = sectionsWithMore[sectionsWithMore.length - 1];
        handleLoadMore(lastSection.category);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Sticky Header - Airbnb Style */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        {/* Search Bar at Top */}
        <SearchBar 
          onPress={() => setShowSearchModal(true)} 
          rentalType={rentalType}
          selectedLocation={searchParams.location?.displayName}
          checkInDate={searchParams.checkInDate}
          checkOutDate={searchParams.checkOutDate}
          moveInDate={searchParams.moveInDate}
        />

        {/* Airbnb-style Rental Type Tabs - Below Search */}
        <View style={styles.rentalTypeTabs}>
          <TouchableOpacity 
            style={styles.rentalTypeTab}
            onPress={() => setRentalType(RentalType.LONG_TERM)}
          >
            <Text style={[
              styles.rentalTypeText,
              { color: rentalType === RentalType.LONG_TERM ? textColor : '#717171' },
              rentalType === RentalType.LONG_TERM && styles.rentalTypeTextActive
            ]}>
              Monthly
            </Text>
            {rentalType === RentalType.LONG_TERM && <View style={[styles.activeIndicator, { backgroundColor: textColor }]} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rentalTypeTab}
            onPress={() => setRentalType(RentalType.SHORT_TERM)}
          >
            <Text style={[
              styles.rentalTypeText,
              { color: rentalType === RentalType.SHORT_TERM ? textColor : '#717171' },
              rentalType === RentalType.SHORT_TERM && styles.rentalTypeTextActive
            ]}>
              Nightly
            </Text>
            {rentalType === RentalType.SHORT_TERM && <View style={[styles.activeIndicator, { backgroundColor: textColor }]} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        rentalType={rentalType}
        onSearch={handleSearch}
        onRentalTypeChange={setRentalType}
      />

      {/* Property Grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>Loading properties...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Property Sections with Headers */}
            {categorizedProperties.map((section, sectionIndex) => (
              section.properties.length > 0 && (
                <View key={sectionIndex} style={styles.section}>
                  {/* Section Header */}
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                      {section.title}
                    </Text>
                  </View>

                  {/* Property Grid */}
                  <View style={styles.propertyGrid}>
                    {section.properties.map((property: any) => (
                      <PropertyCard
                        key={property.propertyId}
                        propertyId={property.propertyId}
                        title={property.title}
                        location={property.district || property.region}
                        price={rentalType === RentalType.LONG_TERM ? property.monthlyRent : property.nightlyRate}
                        currency={property.currency}
                        rating={property.averageRating}
                        thumbnail={property.thumbnail}
                        bedrooms={property.bedrooms || property.maxGuests}
                        priceUnit={rentalType === RentalType.LONG_TERM ? 'month' : 'night'}
                        onFavoritePress={() => console.log('Favorite pressed:', property.propertyId)}
                      />
                    ))}
                  </View>

                  {/* Load More Button */}
                  {section.hasMore && (
                    <TouchableOpacity
                      style={[styles.loadMoreButton, { backgroundColor: tintColor }]}
                      onPress={() => handleLoadMore(section.category)}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.loadMoreText}>Load More</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )
            ))}

            {/* Bottom Loading Indicator */}
            {loadingMore && (
              <View style={styles.bottomLoader}>
                <ActivityIndicator size="large" color={tintColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>Loading more properties...</Text>
              </View>
            )}
          </>
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
    borderBottomWidth: 1,
    paddingTop: 8,
  },
  rentalTypeTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 24,
    paddingBottom: 12,
  },
  rentalTypeTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  rentalTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  rentalTypeTextActive: {
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
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
  loadMoreButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLoader: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
