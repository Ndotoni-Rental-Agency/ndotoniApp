import SearchBar from '@/components/search/SearchBar';
import SearchModal, { SearchParams } from '@/components/search/SearchModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCategorizedProperties } from '@/hooks/useCategorizedProperties';
import { usePropertyFavorites } from '@/hooks/useProperty';
import { RentalType } from '@/hooks/useRentalType';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Visual category cards
const CATEGORIES = [
  { id: 'stays', label: 'Nightly Stays', emoji: '🏠', param: 'NIGHTLY_STAY', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500&auto=format&fit=crop' },
  { id: 'beach', label: 'Beach', emoji: '🏖️', param: 'BEACH', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop' },
  { id: 'safari', label: 'Safari', emoji: '🦁', param: 'SAFARI', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=500&auto=format&fit=crop' },
  { id: 'parties', label: 'Parties', emoji: '🎉', param: 'PARTY', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=500&auto=format&fit=crop' },
  { id: 'photos', label: 'Photoshoot', emoji: '📸', param: 'PHOTOSHOOT', img: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=500&auto=format&fit=crop' },
  { id: 'business', label: 'Business', emoji: '💼', param: 'MEETING', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500&auto=format&fit=crop' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width: W } = useWindowDimensions();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkInDate: today.toISOString().split('T')[0],
    checkOutDate: threeDays.toISOString().split('T')[0],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { appData, isLoading, error, refetch } = useCategorizedProperties('SHORT_TERM');
  const { toggleFavorite, isFavorited } = usePropertyFavorites();

  const bg = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({ light: '#f0f0f0', dark: '#222' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  // Merge all properties into one feed, deduped
  const feed = React.useMemo(() => {
    if (!appData) return [];
    const all = [
      ...(appData.categorizedProperties.lowestPrice?.properties || []),
      ...(appData.categorizedProperties.mostViewed?.properties || []),
      ...(appData.categorizedProperties.nearby?.properties || []),
      ...(appData.categorizedProperties.more?.properties || []),
    ];
    const seen = new Set<string>();
    return all.filter((p: any) => { if (seen.has(p.propertyId)) return false; seen.add(p.propertyId); return true; });
  }, [appData]);

  const handleRefresh = async () => { setIsRefreshing(true); await refetch(); setIsRefreshing(false); };

  // Featured card — first property rendered big
  const featured: any = feed[0];
  const rest = feed.slice(1);

  // Image height for regular cards (landscape aspect, not too tall)
  const CARD_IMG = W * 0.62;

  // Build a varied layout: pairs of small cards + full-width cards
  const renderFeedItem = ({ item, index }: { item: any; index: number }) => {
    // Pattern: every 3rd item (0-indexed: 2, 5, 8...) is full-width tall
    // Others come in pairs (rendered together from even index)
    const patternPos = index % 3;

    if (patternPos === 2) {
      // Full-width tall card
      return renderWideCard(item);
    }
    // Pair cards — only render from even positions in the pair
    if (patternPos === 1) return null; // handled by patternPos === 0
    // patternPos === 0: render a row of 2 compact cards
    const nextItem = rest[index + 1];
    return (
      <View style={styles.pairRow}>
        {renderCompactCard(item)}
        {nextItem ? renderCompactCard(nextItem) : <View style={styles.pairHalf} />}
      </View>
    );
  };

  const renderWideCard = (p: any) => (
    <TouchableOpacity style={styles.wideCard} activeOpacity={0.92} onPress={() => router.push(`/short-property/${p.propertyId}`)}>
      <View style={[styles.wideImgWrap, { height: W * 0.55 }]}>
        <Image source={{ uri: p.thumbnail }} style={styles.fill} contentFit="cover" transition={200} />
        <TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(p.propertyId)}>
          <Ionicons name={isFavorited(p.propertyId) ? 'heart' : 'heart-outline'} size={20} color={isFavorited(p.propertyId) ? '#ff385c' : '#fff'} />
        </TouchableOpacity>
        {p.instantBookEnabled && (
          <View style={styles.instantBadge}>
            <Ionicons name="flash" size={11} color="#fff" />
            <Text style={styles.instantBadgeText}>Instant</Text>
          </View>
        )}
        {p.averageRating > 0 && (
          <View style={styles.wideRatingBadge}>
            <Ionicons name="star" size={11} color="#fff" />
            <Text style={styles.wideRatingText}>{p.averageRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardMeta}>
        <Text style={[styles.loc, { color: text }]} numberOfLines={1}>{p.district || p.region}</Text>
        <Text style={[styles.title, { color: subtle }]} numberOfLines={1}>{p.title}</Text>
        <Text style={[styles.price, { color: text }]}>
          {p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()}
          <Text style={{ color: subtle, fontWeight: '400' }}> night</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCompactCard = (p: any) => (
    <TouchableOpacity style={styles.compactCard} activeOpacity={0.92} onPress={() => router.push(`/short-property/${p.propertyId}`)}>
      <View style={[styles.compactImgWrap, { height: (W - 44) / 2 * 1.1 }]}>
        <Image source={{ uri: p.thumbnail }} style={styles.fill} contentFit="cover" transition={200} />
        <TouchableOpacity style={styles.heartSmall} onPress={() => toggleFavorite(p.propertyId)}>
          <Ionicons name={isFavorited(p.propertyId) ? 'heart' : 'heart-outline'} size={16} color={isFavorited(p.propertyId) ? '#ff385c' : '#fff'} />
        </TouchableOpacity>
        {p.instantBookEnabled && (
          <View style={styles.instantBadgeSmall}>
            <Ionicons name="flash" size={9} color="#fff" />
            <Text style={styles.instantBadgeSmallText}>Instant</Text>
          </View>
        )}
      </View>
      <View style={styles.compactMeta}>
        <Text style={[styles.compactLoc, { color: text }]} numberOfLines={1}>{p.district || p.region}</Text>
        <Text style={[styles.compactTitle, { color: subtle }]} numberOfLines={1}>{p.title}</Text>
        <Text style={[styles.compactPrice, { color: text }]}>
          {p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()}
          <Text style={{ color: subtle, fontWeight: '400' }}> /n</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Header component with categories
  const ListHeader = () => (
    <>
      {/* Featured Hero Card */}
      {featured && (
        <TouchableOpacity
          style={styles.hero}
          activeOpacity={0.9}
          onPress={() => router.push(`/short-property/${featured.propertyId}`)}
        >
          <Image source={{ uri: featured.thumbnail || undefined }} style={[styles.fill, { height: W * 0.85 }]} contentFit="cover" transition={300} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.heroGradient} />
          <TouchableOpacity style={styles.heroHeart} onPress={() => toggleFavorite(featured.propertyId)}>
            <Ionicons name={isFavorited(featured.propertyId) ? 'heart' : 'heart-outline'} size={22} color={isFavorited(featured.propertyId) ? '#ff385c' : '#fff'} />
          </TouchableOpacity>
          <View style={styles.heroInfo}>
            <Text style={styles.heroLoc}>{featured.district || featured.region}</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{featured.title}</Text>
            <Text style={styles.heroPrice}>
              {featured.currency === 'TZS' ? 'Tshs' : featured.currency} {(featured.nightlyRate || 0).toLocaleString()}
              <Text style={styles.heroPriceUnit}> /night</Text>
            </Text>
          </View>
          {featured.averageRating > 0 && (
            <View style={styles.heroRating}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.heroRatingText}>{featured.averageRating.toFixed(1)}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Categories Section */}
      <View style={styles.catSection}>
        <Text style={[styles.catTitle, { color: text }]}>Explore by occasion</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/search?category=${cat.param}` as any)}
            >
              <Image source={{ uri: cat.img }} style={styles.catImg} contentFit="cover" transition={200} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.catGrad} />
              <View style={styles.catOverlay}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={styles.catLabel}>{cat.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section title for feed */}
      {rest.length > 0 && (
        <Text style={[styles.feedTitle, { color: text }]}>More stays to explore</Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Sticky search bar */}
      <View style={[styles.headerBar, { backgroundColor: bg, borderBottomColor: border }]}>
        <SearchBar
          onPress={() => setShowSearchModal(true)}
          checkInDate={searchParams.checkInDate}
          checkOutDate={searchParams.checkOutDate}
        />
      </View>

      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        rentalType={RentalType.SHORT_TERM}
        onSearch={setSearchParams}
        onRentalTypeChange={() => {}}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={36} color={subtle} />
          <Text style={[styles.errTitle, { color: text }]}>Couldn't connect</Text>
          <Text style={[styles.errSub, { color: subtle }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: text }]} onPress={refetch}>
            <Text style={[styles.retryTxt, { color: bg }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(p: any) => p.propertyId}
          renderItem={renderFeedItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={tint} />}
          ListEmptyComponent={
            !featured ? (
              <View style={styles.center}>
                <Ionicons name="bed-outline" size={36} color={subtle} />
                <Text style={[styles.errTitle, { color: text }]}>No stays yet</Text>
                <Text style={[styles.errSub, { color: subtle }]}>Check back soon</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { borderBottomWidth: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  errTitle: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  errSub: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  retryBtn: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryTxt: { fontSize: 14, fontWeight: '600' },
  fill: { width: '100%', height: '100%' },
  feedContainer: { paddingBottom: 40 },

  // Hero
  hero: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  heroHeart: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroInfo: { position: 'absolute', bottom: 20, left: 18, right: 18 },
  heroLoc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3, lineHeight: 28 },
  heroPrice: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 8 },
  heroPriceUnit: { fontWeight: '400', color: 'rgba(255,255,255,0.8)' },
  heroRating: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  heroRatingText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Categories
  catSection: { marginTop: 28, marginBottom: 8 },
  catTitle: { fontSize: 19, fontWeight: '700', marginBottom: 14, paddingHorizontal: 20, letterSpacing: -0.3 },
  catScroll: { paddingHorizontal: 16 },
  catCard: { width: 130, height: 160, borderRadius: 14, overflow: 'hidden', marginRight: 10, position: 'relative' },
  catImg: { width: '100%', height: '100%' },
  catGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  catOverlay: { position: 'absolute', bottom: 12, left: 10 },
  catEmoji: { fontSize: 20, marginBottom: 2 },
  catLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Feed
  feedTitle: { fontSize: 19, fontWeight: '700', paddingHorizontal: 20, marginTop: 28, marginBottom: 14, letterSpacing: -0.3 },

  // Wide full-width card
  wideCard: { marginHorizontal: 16, marginBottom: 24 },
  wideImgWrap: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  wideRatingBadge: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  wideRatingText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  instantBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  instantBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Pair row (two compact cards side by side)
  pairRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 12 },
  pairHalf: { flex: 1 },

  // Compact card (half-width)
  compactCard: { flex: 1 },
  compactImgWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  heartSmall: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  instantBadgeSmall: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#10b981', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  instantBadgeSmallText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  compactMeta: { paddingTop: 6 },
  compactLoc: { fontSize: 13, fontWeight: '600' },
  compactTitle: { fontSize: 12, marginTop: 1 },
  compactPrice: { fontSize: 13, fontWeight: '600', marginTop: 3 },

  // Shared card styles
  card: { marginHorizontal: 16, marginBottom: 24 },
  cardImgWrap: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  heart: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  cardMeta: { paddingTop: 8 },
  loc: { fontSize: 15, fontWeight: '600', flex: 1 },
  title: { fontSize: 14, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '600', marginTop: 4 },
});
