import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');

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

  const formatPrice = (amount: number, currency: string) => {
    const prefix = currency === 'TZS' ? 'Tshs' : currency;
    return `${prefix} ${amount.toLocaleString()}`;
  };

  // First item renders as a full-width featured card
  const featured = properties[0];
  const rest = properties.slice(1);

  const CARD_WIDTH = (W - 48) / 2;
  const IMG_HEIGHT = CARD_WIDTH * 1.15;

  const renderFeatured = () => {
    if (!featured) return null;
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        activeOpacity={0.9}
        onPress={() => router.push(`/short-property/${featured.propertyId}`)}
      >
        <View style={[styles.featuredImgWrap, { height: W * 0.55 }]}>
          <Image
            source={{ uri: featured.thumbnail || undefined }}
            style={styles.fill}
            contentFit="cover"
            transition={250}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.featuredGradient}
          />
          <TouchableOpacity
            style={styles.featuredHeart}
            onPress={() => handleToggleFavorite(featured.propertyId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="heart" size={20} color="#ff385c" />
          </TouchableOpacity>
          {featured.averageRating > 0 && (
            <View style={styles.featuredRating}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.featuredRatingText}>
                {featured.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredTitle} numberOfLines={1}>{featured.title}</Text>
            <Text style={styles.featuredPrice}>
              {formatPrice(featured.nightlyRate, featured.currency)}
              <Text style={styles.featuredPriceUnit}> /night</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCard = ({ item }: { item: FavoriteProperty }) => (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }]}
      activeOpacity={0.92}
      onPress={() => router.push(`/short-property/${item.propertyId}`)}
    >
      <View style={[styles.imgWrap, { height: IMG_HEIGHT, backgroundColor: cardBg }]}>
        <Image
          source={{ uri: item.thumbnail || undefined }}
          style={styles.fill}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity
          style={styles.heart}
          onPress={() => handleToggleFavorite(item.propertyId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart" size={16} color="#ff385c" />
        </TouchableOpacity>
        {item.averageRating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={9} color="#fff" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
          </View>
        )}
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
        <Text style={[styles.cardTitle, { color: subtle }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.price, { color: text }]}>
          {formatPrice(item.nightlyRate, item.currency)}
          <Text style={{ color: subtle, fontWeight: '400' }}> /night</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Intro section */}
      <View style={styles.intro}>
        <Text style={[styles.introTitle, { color: text }]}>Your saved stays</Text>
        <Text style={[styles.introSub, { color: subtle }]}>
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} you loved.{' '}
          Ready to book one?
        </Text>
      </View>

      {/* Featured card */}
      {renderFeatured()}

      {/* Divider / section label for the grid */}
      {rest.length > 0 && (
        <View style={styles.sectionLabel}>
          <Text style={[styles.sectionText, { color: subtle }]}>More saved stays</Text>
        </View>
      )}
    </View>
  );

  const ListFooter = () => (
    <View style={[styles.footer, { borderTopColor: borderColor }]}>
      <Text style={[styles.footerText, { color: subtle }]}>
        Looking for more places?
      </Text>
      <TouchableOpacity
        style={[styles.browseBtn, { borderColor: tint }]}
        onPress={() => router.push('/')}
      >
        <Ionicons name="search-outline" size={16} color={tint} />
        <Text style={[styles.browseBtnText, { color: tint }]}>Browse all stays</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Favorites</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : properties.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: `${tint}15` }]}>
            <Ionicons name="heart-outline" size={44} color={tint} />
          </View>
          <Text style={[styles.emptyTitle, { color: text }]}>
            No saved stays yet
          </Text>
          <Text style={[styles.emptySub, { color: subtle }]}>
            When you find a place you love, tap the heart to save it here. Your future getaway is just a tap away.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: tint }]}
            onPress={() => router.push('/')}
          >
            <Ionicons name="compass-outline" size={18} color="#fff" />
            <Text style={styles.exploreBtnText}>Discover stays</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Favorites list */
        <FlatList
          data={rest}
          keyExtractor={(item) => item.propertyId}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={rest.length > 0 ? styles.row : undefined}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ListHeader />}
          ListFooterComponent={<ListFooter />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />
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
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  // Intro
  intro: { paddingHorizontal: 20, paddingBottom: 20 },
  introTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  introSub: { fontSize: 15, marginTop: 6, lineHeight: 22 },

  // Featured card
  featuredCard: { marginHorizontal: 16, marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  featuredImgWrap: { borderRadius: 16, overflow: 'hidden' },
  featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  featuredHeart: {
    position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 4,
  },
  featuredRating: {
    position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  featuredRatingText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  featuredInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  featuredTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  featuredPrice: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 4 },
  featuredPriceUnit: { fontWeight: '400', opacity: 0.85 },

  // Section label
  sectionLabel: { paddingHorizontal: 20, paddingBottom: 14 },
  sectionText: { fontSize: 14, fontWeight: '600' },

  // List
  list: { paddingBottom: 30 },
  row: { paddingHorizontal: 16, justifyContent: 'space-between', marginBottom: 20 },

  // Compact card
  card: {},
  imgWrap: { borderRadius: 14, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  heart: {
    position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 3,
  },
  ratingBadge: {
    position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  ratingText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  instantBadge: {
    position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  instantText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Meta
  meta: { paddingTop: 8 },
  location: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  cardTitle: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 13, fontWeight: '600', marginTop: 4 },

  // Footer CTA
  footer: {
    marginTop: 12, marginHorizontal: 16, paddingTop: 24, borderTopWidth: 1, alignItems: 'center', paddingBottom: 20,
  },
  footerText: { fontSize: 14, marginBottom: 14 },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5,
  },
  browseBtnText: { fontSize: 14, fontWeight: '600' },

  // Center / loading
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Empty state
  emptyWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36, paddingBottom: 40,
  },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptySub: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  exploreBtn: {
    marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
  },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
