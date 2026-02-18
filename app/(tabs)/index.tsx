import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import SearchBar from '@/components/search/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import { api } from '@/lib/api';

type RentalType = 'LONG_TERM' | 'SHORT_TERM';

export default function HomeScreen() {
  const [rentalType, setRentalType] = useState<RentalType>('LONG_TERM');
  const [longTermProperties, setLongTermProperties] = useState<any>(null);
  const [shortTermProperties, setShortTermProperties] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Fetch properties on mount and when rental type changes
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (rentalType === 'LONG_TERM' && !longTermProperties) {
          console.log('[HomeScreen] Fetching long-term properties...');
          const data = await api.fetchLongTermProperties();
          console.log('[HomeScreen] Long-term data received:', JSON.stringify(data, null, 2));
          setLongTermProperties(data);
        } else if (rentalType === 'SHORT_TERM' && !shortTermProperties) {
          console.log('[HomeScreen] Fetching short-term properties...');
          const data = await api.fetchShortTermProperties();
          console.log('[HomeScreen] Short-term data received:', {
            lowestPrice: data.lowestPrice.length,
            topRated: data.topRated.length,
            featured: data.featured.length,
            sampleProperty: data.lowestPrice[0],
          });
          setShortTermProperties(data);
        }
      } catch (err) {
        setError('Failed to load properties');
        console.error('Error fetching properties:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [rentalType, longTermProperties, shortTermProperties]);

  // Get properties organized by category with headers
  const getPropertiesByCategory = () => {
    if (rentalType === 'LONG_TERM') {
      return [
        {
          title: 'Best Prices',
          properties: longTermProperties?.lowestPrice || [],
        },
        {
          title: 'Nearby',
          properties: longTermProperties?.nearby || [],
        },
      ];
    }
    
    return [
      {
        title: 'Best Prices',
        properties: shortTermProperties?.lowestPrice || [],
      },
      {
        title: 'Top Rated',
        properties: shortTermProperties?.topRated || [],
      },
      {
        title: 'Featured',
        properties: shortTermProperties?.featured || [],
      },
    ];
  };

  const categorizedProperties = getPropertiesByCategory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.logo, { color: tintColor }]}>ndotoni</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Airbnb-style Rental Type Tabs */}
        <View style={styles.rentalTypeTabs}>
          <TouchableOpacity 
            style={styles.rentalTypeTab}
            onPress={() => setRentalType('LONG_TERM')}
          >
            <Ionicons 
              name="home-outline" 
              size={18} 
              color={rentalType === 'LONG_TERM' ? '#222' : '#717171'} 
            />
            <Text style={[
              styles.rentalTypeText,
              rentalType === 'LONG_TERM' && styles.rentalTypeTextActive
            ]}>
              Monthly
            </Text>
            {rentalType === 'LONG_TERM' && <View style={[styles.activeIndicator, { backgroundColor: tintColor }]} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rentalTypeTab}
            onPress={() => setRentalType('SHORT_TERM')}
          >
            <Ionicons 
              name="moon-outline" 
              size={18} 
              color={rentalType === 'SHORT_TERM' ? '#222' : '#717171'} 
            />
            <Text style={[
              styles.rentalTypeText,
              rentalType === 'SHORT_TERM' && styles.rentalTypeTextActive
            ]}>
              Nightly
            </Text>
            {rentalType === 'SHORT_TERM' && <View style={[styles.activeIndicator, { backgroundColor: tintColor }]} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar onPress={() => console.log('Search pressed')} />
      </View>

      {/* Property Grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
              onPress={() => {
                setLongTermProperties(null);
                setShortTermProperties(null);
              }}
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
                    <TouchableOpacity>
                      <Text style={[styles.seeAllText, { color: tintColor }]}>See all</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Property Grid */}
                  <View style={styles.propertyGrid}>
                    {section.properties.map((property: any) => (
                      <PropertyCard
                        key={property.propertyId}
                        propertyId={property.propertyId}
                        title={property.title}
                        location={property.district || property.region}
                        price={rentalType === 'LONG_TERM' ? property.monthlyRent : property.nightlyRate}
                        currency={property.currency}
                        rating={property.averageRating}
                        thumbnail={property.thumbnail}
                        bedrooms={property.bedrooms || property.maxGuests}
                        priceUnit={rentalType === 'LONG_TERM' ? 'month' : 'night'}
                        onPress={() => console.log('Property pressed:', property.propertyId)}
                        onFavoritePress={() => console.log('Favorite pressed:', property.propertyId)}
                      />
                    ))}
                  </View>
                </View>
              )
            ))}

            {/* Load More */}
            <TouchableOpacity style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Show more</Text>
            </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ebebeb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  rentalTypeTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 32,
    marginBottom: 12,
  },
  rentalTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
    gap: 6,
  },
  rentalTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#717171',
  },
  rentalTypeTextActive: {
    color: '#222',
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
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
