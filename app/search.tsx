import FilterModal, { FilterOptions } from '@/components/search/FilterModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import GraphQLClient from '@/lib/graphql-client';
import { getDistricts, getRegions, searchShortTermProperties } from '@/lib/graphql/queries';
import { formatDateShort, toTitleCase } from '@/lib/utils/common';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width: SCREEN_W } = useWindowDimensions();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtleColor = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const location = params.location as string;
  const region = params.region as string;
  const district = params.district as string;
  const checkInDate = params.checkInDate as string;
  const checkOutDate = params.checkOutDate as string;
  const category = params.category as string;

  const [selectedRegion, setSelectedRegion] = useState(region || '');
  const [selectedDistrict, setSelectedDistrict] = useState(district || '');

  useEffect(() => { fetchRegions(); }, []);

  useEffect(() => {
    if (selectedRegion) {
      const r = regions.find(r => r.name === selectedRegion);
      if (r) fetchDistricts(r.id);
    }
  }, [selectedRegion, regions]);

  const fetchProperties = async (loadMore = false) => {
    try {
      if (!loadMore) setError(null);
      const today = new Date();
      const monthLater = new Date(today);
      monthLater.setMonth(monthLater.getMonth() + 1);

      const data = await GraphQLClient.executePublic<{ searchShortTermProperties: any }>(
        searchShortTermProperties,
        {
          input: {
            region: selectedRegion || 'Dar es Salaam',
            district: selectedDistrict,
            checkInDate: checkInDate || today.toISOString().split('T')[0],
            checkOutDate: checkOutDate || monthLater.toISOString().split('T')[0],
            numberOfGuests: 2,
            limit: 20,
            nextToken: loadMore ? nextToken : null,
          },
        }
      );
      const result = data.searchShortTermProperties;
      const newProps = result?.properties || [];
      if (loadMore) {
        setProperties(prev => [...prev, ...newProps]);
      } else {
        setProperties(newProps);
      }
      setNextToken(result?.nextToken || null);
    } catch (err) {
      console.error('[Search] Error:', err);
      if (!loadMore) setError('Failed to load stays');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!nextToken || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchProperties(true);
  };

  useEffect(() => { fetchProperties(); }, [selectedRegion, selectedDistrict]);

  const fetchRegions = async () => {
    try {
      const data = await GraphQLClient.executePublic<{ getRegions: any[] }>(getRegions);
      setRegions(data.getRegions || []);
    } catch {}
  };

  const fetchDistricts = async (regionId: string) => {
    try {
      const data = await GraphQLClient.executePublic<{ getDistricts: any[] }>(getDistricts, { regionId });
      setDistricts(data.getDistricts || []);
    } catch {}
  };

  // Filter logic
  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (filters.priceMin || filters.priceMax) {
      result = result.filter(p => {
        if (filters.priceMin && p.nightlyRate < filters.priceMin) return false;
        if (filters.priceMax && p.nightlyRate > filters.priceMax) return false;
        return true;
      });
    }
    if (filters.propertyTypes?.length) {
      result = result.filter(p => filters.propertyTypes!.includes(p.propertyType));
    }
    if (filters.bedrooms) {
      result = result.filter(p => (p.bedrooms || 0) >= filters.bedrooms!);
    }
    if (filters.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc': return a.nightlyRate - b.nightlyRate;
          case 'price_desc': return b.nightlyRate - a.nightlyRate;
          case 'newest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default: return 0;
        }
      });
    }
    return result;
  }, [properties, filters]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.priceMin || filters.priceMax) c++;
    if (filters.propertyTypes?.length) c++;
    if (filters.bedrooms) c++;
    if (filters.sortBy) c++;
    return c;
  }, [filters]);

  const subtitle = checkInDate && checkOutDate
    ? `${formatDateShort(checkInDate)} – ${formatDateShort(checkOutDate)}`
    : 'Any dates';

  const IMG_H = SCREEN_W - 40; // Full-width square-ish images

  const renderCard = ({ item: property }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => router.push(`/short-property/${property.propertyId}` as any)}
    >
      <View style={[styles.cardImg, { height: IMG_H * 0.7 }]}>  
        <Image
          source={{ uri: property.thumbnail }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity style={styles.cardFav}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={[styles.cardLoc, { color: textColor }]} numberOfLines={1}>
            {property.district || property.region}
          </Text>
          {property.averageRating > 0 && (
            <View style={styles.cardRating}>
              <Ionicons name="star" size={12} color={textColor} />
              <Text style={[styles.cardRatingNum, { color: textColor }]}>
                {property.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardName, { color: subtleColor }]} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={[styles.cardMeta, { color: subtleColor }]} numberOfLines={1}>
          {property.propertyType}{property.maxGuests ? ` · ${property.maxGuests} guests` : ''}
        </Text>
        <Text style={[styles.cardPrice, { color: textColor }]}>
          {property.currency === 'TZS' ? 'Tshs' : property.currency}{' '}
          {(property.nightlyRate || 0).toLocaleString()}
          <Text style={[styles.cardNight, { color: subtleColor }]}> night</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Compact header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        {/* Search summary pill (tappable to go back) */}
        <TouchableOpacity style={[styles.searchPill, { backgroundColor: cardBg, borderColor }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={textColor} />
          <View style={styles.searchPillText}>
            <Text style={[styles.searchPillTitle, { color: textColor }]} numberOfLines={1}>
              {selectedRegion ? toTitleCase(selectedRegion) : location ? toTitleCase(location) : 'Anywhere'}
            </Text>
            <Text style={[styles.searchPillSub, { color: subtleColor }]} numberOfLines={1}>
              {subtitle} · {filteredProperties.length} stay{filteredProperties.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipBar}>
          {/* Location chip */}
          <TouchableOpacity
            style={[styles.chip, { borderColor }]}
            onPress={() => setShowLocationPicker(true)}
          >
            <Ionicons name="location-outline" size={14} color={textColor} />
            <Text style={[styles.chipText, { color: textColor }]}>
              {selectedRegion ? toTitleCase(selectedRegion) : 'Region'}
            </Text>
          </TouchableOpacity>

          {/* Filters chip */}
          <TouchableOpacity
            style={[styles.chip, { borderColor }, activeFilterCount > 0 && { borderColor: tintColor }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={14} color={activeFilterCount > 0 ? tintColor : textColor} />
            <Text style={[styles.chipText, { color: activeFilterCount > 0 ? tintColor : textColor }]}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Price sort chips */}
          <TouchableOpacity
            style={[styles.chip, { borderColor }, filters.sortBy === 'price_asc' && { borderColor: tintColor, backgroundColor: `${tintColor}10` }]}
            onPress={() => setFilters(f => ({ ...f, sortBy: f.sortBy === 'price_asc' ? undefined : 'price_asc' }))}
          >
            <Text style={[styles.chipText, { color: filters.sortBy === 'price_asc' ? tintColor : textColor }]}>
              Price ↑
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, { borderColor }, filters.sortBy === 'price_desc' && { borderColor: tintColor, backgroundColor: `${tintColor}10` }]}
            onPress={() => setFilters(f => ({ ...f, sortBy: f.sortBy === 'price_desc' ? undefined : 'price_desc' }))}
          >
            <Text style={[styles.chipText, { color: filters.sortBy === 'price_desc' ? tintColor : textColor }]}>
              Price ↓
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={subtleColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>Something went wrong</Text>
          <Text style={[styles.emptyText, { color: subtleColor }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: textColor }]} onPress={() => fetchProperties()}>
            <Text style={[styles.retryText, { color: backgroundColor }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.propertyId}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchProperties(); }} tintColor={tintColor} />}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={tintColor} />
              </View>
            ) : nextToken ? (
              <TouchableOpacity style={{ paddingVertical: 20, alignItems: 'center' }} onPress={handleLoadMore}>
                <Text style={{ color: tintColor, fontWeight: '600', fontSize: 14 }}>Load more</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={40} color={subtleColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No stays found</Text>
              <Text style={[styles.emptyText, { color: subtleColor }]}>
                Try a different location or adjust your filters
              </Text>
            </View>
          }
        />
      )}

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select region</Text>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalList}>
            {regions.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.modalRow, { borderBottomColor: borderColor }]}
                onPress={() => { setSelectedRegion(r.name); setSelectedDistrict(''); setShowLocationPicker(false); }}
              >
                <Ionicons name="location" size={18} color={tintColor} />
                <Text style={[styles.modalRowText, { color: textColor }]}>{toTitleCase(r.name)}</Text>
                {selectedRegion === r.name && <Ionicons name="checkmark" size={20} color={tintColor} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(f) => setFilters(f)}
        currentFilters={filters}
        isShortTerm={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { borderBottomWidth: 1, paddingBottom: 10 },
  searchPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 8, marginBottom: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 28, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchPillText: { flex: 1 },
  searchPillTitle: { fontSize: 14, fontWeight: '600' },
  searchPillSub: { fontSize: 12, marginTop: 1 },
  chipBar: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },

  // List
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: { marginBottom: 24 },
  cardImg: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  cardFav: {
    position: 'absolute', top: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { paddingTop: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLoc: { fontSize: 15, fontWeight: '600', flex: 1 },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardRatingNum: { fontSize: 14, fontWeight: '500' },
  cardName: { fontSize: 14, marginTop: 2 },
  cardMeta: { fontSize: 13, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: '600', marginTop: 5 },
  cardNight: { fontWeight: '400' },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  retryBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: '600' },

  // Location modal
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalList: { paddingHorizontal: 20 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1 },
  modalRowText: { flex: 1, fontSize: 16, fontWeight: '500' },
});
