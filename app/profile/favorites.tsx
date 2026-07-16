import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Minimal query to get just favorite IDs — avoids PropertyType enum serialization issues
const getFavoriteIds = /* GraphQL */ `query GetFavoriteIds {
  getPropertiesByCategory(category: FAVORITES, limit: 50) {
    properties {
      propertyId
    }
  }
}`;

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
  averageRating: number;
  instantBookEnabled: boolean;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { width: W } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite } = useFavorites();

  const [properties, setProperties] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');
  const cardBg = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      const res = await GraphQLClient.executeAuthenticated<{
        getPropertiesByCategory: { properties: { propertyId: string }[] };
      }>(getFavoriteIds);
      const favoriteIds = (res?.getPropertiesByCategory?.properties || []).map(p => p.propertyId);

      if (!favoriteIds.length) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            const data = await GraphQLClient.executeAuthenticated<any>(
              getShortTermProperty,
              { propertyId: id }
            );
            return data?.getShortTermProperty || null;
          } catch {
            return null;
          }
        })
      );

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
          averageRating: p.averageRating || p.ratingSummary?.averageRating || 0,
          instantBookEnabled: p.instantBookEnabled || false,
        }));

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
    await toggleFavorite(propertyId);
    setProperties(prev => prev.filter(p => p.propertyId !== propertyId));
  };

  const CARD_WIDTH = (W - 48) / 2;
  const IMG_HEIGHT = CARD_WIDTH * 1.15;

  const renderCard = ({ item }: { item: FavoriteProperty }) => (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }]}
      activeOpacity={0.92}
      onPress={() => router.push(`/short-property/${item.propertyId}`)}
    >
      <View style={[styles.imgWrap, { height: IMG_HEIGHT, backgroundColor: cardBg }]}>
        <Image
          source={{ uri: item.thumbnail || undefined }}
          style={styles.img}
          contentFit="cover"
          transition={200}
        />
        {/* Heart button */}
        <TouchableOpacity
          style={styles.heart}
          onPress={() => handleToggleFavorite(item.propertyId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart" size={18} color="#ff385c" />
        </TouchableOpacity>
        {/* Rating badge */}
        {item.averageRating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
          </View>
        )}
        {/* Instant book badge */}
        {item.instantBookEnabled && (
          <View style={styles.instantBadge}>
            <Ionicons name="flash" size={9} color="#fff" />
            <Text style={styles.instantText}>Instant</Text>
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <Text style={[styles.location, { color: text }]} numberOfLines={1}>
          {item.district || item.region}
        </Text>
        <Text style={[styles.title, { color: subtle }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.price, { color: text }]}>
          {item.currency === 'TZS' ? 'Tshs' : item.currency} {item.nightlyRate.toLocaleString()}
          <Text style={{ color: subtle, fontWeight: '400' }}> /night</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: text }]}>Favorites</Text>
          {properties.length > 0 && (
            <Text style={[styles.headerCount, { color: subtle }]}>
              {properties.length} saved {properties.length === 1 ? 'stay' : 'stays'}
            </Text>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.propertyId}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={properties.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIcon, { backgroundColor: `${tint}15` }]}>
                <Ionicons name="heart-outline" size={40} color={tint} />
              </View>
              <Text style={[styles.emptyTitle, { color: text }]}>
                No saved stays yet
              </Text>
              <Text style={[styles.emptySub, { color: subtle }]}>
                Tap the heart on any property to save it here for later
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
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerCount: { fontSize: 13, marginTop: 2 },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyList: { flexGrow: 1 },
  row: { justifyContent: 'space-between', marginBottom: 20 },

  // Card
  card: { marginBottom: 0 },
  imgWrap: { borderRadius: 14, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  instantBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#10b981',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  instantText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Meta
  meta: { paddingTop: 8 },
  location: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  title: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 13, fontWeight: '600', marginTop: 4 },

  // Center / loading
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Empty state
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  exploreBtn: {
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
