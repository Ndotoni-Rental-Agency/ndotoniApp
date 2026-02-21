import PropertyCard from '@/components/property/PropertyCard';
import SearchBar from '@/components/search/SearchBar';
import SearchModal, { SearchParams } from '@/components/search/SearchModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCategorizedProperties } from '@/hooks/useCategorizedProperties';
import { RentalType } from '@/hooks/useRentalType';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [rentalType, setRentalType] = useState<RentalType>(RentalType.LONG_TERM);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('monthly');
  
  // Initialize with default dates
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  
  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkInDate: today.toISOString().split('T')[0],
    checkOutDate: oneWeekLater.toISOString().split('T')[0],
    moveInDate: today.toISOString().split('T')[0],
  });
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
  const categoryBg = useThemeColor({ light: '#f7f7f7', dark: '#111827' }, 'background');

  // Category filters - Airbnb style with rental types integrated
  const categories = [
    { id: 'monthly', label: 'Monthly', icon: 'calendar', type: RentalType.LONG_TERM },
    { id: 'nightly', label: 'Nightly', icon: 'moon', type: RentalType.SHORT_TERM },
    { id: 'house', label: 'Houses', icon: 'home' },
    { id: 'apartment', label: 'Apartments', icon: 'business' },
    { id: 'villa', label: 'Villas', icon: 'bed' },
    { id: 'studio', label: 'Studios', icon: 'cube' },
  ];

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

        {/* Category Filters - Airbnb Style */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={[styles.categoriesScroll, { borderBottomColor: borderColor }]}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                { backgroundColor: selectedCategory === category.id ? categoryBg : 'transparent' },
                selectedCategory === category.id && { borderColor: borderColor, borderWidth: 1 }
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                if (category.type) {
                  setRentalType(category.type);
                }
              }}
            >
              <Ionicons 
                name={category.icon as any} 
                size={24} 
                color={selectedCategory === category.id ? textColor : '#717171'} 
              />
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category.id ? textColor : '#717171' },
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            {/* Continuous Property Grid - Airbnb Style */}
            <View style={styles.propertyGrid}>
              {categorizedProperties.map((section) => 
                section.properties.map((property: any) => (
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
                ))
              )}
            </View>

            {/* Load More Button */}
            {categorizedProperties.some(s => s.hasMore) && (
              <TouchableOpacity
                style={[styles.loadMoreButton, { backgroundColor: tintColor }]}
                onPress={() => {
                  const sectionsWithMore = categorizedProperties.filter(s => s.hasMore && s.properties.length > 0);
                  if (sectionsWithMore.length > 0) {
                    handleLoadMore(sectionsWithMore[0].category);
                  }
                }}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.loadMoreText}>Show more</Text>
                    <Ionicons name="chevron-down" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Bottom Loading Indicator */}
            {loadingMore && (
              <View style={styles.bottomLoader}>
                <ActivityIndicator size="large" color={tintColor} />
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
  categoriesScroll: {
    borderBottomWidth: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 80,
  },
  categoryText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 16,
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
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
