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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import BrandLoader from '@/components/ui/BrandLoader';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  SlideInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const entranceEasing = Easing.out(Easing.cubic);

// Roughly how many rows sit "above the fold" on first load — those cascade in
// together once the categories finish. Everything past that is only ever
// revealed by scrolling, so it fades/rises in immediately as it enters view
// (Airbnb-style progressive reveal) instead of waiting on the load sequence.
const FIRST_SCREEN_COUNT = 6;
const staggerDelay = (i: number) => Math.min(i, 6) * 45;
const cardEntranceDelay = (idx: number) =>
  idx < FIRST_SCREEN_COUNT ? CATEGORIES_ANIM_END + 150 + staggerDelay(idx) : 0;

// Visual category cards
const CATEGORIES = [
  { id: 'stays', label: 'Nightly Stays', icon: 'moon', param: 'NIGHTLY_STAY', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500&auto=format&fit=crop' },
  { id: 'beach', label: 'Beach', icon: 'sunny', param: 'BEACH', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop' },
  { id: 'safari', label: 'Safari', icon: 'paw', param: 'SAFARI', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=500&auto=format&fit=crop' },
  { id: 'parties', label: 'Parties', icon: 'musical-notes', param: 'PARTY', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=500&auto=format&fit=crop' },
  { id: 'photos', label: 'Photoshoot', icon: 'camera', param: 'PHOTOSHOOT', img: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=500&auto=format&fit=crop' },
  { id: 'business', label: 'Business', icon: 'briefcase', param: 'MEETING', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=500&auto=format&fit=crop' },
];

// Categories slide in one at a time; everything below (the "More stays to
// explore" title and the first screenful of cards) waits until that cascade
// finishes, then follows on smoothly instead of animating at the same time.
const CATEGORY_STAGGER = 150;
const CATEGORY_DURATION = 1000;
const CATEGORIES_ANIM_END = (CATEGORIES.length - 1) * CATEGORY_STAGGER + CATEGORY_DURATION;

function Dot({ color, delay }: { color: string; delay: number }) {
  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 320 }), withTiming(0.6, { duration: 320 })), -1, true)
    );
  }, [delay, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

function ThreeDotsLoader({ color }: { color: string }) {
  return (
    <View style={styles.dotsRow}>
      <Dot color={color} delay={0} />
      <Dot color={color} delay={140} />
      <Dot color={color} delay={280} />
    </View>
  );
}

// Cards revealed by scrolling fake a brief "still loading" beat (three dots,
// resolving at a slightly different moment per card) before cross-fading
// into the real content — purely cosmetic, the data is already in memory.
function useFakeReveal(isNew: boolean, skip: boolean, idx: number) {
  const [loading, setLoading] = useState(isNew && !skip);
  useEffect(() => {
    if (!loading) return;
    const delay = 320 + Math.min(idx, 10) * 35;
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loading;
}

interface CardProps {
  p: any;
  idx: number;
  isNew: boolean;
  text: string;
  subtle: string;
  border: string;
  onPress: () => void;
}

function WideCard({ p, idx, isNew, text, subtle, border, onPress, W }: CardProps & { W: number }) {
  const isFirstScreen = idx < FIRST_SCREEN_COUNT;
  const loading = useFakeReveal(isNew, isFirstScreen, idx);
  const imgHeight = Math.min(W * 0.55, 380);

  if (loading) {
    return (
      <View style={[styles.wideCard, styles.skeleton, { height: imgHeight + 78, backgroundColor: border }]}>
        <ThreeDotsLoader color={subtle} />
      </View>
    );
  }

  return (
    <Animated.View entering={isNew ? FadeInDown.delay(isFirstScreen ? cardEntranceDelay(idx) : 0).duration(360).easing(entranceEasing) : undefined}>
      <AnimatedPressable style={styles.wideCard} pressedScale={0.97} onPress={onPress}>
        <View style={[styles.wideImgWrap, { height: imgHeight }]}>
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
      </AnimatedPressable>
    </Animated.View>
  );
}

function CompactCard({ p, idx, isNew, text, subtle, border, onPress, cardWidth }: CardProps & { cardWidth: number }) {
  const isFirstScreen = idx < FIRST_SCREEN_COUNT;
  const loading = useFakeReveal(isNew, isFirstScreen, idx);
  const imgHeight = cardWidth * 1.1;

  if (loading) {
    return (
      <View style={styles.compactCard}>
        <View style={[styles.skeleton, { height: imgHeight + 60, backgroundColor: border }]}>
          <ThreeDotsLoader color={subtle} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={styles.compactCard} entering={isNew ? FadeInDown.delay(isFirstScreen ? cardEntranceDelay(idx) : 0).duration(360).easing(entranceEasing) : undefined}>
      <AnimatedPressable pressedScale={0.97} onPress={onPress}>
        <View style={[styles.compactImgWrap, { height: imgHeight }]}>
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
      </AnimatedPressable>
    </Animated.View>
  );
}

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
  // FlatList unmounts/remounts offscreen rows as they scroll past the virtualization
  // window, which would re-fire `entering` every time a card scrolls back into view.
  // Track which ids have already played their entrance so it only ever happens once.
  const seenIds = useRef(new Set<string>()).current;
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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

  // On Android especially, the hero's entrance was firing as soon as the
  // component mounted — well before its (network) image had actually
  // finished loading — so categories would cascade in above a still-blank
  // hero, which then popped its image in a moment later looking like a
  // second animation. Gate the hero's own entrance, and everything after
  // it, on the image actually being ready instead of on mount.
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  useEffect(() => {
    if (!featured?.thumbnail) {
      setHeroImageLoaded(true);
      return;
    }
    setHeroImageLoaded(false);
    // Safety net in case the image errors silently or never fires onLoad —
    // don't leave the rest of the screen waiting forever.
    const t = setTimeout(() => setHeroImageLoaded(true), 2500);
    return () => clearTimeout(t);
  }, [featured?.propertyId, featured?.thumbnail]);

  const heroProgress = useSharedValue(0);
  useEffect(() => {
    if (heroImageLoaded) {
      heroProgress.value = withTiming(1, { duration: 380, easing: entranceEasing });
    }
  }, [heroImageLoaded, heroProgress]);
  const heroEntranceStyle = useAnimatedStyle(() => ({
    opacity: heroProgress.value,
    transform: [{ translateY: interpolate(heroProgress.value, [0, 1], [24, 0], Extrapolation.CLAMP) }],
  }));

  const renderWideCard = useCallback((p: any, idx: number = 0) => {
    const isNew = !seenIds.has(p.propertyId);
    if (isNew) seenIds.add(p.propertyId);
    return (
      <WideCard
        p={p}
        idx={idx}
        isNew={isNew}
        text={text}
        subtle={subtle}
        border={border}
        W={W}
        onPress={() => router.push(`/short-property/${p.propertyId}`)}
      />
    );
  }, [W, text, subtle, border, router, seenIds]);

  const renderCompactCard = useCallback((p: any, idx: number = 0) => {
    const isNew = !seenIds.has(p.propertyId);
    if (isNew) seenIds.add(p.propertyId);
    return (
      <CompactCard
        p={p}
        idx={idx}
        isNew={isNew}
        text={text}
        subtle={subtle}
        border={border}
        cardWidth={COMPACT_CARD_WIDTH}
        onPress={() => router.push(`/short-property/${p.propertyId}`)}
      />
    );
  }, [COMPACT_CARD_WIDTH, text, subtle, border, router, seenIds]);

  // Build a varied layout: rows of `numColumns` compact cards, with a
  // full-width tall card breaking up the grid every numColumns+1 items —
  // on a phone (numColumns=2) this is exactly the old fixed 2-then-wide
  // pattern; on a tablet the compact rows widen to 3-4 cards instead.
  const renderFeedItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const patternLength = numColumns + 1;
    const patternPos = index % patternLength;

    if (patternPos === numColumns) {
      // Full-width tall card
      return renderWideCard(item, index);
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
          <React.Fragment key={p.propertyId}>{renderCompactCard(p, index)}</React.Fragment>
        ))}
        {Array.from({ length: numColumns - rowItems.length }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.pairHalf} />
        ))}
      </View>
    );
  }, [rest, numColumns, renderWideCard, renderCompactCard]);

  const headerBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 40], [0, 1], Extrapolation.CLAMP),
  }));

  const heroHeight = Math.min(W * 0.85, 520);
  const heroImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-120, 0], [1.25, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, heroHeight], [0, heroHeight * 0.25], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }] };
  });

  // Header component with categories
  const ListHeader = () => (
    <>
      {/* Featured Hero Card */}
      {featured && (
        <Animated.View style={heroEntranceStyle}>
          <AnimatedPressable
            style={styles.hero}
            pressedScale={0.98}
            onPress={() => router.push(`/short-property/${featured.propertyId}`)}
          >
            <Animated.View style={[{ width: '100%', height: heroHeight }, heroImageStyle]}>
              <Image
                source={{ uri: featured.thumbnail || undefined }}
                style={styles.fill}
                contentFit="cover"
                transition={300}
                onLoad={() => setHeroImageLoaded(true)}
                onError={() => setHeroImageLoaded(true)}
              />
            </Animated.View>
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
          </AnimatedPressable>
        </Animated.View>
      )}

      {/* Categories + feed title only start their entrance once the hero image
          is actually ready, so nothing cascades in ahead of it. */}
      {heroImageLoaded && (
        <>
          <View style={styles.catSection}>
            <Text style={[styles.catTitle, { color: text }]}>Explore by occasion</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {CATEGORIES.map((cat, idx) => (
                <Animated.View key={cat.id} entering={SlideInRight.delay(idx * CATEGORY_STAGGER).duration(CATEGORY_DURATION).easing(entranceEasing)}>
                  <AnimatedPressable
                    style={[styles.catCard, isTablet && styles.catCardTablet]}
                    pressedScale={0.95}
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
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {/* Section title for feed */}
          {rest.length > 0 && (
            <Animated.View entering={FadeInDown.delay(CATEGORIES_ANIM_END + 60).duration(380).easing(entranceEasing)}>
              <Text style={[styles.feedTitle, { color: text }]}>More stays to explore</Text>
            </Animated.View>
          )}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Sticky search bar */}
      <View style={[styles.headerBar, { backgroundColor: bg }]}>
        <SearchBar
          onPress={() => setShowSearchModal(true)}
          checkInDate={searchParams.checkInDate}
          checkOutDate={searchParams.checkOutDate}
        />
        <Animated.View pointerEvents="none" style={[styles.headerBarBorder, { backgroundColor: border }, headerBorderStyle]} />
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
        <Animated.FlatList
          data={heroImageLoaded ? rest : []}
          keyExtractor={(p: any) => p.propertyId}
          renderItem={renderFeedItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          // All properties are already fetched in memory, but FlatList's defaults
          // (initialNumToRender: 10, windowSize: 21 "screens") mean most of a short
          // list like this mounts immediately anyway — every image starts loading
          // at once instead of a few, with the rest appearing as you scroll. These
          // tighter values make the rows actually render progressively.
          initialNumToRender={4}
          maxToRenderPerBatch={3}
          windowSize={5}
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
  headerBar: { position: 'relative' },
  headerBarBorder: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
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

  // Fake "still loading" skeleton for cards revealed by scrolling
  skeleton: { borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },

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
