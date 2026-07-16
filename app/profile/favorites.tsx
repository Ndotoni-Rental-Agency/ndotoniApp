import PropertyCard from '@/components/property/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GetPropertiesByCategoryQuery } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertiesByCategory, getShortTermProperty } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FavoriteProperty {
  propertyId: string;
  title: string;
  district: string;
  region: string;
  nightlyRate: number;
  currency: string;
  thumbnail: string | null;
  propertyType: string;
  maxGuests: number;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite } = useFavorites();

  const [properties, setProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[Favorites] Not authenticated, skipping fetch');
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      console.log('[Favorites] Fetching favorite IDs from server...');

      // Step 1: Get favorite property IDs
      const res = await GraphQLClient.executeAuthenticated<GetPropertiesByCategoryQuery>(
        getPropertiesByCategory,
        { category: 'FAVORITES', limit: 50 }
      );
      const favoriteIds = (res?.getPropertiesByCategory?.properties || []).map(p => p.propertyId);
      console.log('[Favorites] Got IDs:', { count: favoriteIds.length, ids: favoriteIds });

      if (!favoriteIds.length) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch each as a short-term property (returns null for long-term)
      const results = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            const data = await GraphQLClient.executeAuthenticated<any>(
              getShortTermProperty,
              { propertyId: id }
            );
            return data?.getShortTermProperty || null;
          } catch {
            return null; // Not a short-term property or error
          }
        })
      );

      // Step 3: Filter out nulls (long-term properties) and map to our shape
      const shortTermFavorites = results
        .filter((p): p is any => p !== null && p.status === 'AVAILABLE')
        .map((p) => ({
          propertyId: p.propertyId,
          title: p.title,
          district: p.district || p.address?.district || '',
          region: p.region || p.address?.region || '',
          nightlyRate: p.nightlyRate || 0,
          currency: p.currency || 'TZS',
          thumbnail: p.thumbnail || p.images?.[0] || null,
          propertyType: p.propertyType || '',
          maxGuests: p.maxGuests || 0,
        }));

      console.log('[Favorites] Short-term properties:', {
        count: shortTermFavorites.length,
        titles: shortTermFavorites.map(p => p.title),
      });

      setProperties(shortTermFavorites);
    } catch (error) {
      console.error('[Favorites] Error fetching favorites:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (propertyId: string) => {
    console.log('[Favorites] Removing favorite:', propertyId);
    await toggleFavorite(propertyId);
    setProperties(prev => prev.filter(p => p.propertyId !== propertyId));
  };

  const renderProperty = ({ item }: { item: FavoriteProperty }) => (
    <PropertyCard
      propertyId={item.propertyId}
      title={item.title}
      location={[item.district, item.region].filter(Boolean).join(', ')}
      price={item.nightlyRate}
      currency={item.currency}
      thumbnail={item.thumbnail || undefined}
      bedrooms={item.maxGuests}
      priceUnit="night"
      propertyType={item.propertyType}
      isFavorited={true}
      onFavoritePress={() => handleToggleFavorite(item.propertyId)}
      onPress={() => router.push(`/short-property/${item.propertyId}`)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Favorites</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.propertyId}
          renderItem={renderProperty}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />
          }
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <Ionicons name="heart-outline" size={48} color={subtle} />
              <Text style={[styles.emptyTitle, { color: text }]}>No favorites yet</Text>
              <Text style={[styles.emptySub, { color: subtle }]}>
                Properties you favorite will appear here
              </Text>
              <TouchableOpacity
                style={[styles.exploreBtn, { backgroundColor: tint }]}
                onPress={() => router.push('/')}
              >
                <Text style={styles.exploreBtnText}>Explore stays</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
