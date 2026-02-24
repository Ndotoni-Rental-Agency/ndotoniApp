import PropertyCard from '@/components/property/PropertyCard';
import SearchBar from '@/components/search/SearchBar';
import SearchModal, { SearchParams } from '@/components/search/SearchModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCategorizedProperties } from '@/hooks/useCategorizedProperties';
import { PropertyType, usePropertyTypeCache } from '@/hooks/usePropertyTypeCache';
import { RentalType } from '@/hooks/useRentalType';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [rentalType, setRentalType] = useState<RentalType>(RentalType.LONG_TERM);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('monthly');
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Initialize with default dates
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  
  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkInDate: today.toISOString().split('T')[0],
    checkOutDate: oneWeekLater.toISOString().split('T')[0],
    moveInDate: today.toISOString().split('T')[0],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [renderedSections, setRenderedSections] = useState<Set<number>>(new Set([0])); // Only render first section initially
  const isRenderingSection = useRef(false); // Prevent multiple sections rendering at once
  const { isAuthenticated } = useAuth();
  
  // Use the categorized properties hook with rental type (always public/CloudFront)
  const { appData, isLoading, error, refetch } = useCategorizedProperties(
    rentalType === RentalType.LONG_TERM ? 'LONG_TERM' : 'SHORT_TERM'
  );
  
  // Use property type cache when a specific type is selected
  const { 
    data: propertyTypeData, 
    isLoading: isLoadingPropertyType, 
    error: propertyTypeError,
    refetch: refetchPropertyType 
  } = usePropertyTypeCache(selectedPropertyType);
  
  const backgroundColor = useThemeColor({ light: '#FAFAFA', dark: '#000000' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'background');
  const borderColor = useThemeColor({ light: '#EBEBEB', dark: '#2C2C2E' }, 'background');
  const categoryBg = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');

  // Category filters - Airbnb style with rental types integrated
  const categories = [
    { id: 'monthly', label: 'Monthly', icon: 'calendar-outline', type: RentalType.LONG_TERM },
    { id: 'nightly', label: 'Nightly', icon: 'moon-outline', type: RentalType.SHORT_TERM },
    { id: 'house', label: 'Houses', icon: 'home-outline', propertyType: 'HOUSE' as PropertyType },
    { id: 'hotel', label: 'Hotels', icon: 'business', propertyType: 'HOTEL' as PropertyType },
    { id: 'apartment', label: 'Apartments', icon: 'business-outline', propertyType: 'APARTMENT' as PropertyType },
    { id: 'guesthouse', label: 'Guesthouses', icon: 'home', propertyType: 'GUESTHOUSE' as PropertyType },
    { id: 'room', label: 'Rooms', icon: 'bed', propertyType: 'ROOM' as PropertyType },
    { id: 'cottage', label: 'Cottages', icon: 'leaf-outline', propertyType: 'COTTAGE' as PropertyType },
    { id: 'commercial', label: 'Commercial', icon: 'storefront-outline', propertyType: 'COMMERCIAL' as PropertyType },
    { id: 'villa', label: 'Villas', icon: 'bed-outline', propertyType: 'VILLA' as PropertyType },
    { id: 'studio', label: 'Studios', icon: 'cube-outline', propertyType: 'STUDIO' as PropertyType },
  ];

  // Get properties organized by category with headers
  const getPropertiesByCategory = () => {
    // If a property type is selected, show property type data (both rental types combined)
    if (selectedPropertyType && propertyTypeData) {
      const longTermProperties = propertyTypeData.longTerm || [];
      const shortTermProperties = propertyTypeData.shortTerm || [];
      
      // Combine both rental types
      const allProperties = [...longTermProperties, ...shortTermProperties];
      
      
      return [{
        title: `${selectedPropertyType.charAt(0) + selectedPropertyType.slice(1).toLowerCase()}s`,
        categoryName: selectedPropertyType.toLowerCase(),
        properties: allProperties,
        category: 'PROPERTY_TYPE' as const,
      }];
    }
    
    // Otherwise show categorized properties filtered by rental type
    if (!appData) return [];
    
    // Both rental types use the same structure now
    const sections = [
      {
        title: rentalType === RentalType.LONG_TERM ? 'Best Prices' : 'Best Nightly Rates',
        categoryName: 'best prices',
        properties: appData.categorizedProperties.lowestPrice?.properties || [],
        category: 'LOWEST_PRICE' as const,
      },
      {
        title: rentalType === RentalType.LONG_TERM ? 'Nearby' : 'Recent Stays',
        categoryName: 'nearby',
        properties: appData.categorizedProperties.nearby?.properties || [],
        category: 'NEARBY' as const,
      },
      {
        title: rentalType === RentalType.LONG_TERM ? 'Most Viewed' : 'Top Rated',
        categoryName: 'most viewed',
        properties: appData.categorizedProperties.mostViewed?.properties || [],
        category: 'MOST_VIEWED' as const,
      },
      {
        title: rentalType === RentalType.LONG_TERM ? 'Premium Properties' : 'Luxury Stays',
        categoryName: 'premium',
        properties: appData.categorizedProperties.more?.properties || [],
        category: 'MORE' as const,
      },
    ];
  
    return sections;
  };

  const categorizedProperties = getPropertiesByCategory();

  // Debug: Check if images are using CloudFront or S3
  useEffect(() => {
    if (appData?.categorizedProperties.lowestPrice?.properties[0]) {
      const firstProperty = appData.categorizedProperties.lowestPrice.properties[0];
      const totalProperties = Object.values(appData.categorizedProperties)
        .reduce((sum, cat) => sum + (cat?.properties?.length || 0), 0);
      
      console.log('[DEBUG] Sample thumbnail URL:', firstProperty.thumbnail);
      console.log('[DEBUG] Total properties to render:', totalProperties);
      
      if (firstProperty.thumbnail?.includes('s3.amazonaws.com')) {
        console.warn('⚠️ Images are loading from S3 directly - not using CloudFront!');
        console.warn('⚠️ This is causing slow image loads. Images should use CloudFront domain.');
      } else if (firstProperty.thumbnail?.includes('cloudfront.net')) {
        console.log('✅ Images are using CloudFront');
      } else {
        console.log('[DEBUG] Image URL format:', firstProperty.thumbnail?.substring(0, 50));
      }
      
      // Reset rendered sections when data changes
      setRenderedSections(new Set([0]));
    }
  }, [appData]);

  // Animated scale values for smooth shrinking
  const searchBarScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  const categoriesScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.88],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    // TODO: Navigate to search results page with params
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (selectedPropertyType) {
        await refetchPropertyType();
      } else {
        await refetch();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        // Prevent rendering multiple sections at once
        if (isRenderingSection.current) return;
        
        const offsetY = event.nativeEvent.contentOffset.y;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;
        const contentHeight = event.nativeEvent.contentSize.height;
        
        // Lazy render next section when user is 800px from bottom
        if (contentHeight - offsetY - layoutHeight < 800) {
          const maxSection = categorizedProperties.length - 1;
          const currentMax = Math.max(...Array.from(renderedSections));
          
          // Only render next section if there is one
          if (currentMax < maxSection) {
            isRenderingSection.current = true;
            
            setRenderedSections(prev => {
              const newSet = new Set(prev);
              newSet.add(currentMax + 1);
              console.log('[HomePage] Lazy rendering section:', currentMax + 1, 'of', maxSection);
              return newSet;
            });
            
            // Allow next section to render after a delay
            setTimeout(() => {
              isRenderingSection.current = false;
            }, 500);
          }
        }
      }
    }
  );

  const toggleSection = (sectionIndex: number) => {
    const newExpanded = new Set(expandedSections);
    const key = `section-${sectionIndex}`;
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const INITIAL_DISPLAY_COUNT = 4; // Show 4 properties initially (2 rows) - optimized for fast render

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Sticky Header with Gradient */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: headerBg, 
            borderBottomColor: borderColor,
            opacity: headerOpacity,
          }
        ]}
      >
        {/* Search Bar */}
        <Animated.View 
          style={{ 
            transform: [{ scale: searchBarScale }],
          }}
        >
          <SearchBar 
            onPress={() => setShowSearchModal(true)} 
            rentalType={rentalType}
            checkInDate={searchParams.checkInDate}
            checkOutDate={searchParams.checkOutDate}
            moveInDate={searchParams.moveInDate}
          />
        </Animated.View>

        {/* Category Filters - Enhanced Airbnb Style */}
        <Animated.ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={[
            styles.categoriesScroll,
            { 
              transform: [{ scale: categoriesScale }],
            }
          ]}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  { 
                    backgroundColor: isSelected ? categoryBg : 'transparent',
                    borderColor: isSelected ? textColor : borderColor,
                  }
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  if (category.type) {
                    setRentalType(category.type);
                    setSelectedPropertyType(null); // Clear property type filter
                  } else if (category.propertyType) {
                    setSelectedPropertyType(category.propertyType);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={18} 
                  color={isSelected ? textColor : '#717171'} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: isSelected ? textColor : '#717171' },
                  isSelected && styles.categoryTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>
      </Animated.View>

      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        rentalType={rentalType}
        onSearch={handleSearch}
        onRentalTypeChange={setRentalType}
      />

      {/* Property Grid */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
      >
        {(isLoading || isLoadingPropertyType) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>Loading properties...</Text>
          </View>
        ) : (error || propertyTypeError) ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error || propertyTypeError}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={() => selectedPropertyType ? refetchPropertyType() : refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Empty State for Property Type Filter */}
            {selectedPropertyType && categorizedProperties.every(s => s.properties.length === 0) && (
              <View style={styles.emptyContainer}>
                <Ionicons name="home-outline" size={64} color={textColor} style={{ opacity: 0.3 }} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  No {selectedPropertyType.toLowerCase()}s available
                </Text>
                <Text style={[styles.emptySubtitle, { color: textColor, opacity: 0.6 }]}>
                  There are currently no properties of this type. Try browsing other property types or check back later.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: tintColor }]}
                  onPress={() => {
                    setSelectedPropertyType(null);
                    setSelectedCategory(rentalType === RentalType.LONG_TERM ? 'monthly' : 'nightly');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyButtonText}>Browse All Properties</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Property Sections with Headers - Lazy Rendered */}
            {categorizedProperties.map((section, sectionIndex) => {
              if (section.properties.length === 0) return null;
              
              // Only render sections that have been scrolled to
              if (!renderedSections.has(sectionIndex)) {
                // Render placeholder to maintain scroll position
                return (
                  <View key={sectionIndex} style={[styles.section, styles.sectionPlaceholder]}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleContainer}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                          {section.title}
                        </Text>
                        <View style={[styles.sectionAccent, { backgroundColor: tintColor }]} />
                      </View>
                    </View>
                    <View style={styles.loadingSection}>
                      <ActivityIndicator size="small" color={tintColor} />
                      <Text style={[styles.loadingText, { color: textColor }]}>
                        Scroll to load...
                      </Text>
                    </View>
                  </View>
                );
              }
              
              const isExpanded = expandedSections.has(`section-${sectionIndex}`);
              const displayProperties = isExpanded 
                ? section.properties 
                : section.properties.slice(0, INITIAL_DISPLAY_COUNT);
              const hasMoreToShow = section.properties.length > INITIAL_DISPLAY_COUNT;
              
              return (
                <View key={sectionIndex} style={styles.section}>
                  {/* Section Header with Gradient Accent */}
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Text style={[styles.sectionTitle, { color: textColor }]}>
                        {section.title}
                      </Text>
                      <View style={[styles.sectionAccent, { backgroundColor: tintColor }]} />
                    </View>
                  </View>

                  {/* Property Grid */}
                  <View style={styles.propertyGrid}>
                    {displayProperties.map((property: any) => {
                      // Determine rental type based on context
                      let isLongTerm: boolean;
                      
                      if (section.category === 'PROPERTY_TYPE') {
                        // For property type filter view, check the actual property data
                        // A property is long-term ONLY if it has monthlyRent but NO nightlyRate
                        const hasMonthlyRent = property.monthlyRent !== undefined && property.monthlyRent !== null && property.monthlyRent > 0;
                        const hasNightlyRate = property.nightlyRate !== undefined && property.nightlyRate !== null && property.nightlyRate > 0;
                        
                        if (hasNightlyRate) {
                          // Has nightly rate = short-term
                          isLongTerm = false;
                        } else if (hasMonthlyRent) {
                          // Has monthly rent but no nightly rate = long-term
                          isLongTerm = true;
                        } else {
                          // Fallback to rental type state
                          isLongTerm = rentalType === RentalType.LONG_TERM;
                        }
                      } else {
                        // For categorized views, use the current rental type tab
                        isLongTerm = rentalType === RentalType.LONG_TERM;
                      }
                      
                      const price = isLongTerm ? property.monthlyRent : property.nightlyRate;
                      const priceUnit = isLongTerm ? 'month' : 'night';
                      
                      
                      return (
                        <PropertyCard
                          key={property.propertyId}
                          propertyId={property.propertyId}
                          title={property.title}
                          location={property.district || property.region}
                          price={price}
                          currency={property.currency}
                          rating={property.averageRating}
                          thumbnail={property.thumbnail}
                          bedrooms={property.bedrooms || property.maxGuests}
                          propertyType={property.propertyType}
                          priceUnit={priceUnit}
                          onFavoritePress={() => console.log('Favorite pressed:', property.propertyId)}
                        />
                      );
                    })}
                  </View>

                  {/* Show All / Show Less Button */}
                  {hasMoreToShow && (
                    <TouchableOpacity
                      style={[styles.showAllButton, { borderColor: borderColor }]}
                      onPress={() => toggleSection(sectionIndex)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.showAllText, { color: textColor }]}>
                        {isExpanded 
                          ? 'Show less' 
                          : `Show all ${section.categoryName}`}
                      </Text>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-forward"} 
                        size={20} 
                        color={textColor} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        )}
      </Animated.ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesScroll: {
    paddingBottom: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  categoryTextActive: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  sectionAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
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
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadMoreButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  showAllButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  showAllText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bottomLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionPlaceholder: {
    minHeight: 200,
  },
  loadingSection: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
});
