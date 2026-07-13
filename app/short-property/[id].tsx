import PropertyAmenities from '@/components/property/PropertyAmenities';
import PropertyDescription from '@/components/property/PropertyDescription';
import PropertyHost from '@/components/property/PropertyHost';
import PropertyLocation from '@/components/property/PropertyLocation';
import PropertyRules from '@/components/property/PropertyRules';
import ReservationModal from '@/components/property/ReservationModal';
import ShortTermPropertyDetails from '@/components/property/ShortTermPropertyDetails';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { usePropertyFavorites } from '@/hooks/useProperty';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePropertyGeocode } from '@/hooks/useGeocode';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

// ─── IN-PAGE GALLERY CAROUSEL ──────────────────────────────
function GalleryCarousel({ images, height, onTap }: { images: string[]; height: number; onTap: (idx: number) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <View style={{ height }}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={0.95} onPress={() => onTap(index)}>
            <Image source={{ uri: item }} style={{ width: W, height }} contentFit="cover" transition={200} />
          </TouchableOpacity>
        )}
      />
      {/* Dot indicators */}
      {images.length > 1 && images.length <= 8 && (
        <View style={styles.carouselDots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.carouselDot, { opacity: i === activeIdx ? 1 : 0.4 }]} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function ShortTermPropertyDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const propertyId = params.id as string;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [showReservation, setShowReservation] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  const { property, loading, error, retry } = useShortTermPropertyDetail(propertyId);
  const { toggleFavorite, isFavorited } = usePropertyFavorites();
  const { coordinates } = usePropertyGeocode(property);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false, staysActiveInBackground: false, shouldDuckAndroid: true });
  }, []);

  const images: string[] = property?.images || [];
  const GALLERY_H = H * 0.45; // Taller — almost half the screen like Airbnb

  const handleShare = async () => {
    try { await Share.share({ message: `${property?.title}\nhttps://ndotonistays.com/property/${propertyId}` }); } catch {}
  };

  const openGallery = (index: number) => { setGalleryStart(index); setGalleryVisible(true); };

  // ─── LOADING ─────────────────────────────────────────────
  if (loading) {
    return <View style={[styles.fill, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={tint} /></View>;
  }
  if (error || !property) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={{ fontSize: 17, fontWeight: '700', color: text, marginTop: 12 }}>Couldn't load property</Text>
          <Text style={{ fontSize: 14, color: subtle, textAlign: 'center', marginTop: 4 }}>{error}</Text>
          <TouchableOpacity onPress={retry} style={{ marginTop: 20, backgroundColor: tint, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: tint, fontWeight: '600' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" />

      {/* ─── MAIN SCROLL ─── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* ─── IMAGE CAROUSEL ─── */}
        <View style={{ height: GALLERY_H }}>
          {images.length > 0 ? (
            <GalleryCarousel images={images} height={GALLERY_H} onTap={openGallery} />
          ) : (
            <View style={{ flex: 1, backgroundColor: border, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="image-outline" size={48} color={subtle} />
            </View>
          )}

          {/* Overlay nav */}
          <View style={[styles.navOverlay, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => toggleFavorite(propertyId)}>
                <Ionicons name={isFavorited(propertyId) ? 'heart' : 'heart-outline'} size={20} color={isFavorited(propertyId) ? '#ff385c' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Photo count */}
          {images.length > 1 && (
            <View style={styles.photoCount}>
              <Ionicons name="images" size={12} color="#fff" />
              <Text style={styles.photoCountText}>{images.length} photos</Text>
            </View>
          )}
        </View>

        {/* ─── CONTENT CARD ─── */}
        <View style={[styles.contentCard, { backgroundColor: card }]}>

          {/* Title block */}
          <View style={styles.titleBlock}>
            <View style={styles.typeRow}>
              <Text style={[styles.propType, { color: tint }]}>{property.propertyType}</Text>
              {property.instantBookEnabled && (
                <View style={[styles.instantBadge, { backgroundColor: `${tint}12` }]}>
                  <Ionicons name="flash" size={12} color={tint} />
                  <Text style={[styles.instantText, { color: tint }]}>Instant Book</Text>
                </View>
              )}
            </View>
            <Text style={[styles.propTitle, { color: text }]}>{property.title}</Text>
            <View style={styles.metaLine}>
              <Ionicons name="location-outline" size={14} color={subtle} />
              <Text style={[styles.metaText, { color: subtle }]}>{property.district}, {property.region}</Text>
            </View>
            <View style={styles.quickStats}>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={16} color={text} />
                <Text style={[styles.statText, { color: text }]}>{property.maxGuests} guests</Text>
              </View>
              {(property.averageRating ?? 0) > 0 && (
                <View style={styles.stat}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={[styles.statText, { color: text }]}>{(property.averageRating ?? 0).toFixed(1)}</Text>
                  {(property.ratingSummary?.totalReviews ?? 0) > 0 && (
                    <Text style={[styles.statTextSub, { color: subtle }]}>({property.ratingSummary?.totalReviews} reviews)</Text>
                  )}
                </View>
              )}
              {property.minimumStay && property.minimumStay > 1 && (
                <View style={styles.stat}>
                  <Ionicons name="moon-outline" size={16} color={text} />
                  <Text style={[styles.statText, { color: text }]}>{property.minimumStay} min nights</Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.sep, { backgroundColor: border }]} />

          {/* Host quick info */}
          {property.host && (
            <>
              <View style={styles.hostQuick}>
                <View style={[styles.hostAvatar, { backgroundColor: `${tint}15` }]}>
                  {property.host.profileImage ? (
                    <Image source={{ uri: property.host.profileImage }} style={styles.hostAvatarImg} contentFit="cover" />
                  ) : (
                    <Text style={[styles.hostInitial, { color: tint }]}>{property.host.firstName?.charAt(0) || 'H'}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hostedBy, { color: text }]}>Hosted by {property.host.firstName}</Text>
                  {property.instantBookEnabled ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="shield-checkmark" size={12} color={tint} />
                      <Text style={[styles.hostSub, { color: tint }]}>Instant booking available</Text>
                    </View>
                  ) : (
                    <Text style={[styles.hostSub, { color: subtle }]}>Usually responds within a few hours</Text>
                  )}
                </View>
              </View>
              <View style={[styles.sep, { backgroundColor: border }]} />
            </>
          )}

          {/* Details */}
          <ShortTermPropertyDetails
            maxGuests={property.maxGuests} maxAdults={property.maxAdults} maxChildren={property.maxChildren}
            maxInfants={property.maxInfants} minimumStay={property.minimumStay} maximumStay={property.maximumStay}
            checkInTime={property.checkInTime} checkOutTime={property.checkOutTime}
            textColor={text} tintColor={tint} secondaryText={subtle}
          />
          <View style={[styles.sep, { backgroundColor: border }]} />

          {/* Description */}
          {property.description ? (
            <>
              <PropertyDescription description={property.description} textColor={text} tintColor={tint} />
              <View style={[styles.sep, { backgroundColor: border }]} />
            </>
          ) : null}

          {/* Amenities */}
          {(property.amenities?.length ?? 0) > 0 && (
            <>
              <PropertyAmenities amenities={property.amenities!} textColor={text} tintColor={tint} backgroundColor={bg} borderColor={border} />
              <View style={[styles.sep, { backgroundColor: border }]} />
            </>
          )}

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <Text style={[styles.secTitle, { color: text }]}>Price details</Text>
            <View style={styles.priceItem}>
              <Text style={{ fontSize: 15, color: subtle }}>Nightly rate</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: text }}>{property.currency} {property.nightlyRate?.toLocaleString()}</Text>
            </View>
            {(property.cleaningFee ?? 0) > 0 && (
              <View style={styles.priceItem}>
                <Text style={{ fontSize: 15, color: subtle }}>Cleaning fee</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: text }}>{property.currency} {property.cleaningFee?.toLocaleString()}</Text>
              </View>
            )}
            {(property.serviceFeePercentage ?? 0) > 0 && (
              <View style={styles.priceItem}>
                <Text style={{ fontSize: 15, color: subtle }}>Service fee</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: text }}>{property.serviceFeePercentage}%</Text>
              </View>
            )}
          </View>
          <View style={[styles.sep, { backgroundColor: border }]} />

          {/* Rules */}
          <PropertyRules
            houseRules={property.houseRules} allowsPets={property.allowsPets} allowsSmoking={property.allowsSmoking}
            allowsChildren={property.allowsChildren} allowsInfants={property.allowsInfants}
            cancellationPolicy={property.cancellationPolicy} textColor={text} tintColor={tint} secondaryText={subtle}
          />
          <View style={[styles.sep, { backgroundColor: border }]} />

          {/* Host full */}
          {property.host && (
            <>
              <PropertyHost
                firstName={property.host.firstName} lastName={property.host.lastName}
                profileImage={property.host.profileImage} textColor={text} tintColor={tint} backgroundColor={bg} borderColor={border}
              />
              <View style={[styles.sep, { backgroundColor: border }]} />
            </>
          )}

          {/* Map */}
          {coordinates && (
            <PropertyLocation
              latitude={coordinates.latitude} longitude={coordinates.longitude} title={property.title}
              textColor={text} tintColor={tint} secondaryText={subtle} backgroundColor={bg} borderColor={border}
            />
          )}

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* ─── BOTTOM BAR ─── */}
      <View style={[styles.bottomBar, { backgroundColor: card, borderTopColor: border, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View>
          <Text style={[styles.barPrice, { color: text }]}>
            {property.currency === 'TZS' ? 'Tshs' : property.currency} {property.nightlyRate?.toLocaleString()}
          </Text>
          <Text style={[styles.barUnit, { color: subtle }]}>per night</Text>
        </View>
        <TouchableOpacity style={[styles.reserveBtn, { backgroundColor: tint }]} onPress={() => setShowReservation(true)} activeOpacity={0.85}>
          {property.instantBookEnabled && <Ionicons name="flash" size={16} color="#fff" style={{ marginRight: 4 }} />}
          <Text style={styles.reserveText}>
            {property.instantBookEnabled ? 'Reserve & Pay' : 'Request to Book'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── FULLSCREEN GALLERY ─── */}
      <Modal visible={galleryVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setGalleryVisible(false)}>
        <FullScreenGallery images={images} startIndex={galleryStart} onClose={() => setGalleryVisible(false)} />
      </Modal>

      {/* ─── RESERVATION ─── */}
      {property && (
        <ReservationModal
          visible={showReservation}
          onClose={() => setShowReservation(false)}
          propertyId={property.propertyId}
          propertyTitle={property.title}
          pricePerNight={property.nightlyRate}
          currency={property.currency}
          minimumStay={property.minimumStay ?? 1}
          propertyImage={property.thumbnail || property.images?.[0]}
          instantBookEnabled={property.instantBookEnabled ?? false}
          cleaningFee={property.cleaningFee ?? 0}
          serviceFeePercentage={property.serviceFeePercentage ?? 0}
          maxGuests={property.maxGuests ?? 10}
        />
      )}
    </View>
  );
}

// ─── FULLSCREEN GALLERY COMPONENT ──────────────────────────
function FullScreenGallery({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View style={[styles.galleryHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.galleryBackBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.galleryCounter}>{currentIdx + 1} / {images.length}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Images */}
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        onMomentumScrollEnd={(e) => setCurrentIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={{ width: W, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: item }} style={{ width: W, height: H * 0.65 }} contentFit="contain" transition={150} />
          </View>
        )}
      />

      {/* Dot indicators */}
      {images.length <= 10 && (
        <View style={styles.galleryDots}>
          {images.map((_, i) => (
            <View key={i} style={[styles.galleryDot, { backgroundColor: i === currentIdx ? '#fff' : 'rgba(255,255,255,0.3)' }]} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────
const styles = StyleSheet.create({
  fill: { flex: 1 },

  // Nav overlay on gallery
  navOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  navBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  navRight: { flexDirection: 'row', gap: 8 },
  photoCount: { position: 'absolute', bottom: 28, right: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  photoCountText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Carousel dots (in-page)
  carouselDots: { position: 'absolute', bottom: 32, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  carouselDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff' },

  // Content card
  contentCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingTop: 28 },

  // Title
  titleBlock: { paddingHorizontal: 20, paddingBottom: 20 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  propType: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  instantBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  instantText: { fontSize: 11, fontWeight: '700' },
  propTitle: { fontSize: 24, fontWeight: '800', lineHeight: 30, letterSpacing: -0.3 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { fontSize: 14 },
  quickStats: { flexDirection: 'row', gap: 16, marginTop: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 14, fontWeight: '600' },
  statTextSub: { fontSize: 13 },

  // Host quick
  hostQuick: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 18 },
  hostAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hostAvatarImg: { width: 48, height: 48 },
  hostInitial: { fontSize: 20, fontWeight: '700' },
  hostedBy: { fontSize: 16, fontWeight: '600' },
  hostSub: { fontSize: 13, marginTop: 1 },

  // Separator
  sep: { height: 1, marginHorizontal: 20, marginVertical: 2 },

  // Pricing
  pricingSection: { paddingHorizontal: 20, paddingVertical: 18 },
  secTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  priceItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6 },
  barPrice: { fontSize: 18, fontWeight: '800' },
  barUnit: { fontSize: 13, marginTop: 1 },
  reserveBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  reserveText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Gallery modal
  galleryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  galleryBackBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  galleryCounter: { color: '#fff', fontSize: 16, fontWeight: '600' },
  galleryDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 30 },
  galleryDot: { width: 7, height: 7, borderRadius: 3.5 },
});
