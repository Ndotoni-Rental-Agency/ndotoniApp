import FilterModal, { FilterOptions } from '@/components/search/FilterModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import GraphQLClient from '@/lib/graphql-client';
import { getDistricts, getPropertiesByLocation, getRegions, searchShortTermProperties } from '@/lib/graphql/queries';
import { formatDateShort, toTitleCase } from '@/lib/utils/common';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
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

  // Local state for selected location (can be changed without navigation)
  const [selectedRegion, setSelectedRegion] = useState(region || '');
  const [selectedDistrict, setSelectedDistrict] = useState(district || '');

  const isShortTerm = rentalType === RentalType.SHORT_TERM;

  // Fetch regions on mount
  useEffect(() => {

    fetchRegions();
  }, []);

  // Fetch districts when region changes
  useEffect(() => {
    if (region) {
      const regionObj = regions.find(r => r.name === region);
      if (regionObj) {
        fetchDistricts(regionObj.id);
      }
    }
  }, [region, regions]);

  // Fetch districts when selected region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionObj = regions.find(r => r.name === selectedRegion);
      if (regionObj) {
        fetchDistricts(regionObj.id);
      }
    }
  }, [selectedRegion, regions]);

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
              region: selectedRegion || 'Dar es Salaam',
              district: selectedDistrict,
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
            region: selectedRegion || 'Dar es Salaam',
            district: selectedDistrict,
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
  }, [selectedRegion, selectedDistrict, checkInDate, checkOutDate, moveInDate, rentalType]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProperties();
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const fetchRegions = async () => {
    try {
      const data = await GraphQLClient.executePublic<{ getRegions: any[] }>(getRegions);
      setRegions(data.getRegions || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchDistricts = async (regionId: string) => {
    try {
      const data = await GraphQLClient.executePublic<{ getDistricts: any[] }>(
        getDistricts,
        { regionId }
      );
      setDistricts(data.getDistricts || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleRegionSelect = (regionName: string) => {
    setSelectedRegion(regionName);
    setSelectedDistrict(''); // Reset district when region changes
    setShowRegionDropdown(false);
  };

  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    setShowDistrictDropdown(false);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.propertyTypes && filters.propertyTypes.length > 0) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.sortBy) count++;
    return count;
  }, [filters]);

  // Apply filters to properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Filter by price range
    if (filters.priceMin || filters.priceMax) {
      result = result.filter(property => {
        const price = isShortTerm ? property.nightlyRate : property.monthlyRent;
        if (filters.priceMin && price < filters.priceMin) return false;
        if (filters.priceMax && price > filters.priceMax) return false;
        return true;
      });
    }

    // Filter by property types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      result = result.filter(property =>
        filters.propertyTypes!.includes(property.propertyType)
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      result = result.filter(property => property.bedrooms >= filters.bedrooms!);
    }

    // Filter by bathrooms
    if (filters.bathrooms) {
      result = result.filter(property => property.bathrooms >= filters.bathrooms!);
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        const priceA = isShortTerm ? a.nightlyRate : a.monthlyRent;
        const priceB = isShortTerm ? b.nightlyRate : b.monthlyRent;

        switch (filters.sortBy) {
          case 'price_asc':
            return priceA - priceB;
          case 'price_desc':
            return priceB - priceA;
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [properties, filters, isShortTerm]);

  const getSearchTitle = () => {
    const locationText = location || selectedDistrict || selectedRegion || 'Properties';
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

  const getResultsCount = () => {
    const count = filteredProperties.length;
    return `${count} ${count === 1 ? 'property' : 'properties'}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={textColor} />
            <Text style={[styles.backText, { color: textColor }]}>Back</Text>
          </TouchableOpacity>
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
        {/* Back Button and Location Header */}
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={textColor} />
            <Text style={[styles.backText, { color: textColor }]}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.locationHeader}>
            <Text style={[styles.locationTitle, { color: textColor }]}>
              {getSearchTitle()}
            </Text>
            <Text style={styles.locationSubtitle}>
              {getSearchSubtitle()} • {getResultsCount()}
            </Text>
          </View>

          {/* Location and Filter Row */}
          <View style={styles.filterRow}>
            {/* Location Dropdowns */}
            <View style={styles.locationContainer}>
              {/* Region Dropdown */}
              <View style={styles.locationDropdownWrapper}>
                <TouchableOpacity
                  style={[styles.locationChip, { backgroundColor: headerBg, borderColor }]}
                  onPress={() => setShowRegionDropdown(!showRegionDropdown)}
                >
                  <Ionicons name="location-outline" size={16} color={textColor} />
                  <Text style={[styles.locationChipText, { color: textColor }]} numberOfLines={1}>
                    {selectedRegion ? toTitleCase(selectedRegion) : 'Region'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={textColor} />
                </TouchableOpacity>
                
                {showRegionDropdown && (
                  <ScrollView style={[styles.dropdown, styles.scrollableDropdown, { backgroundColor: headerBg, borderColor }]}>
                    {regions.map((reg) => (
                      <TouchableOpacity
                        key={reg.id}
                        style={styles.dropdownItem}
                        onPress={() => handleRegionSelect(reg.name)}
                      >
                        <Text style={[styles.dropdownItemText, { color: textColor }]}>
                          {toTitleCase(reg.name)}
                        </Text>
                        {selectedRegion === reg.name && (
                          <Ionicons name="checkmark" size={18} color={tintColor} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* District Dropdown - Only show when region is selected */}
              {selectedRegion && (
                <View style={styles.locationDropdownWrapper}>
                  <TouchableOpacity
                    style={[styles.locationChip, { backgroundColor: headerBg, borderColor }]}
                    onPress={() => setShowDistrictDropdown(!showDistrictDropdown)}
                  >
                    <Ionicons name="navigate-outline" size={16} color={textColor} />
                    <Text style={[styles.locationChipText, { color: textColor }]} numberOfLines={1}>
                      {selectedDistrict ? toTitleCase(selectedDistrict) : 'District'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={textColor} />
                  </TouchableOpacity>
                  
                  {showDistrictDropdown && (
                    <ScrollView style={[styles.dropdown, styles.scrollableDropdown, { backgroundColor: headerBg, borderColor }]}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleDistrictSelect('')}
                      >
                        <Text style={[styles.dropdownItemText, { color: textColor }]}>
                          All Districts
                        </Text>
                        {!selectedDistrict && (
                          <Ionicons name="checkmark" size={18} color={tintColor} />
                        )}
                      </TouchableOpacity>
                      {districts.map((dist) => (
                        <TouchableOpacity
                          key={dist.id}
                          style={styles.dropdownItem}
                          onPress={() => handleDistrictSelect(dist.name)}
                        >
                          <Text style={[styles.dropdownItemText, { color: textColor }]}>
                            {toTitleCase(dist.name)}
                          </Text>
                          {selectedDistrict === dist.name && (
                            <Ionicons name="checkmark" size={18} color={tintColor} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>

            {/* Filters Button */}
            <TouchableOpacity
              style={[
                styles.filtersButton,
                { backgroundColor: headerBg, borderColor },
                (activeFilterCount > 0 || (filters.propertyTypes && filters.propertyTypes.length > 0)) && { borderColor: tintColor },
              ]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons 
                name="options-outline" 
                size={20} 
                color={(activeFilterCount > 0 || (filters.propertyTypes && filters.propertyTypes.length > 0)) ? tintColor : textColor} 
              />
              <Text style={[
                styles.filtersButtonText, 
                { color: (activeFilterCount > 0 || (filters.propertyTypes && filters.propertyTypes.length > 0)) ? tintColor : textColor }
              ]}>
                Filters
              </Text>
              {(activeFilterCount > 0 || (filters.propertyTypes && filters.propertyTypes.length > 0)) && (
                <View style={[styles.filterBadge, { backgroundColor: tintColor }]}>
                  <Text style={styles.filterBadgeText}>
                    {activeFilterCount + (filters.propertyTypes?.length || 0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

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
            {filteredProperties.length > 0 ? (
              <View style={styles.propertyList}>
                {filteredProperties.map((property) => (
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
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="funnel-outline" size={64} color="#ddd" />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No matches found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your filters to see more results
                </Text>
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: tintColor }]}
                  onPress={() => setFilters({})}
                >
                  <Text style={styles.exploreButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
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

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
        isShortTerm={isShortTerm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 17,
    fontWeight: '500',
  },
  locationHeader: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 15,
    color: '#717171',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationDropdownWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: 150,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  locationChipText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filtersButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    minWidth: 180,
    maxWidth: 250,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  scrollableDropdown: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
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
  propertyList: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
