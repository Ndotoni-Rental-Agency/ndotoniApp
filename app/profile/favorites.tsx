import PropertyCard from '@/components/property/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GetPropertiesByCategoryQuery, PropertyCard as PropertyCardType } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertiesByCategory } from '@/lib/graphql/queries';
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

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites();

  const [properties, setProperties] = useState<PropertyCardType[]>([]);
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
      console.log('[Favorites] Fetching favorites from server...');
      const res = await GraphQLClient.executeAuthenticated<GetPropertiesByCategoryQuery>(
        getPropertiesByCategory,
        { category: 'FAVORITES', limit: 50 }
      );
      const items = res?.getPropertiesByCategory?.properties || [];
      console.log('[Favorites] Received properties:', {
        count: items.length,
        ids: items.map(p => p.propertyId),
        titles: items.map(p => p.title),
      });
      setProperties(items);
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
    // Remove from local list immediately for responsive UI
    setProperties(prev => prev.filter(p => p.propertyId !== propertyId));
  };

  const renderProperty = ({ item }: { item: PropertyCardType }) => (
    <PropertyCard
      propertyId={item.propertyId}
      title={item.title}
      location={[item.district, item.region].filter(Boolean).join(', ')}
      price={item.monthlyRent || 0}
      currency={item.currency || 'TZS'}
      thumbnail={item.thumbnail || undefined}
      bedrooms={item.bedrooms || undefined}
      priceUnit="night"
      propertyType={item.propertyType || undefined}
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
