import FavoriteButton from '@/components/FavoriteButton';
import SearchBar from '@/components/search/SearchBar';
import SearchModal, { SearchParams } from '@/components/search/SearchModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCategorizedProperties } from '@/hooks/useCategorizedProperties';
import { useHiddenProperties } from '@/hooks/useHiddenProperties';
import { RentalType } from '@/hooks/useRentalType';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import BrandLoader from '@/components/ui/BrandLoader';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Visual category cards
const CATEGORIES = [
  { id: 'stays', label: 'Nightly Stays', icon: 'moon', param: 'NIGHTLY_STAY', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500&auto=format&fit=crop' },
  { id: 'beach', label: 'Beach', icon: 'sunny', param: 'BEACH', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop' },
  { id: 'safari', label: 'Safari', icon: 'paw', param: 'SAFARI', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=500&auto=format&fit=crop' },
  { id: 'parties', label: 'Parties', icon: 'musical-notes', param: 'PARTY', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=500&auto=format&fit=crop' },
  { id: 'photos', label: 'Photoshoot', icon: 'camera', param: 'PHOTOSHOOT', img: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=500&auto=format&fit=crop' },
  { id: 'business', label: 'Business', icon: 'briefcase', param: 'MEETING', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500&auto=format&fit=crop' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width: W, isTablet, numColumns, cardWidth: COMPACT_CARD_WIDTH } = useResponsiveGrid({ horizontalPadding: 32, columnGap: 12 });
  const [showSearchModal, setShowSearchModal] = useState(false);

  const today = new Date();
  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkInDate: today.toISOString().split('T')[0],
    checkOutDate: threeDays.toISOString().split('T')[0],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { appData, isLoading, error, refetch } = useCategorizedProperties('SHORT_TERM');
  const { hiddenIds } = useHiddenProperties();

  const bg = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const subtle = useThemeColor({}, 'textSecondary');

  // Merge all properties into one feed, deduped and filtered
  const feed = React.useMemo(() => {
    if (!appData) return [];
    const all = [
      ...(appData.categorizedProperties.lowestPrice?.properties || []),
      ...(appData.categorizedProperties.mostViewed?.properties || []),
      ...(appData.categorizedProperties.nearby?.properties || []),
      ...(appData.categorizedProperties.more?.properties || []),
    ];
    const seen = new Set<string>();
    return all.filter((p: any) => {
      if (seen.has(p.propertyId)) return false;
      if (hiddenIds.has(p.propertyId)) return false;
      seen.add(p.propertyId);
      return true;
    });
  }, [appData, hiddenIds]);

  const handleRefresh = async () => { setIsRefreshing(true); await refetch(); setIsRefreshing(false); };

  // Featured card — first property rendered big
  const featured: any = feed[0];
  const rest = feed.slice(1);

  const renderWideCard = useCallback((p: any) => (
    <TouchableOpacity style={styles.wideCard} activeOpacity={0.92} onPress={() => router.push(`/short-property/${p.propertyId}`)}>
      <View style={[styles.wideImgWrap, { height: Math.min(W * 0.55, 380) }]}>
        <Image source={{ uri: p.thumbnail }} style={styles.fill} contentFit="cover" transition={200} />
        <FavoriteButton propertyId={p.propertyId} size={20} style={styles.heart} />
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
  ), [W, text, subtle, router]);

  const renderCompactCard = useCallback((p: any) => (
    <TouchableOpacity style={styles.compactCard} activeOpacity={0.92} onPress={() => router.push(`/short-property/${p.propertyId}`)}>
      <View style={[styles.compactImgWrap, { height: COMPACT_CARD_WIDTH * 1.1 }]}>
        <Image source={{ uri: p.thumbnail }} style={styles.fill} contentFit="cover" transition={200} />
        <FavoriteButton propertyId={p.propertyId} size={16} style={styles.heartSmall} />
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
  ), [COMPACT_CARD_WIDTH, text, subtle, router]);

  // Build a varied layout: rows of `numColumns` compact cards, with a
  // full-width tall card breaking up the grid every numColumns+1 items —
  // on a phone (numColumns=2) this is exactly the old fixed 2-then-wide
  // pattern; on a tablet the compact rows widen to 3-4 cards instead.
  const renderFeedItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const patternLength = numColumns + 1;
    const patternPos = index % patternLength;

    if (patternPos === numColumns) {
      // Full-width tall card
      return renderWideCard(item);
    }
    // Only the first position in a row renders — it pulls in the rest of
    // the row itself, the other positions are skipped here.
    if (patternPos !== 0) return null;

    const rowItems = [item];
    for (let i = 1; i < numColumns; i++) {
      const next = rest[index + i];
      if (next) rowItems.push(next);
    }
    return (
      <View style={styles.pairRow}>
        {rowItems.map((p) => (
          <React.Fragment key={p.propertyId}>{renderCompactCard(p)}</React.Fragment>
        ))}
        {Array.from({ length: numColumns - rowItems.length }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.pairHalf} />
        ))}
      </View>
    );
  }, [rest, numColumns, renderWideCard, renderCompactCard]);

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
          <Image source={{ uri: featured.thumbnail || undefined }} style={[styles.fill, { height: Math.min(W * 0.85, 520) }]} contentFit="cover" transition={300} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.heroGradient} />
          <FavoriteButton propertyId={featured.propertyId} size={22} style={styles.heroHeart} />
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
              style={[styles.catCard, isTablet && styles.catCardTablet]}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/search', params: { category: cat.param } })}
            >
              <Image source={{ uri: cat.img }} style={styles.catImg} contentFit="cover" transition={200} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.catGrad} />
              <View style={[styles.catIconBadge, { backgroundColor: tint }]}>
                <Ionicons name={cat.icon as any} size={14} color="#fff" />
              </View>
              <View style={styles.catOverlay}>
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
          <BrandLoader />
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
  catCard: { width: 130, height: 160, borderRadius: 20, overflow: 'hidden', marginRight: 10, position: 'relative' },
  catCardTablet: { width: 176, height: 220, marginRight: 14 },
  catImg: { width: '100%', height: '100%' },
  catGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' },
  catIconBadge: {
    position: 'absolute', top: 10, left: 10,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  catOverlay: { position: 'absolute', bottom: 12, left: 10 },
  catLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Feed
  feedTitle: { fontSize: 19, fontWeight: '700', paddingHorizontal: 20, marginTop: 28, marginBottom: 14, letterSpacing: -0.3 },

  // Wide full-width card
  wideCard: { marginHorizontal: 16, marginBottom: 24 },
  wideImgWrap: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  wideRatingBadge: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  wideRatingText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  instantBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#00ce54', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  instantBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Pair row (two compact cards side by side)
  pairRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, gap: 12 },
  pairHalf: { flex: 1 },

  // Compact card (half-width)
  compactCard: { flex: 1 },
  compactImgWrap: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  heartSmall: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  instantBadgeSmall: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#00ce54', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
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
