import FavoriteButton from '@/components/FavoriteButton';
import FullScreenGallery from '@/components/property/FullScreenGallery';
import GalleryCarousel from '@/components/property/GalleryCarousel';
import HighlightCard from '@/components/property/HighlightCard';
import PropertyAmenities from '@/components/property/PropertyAmenities';
import PropertyDescription from '@/components/property/PropertyDescription';
import PropertyHost from '@/components/property/PropertyHost';
import PropertyLocation from '@/components/property/PropertyLocation';
import PropertyReviews from '@/components/property/PropertyReviews';
import PropertyRules from '@/components/property/PropertyRules';
import ReservationModal from '@/components/property/ReservationModal';
import ShortTermPropertyDetails from '@/components/property/ShortTermPropertyDetails';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePropertyGeocode } from '@/hooks/useGeocode';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: H } = Dimensions.get('window');

export default function ShortTermPropertyDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const propertyId = params.id as string;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [showReservation, setShowReservation] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const { property, loading, error, retry } = useShortTermPropertyDetail(propertyId);
  const { coordinates } = usePropertyGeocode(property);
  const { isAuthenticated } = useAuth();
  const { initializeChat, sendMessage } = useChat();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  const images: string[] = property?.images || [];
  const GALLERY_H = H * 0.42;

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, GALLERY_H - 100, GALLERY_H - 60],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const handleShare = async () => {
    try {
      await Share.share({ message: `${property?.title}\nhttps://ndotonistays.com/property/${propertyId}` });
    } catch {}
  };

  const handleContactHost = async () => {
    if (!isAuthenticated) {
      setShowSignIn(true);
      return;
    }

    setChatLoading(true);
    try {
      const chatData = await initializeChat(propertyId);
      const conversationId = chatData.conversationId;

      // Send a template message with the property link
      const propertyUrl = `https://ndotonistays.com/property/${propertyId}`;
      const templateMessage = `Hi, I'm interested in your property: ${property?.title}\n${propertyUrl}`;
      await sendMessage(conversationId, templateMessage);

      // Navigate to the conversation
      router.push(`/conversation/${encodeURIComponent(conversationId)}` as any);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not start conversation');
    } finally {
      setChatLoading(false);
    }
  };

  const openGallery = (index: number) => {
    setGalleryStart(index);
    setGalleryVisible(true);
  };

  // ─── LOADING STATE ─────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.fill, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={tint} />
        <Text style={{ color: subtle, marginTop: 12, fontSize: 14 }}>Loading property...</Text>
      </View>
    );
  }

  // ─── ERROR STATE ───────────────────────────────────────
  if (error || !property) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={{ fontSize: 17, fontWeight: '700', color: text, marginTop: 12 }}>
            Couldn't load property
          </Text>
          <Text style={{ fontSize: 14, color: subtle, textAlign: 'center', marginTop: 4 }}>{error}</Text>
          <TouchableOpacity
            onPress={retry}
            style={{ marginTop: 20, backgroundColor: tint, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: tint, fontWeight: '600' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Build highlights
  const highlights: { icon: string; title: string; subtitle: string }[] = [];
  if (property.instantBookEnabled) {
    highlights.push({ icon: 'flash', title: 'Instant Book', subtitle: 'Book without waiting for approval' });
  }
  if ((property.averageRating ?? 0) >= 4.5) {
    highlights.push({ icon: 'star', title: 'Guest favourite', subtitle: `${property.averageRating?.toFixed(1)} · ${property.ratingSummary?.totalReviews || 0} reviews` });
  }
  if (property.cancellationPolicy === 'FLEXIBLE') {
    highlights.push({ icon: 'shield-checkmark', title: 'Free cancellation', subtitle: 'Cancel up to 24h before check-in' });
  }
  if (property.checkInTime) {
    highlights.push({ icon: 'key', title: 'Self check-in', subtitle: `Check in from ${property.checkInTime}` });
  }

  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" />

      {/* ─── ANIMATED HEADER (shows on scroll) ─── */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top, backgroundColor: card, borderBottomColor: border }]}>
        <TouchableOpacity style={styles.stickyBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={text} />
        </TouchableOpacity>
        <Text style={[styles.stickyTitle, { color: text }]} numberOfLines={1}>{property.title}</Text>
        <View style={styles.stickyRight}>
          <TouchableOpacity style={styles.stickyBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={text} />
          </TouchableOpacity>
          <FavoriteButton propertyId={propertyId} size={18} variant="light-bg" style={styles.stickyBtn} />
        </View>
      </Animated.View>

      {/* ─── MAIN SCROLL ─── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* ─── IMAGE GALLERY ─── */}
        <View style={{ height: GALLERY_H }}>
          {images.length > 0 ? (
            <GalleryCarousel images={images} height={GALLERY_H} onTap={openGallery} />
          ) : (
            <View style={{ flex: 1, backgroundColor: border, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="image-outline" size={48} color={subtle} />
            </View>
          )}

          {/* Gradient overlay at bottom for smooth transition */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.15)']}
            style={styles.galleryGradient}
          />

          {/* Nav buttons on image */}
          <View style={[styles.navOverlay, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <FavoriteButton propertyId={propertyId} size={20} style={styles.navBtn} />
            </View>
          </View>

          {/* Show all photos button */}
          {images.length > 1 && (
            <TouchableOpacity style={styles.showPhotosBtn} onPress={() => openGallery(0)}>
              <Ionicons name="grid-outline" size={14} color="#fff" />
              <Text style={styles.showPhotosBtnText}>Show all photos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── CONTENT ─── */}
        <View style={[styles.content, { backgroundColor: bg }]}>

          {/* ── Title Section ── */}
          <View style={styles.titleSection}>
            <View style={styles.typeRow}>
              <View style={[styles.typeBadge, { backgroundColor: `${tint}10` }]}>
                <Text style={[styles.typeText, { color: tint }]}>{property.propertyType}</Text>
              </View>
              {property.instantBookEnabled && (
                <View style={[styles.instantBadge, { backgroundColor: '#10b98110' }]}>
                  <Ionicons name="flash" size={12} color="#10b981" />
                  <Text style={[styles.instantText, { color: '#10b981' }]}>Instant</Text>
                </View>
              )}
            </View>

            <Text style={[styles.title, { color: text }]}>{property.title}</Text>

            {/* Rating + Location row */}
            <View style={styles.metaRow}>
              {(property.averageRating ?? 0) > 0 && (
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={[styles.ratingText, { color: text }]}>
                    {(property.averageRating ?? 0).toFixed(1)}
                  </Text>
                  {(property.ratingSummary?.totalReviews ?? 0) > 0 && (
                    <Text style={[styles.reviewCount, { color: subtle }]}>
                      ({property.ratingSummary?.totalReviews} reviews)
                    </Text>
                  )}
                </View>
              )}
              <View style={styles.locationPill}>
                <Ionicons name="location" size={13} color={subtle} />
                <Text style={[styles.locationText, { color: subtle }]}>
                  {property.district}, {property.region}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: border }]} />

          {/* ── Host quick row ── */}
          {property.host && (
            <>
              <View style={styles.hostSection}>
                <View style={styles.hostRow}>
                  <View style={[styles.hostAvatar, { backgroundColor: `${tint}12` }]}>
                    {property.host.profileImage ? (
                      <Image source={{ uri: property.host.profileImage }} style={styles.hostAvatarImg} contentFit="cover" />
                    ) : (
                      <Text style={[styles.hostInitial, { color: tint }]}>
                        {property.host.firstName?.charAt(0) || 'H'}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hostedBy, { color: text }]}>
                      Hosted by {property.host.firstName}
                    </Text>
                    <Text style={[styles.hostSub, { color: subtle }]}>
                      {property.instantBookEnabled
                        ? 'Superhost · Instant booking'
                        : 'Usually responds within a few hours'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.contactBtn, { borderColor: border }]}
                    onPress={handleContactHost}
                    disabled={chatLoading}
                  >
                    {chatLoading ? (
                      <ActivityIndicator size="small" color={tint} />
                    ) : (
                      <Ionicons name="chatbubble-outline" size={16} color={tint} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.separator, { backgroundColor: border }]} />
            </>
          )}

          {/* ── Highlights ── */}
          {highlights.length > 0 && (
            <>
              <View style={styles.highlightsSection}>
                {highlights.slice(0, 3).map((h, i) => (
                  <HighlightCard key={i} icon={h.icon} title={h.title} subtitle={h.subtitle} tint={tint} text={text} />
                ))}
              </View>
              <View style={[styles.separator, { backgroundColor: border }]} />
            </>
          )}

          {/* ── Description ── */}
          {property.description ? (
            <>
              <PropertyDescription description={property.description} textColor={text} tintColor={tint} />
              <View style={[styles.separator, { backgroundColor: border }]} />
            </>
          ) : null}

          {/* ── Amenities ── */}
          {(property.amenities?.length ?? 0) > 0 && (
            <>
              <PropertyAmenities
                amenities={property.amenities!}
                textColor={text} tintColor={tint} backgroundColor={bg} borderColor={border}
              />
              <View style={[styles.separator, { backgroundColor: border }]} />
            </>
          )}

          {/* ── Details (check-in/out, guests, etc.) ── */}
          <ShortTermPropertyDetails
            maxGuests={property.maxGuests} maxAdults={property.maxAdults} maxChildren={property.maxChildren}
            maxInfants={property.maxInfants} minimumStay={property.minimumStay} maximumStay={property.maximumStay}
            checkInTime={property.checkInTime} checkOutTime={property.checkOutTime}
            textColor={text} tintColor={tint} secondaryText={subtle}
          />
          <View style={[styles.separator, { backgroundColor: border }]} />

          {/* ── Pricing ── */}
          <View style={styles.pricingSection}>
            <Text style={[styles.sectionTitle, { color: text }]}>Price breakdown</Text>
            <View style={styles.priceList}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: subtle }]}>Nightly rate</Text>
                <Text style={[styles.priceValue, { color: text }]}>
                  {property.currency === 'TZS' ? 'Tshs' : property.currency} {(property.nightlyRate ?? 0).toLocaleString()}
                </Text>
              </View>
              {(property.cleaningFee ?? 0) > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: subtle }]}>Cleaning fee</Text>
                  <Text style={[styles.priceValue, { color: text }]}>
                    {property.currency === 'TZS' ? 'Tshs' : property.currency} {(property.cleaningFee ?? 0).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: border }]} />

          {/* ── Reviews ── */}
          {(property.averageRating ?? 0) > 0 && (
            <>
              <PropertyReviews
                propertyId={propertyId}
                averageRating={property.averageRating}
                totalReviews={property.ratingSummary?.totalReviews}
                ratingSummary={property.ratingSummary}
              />
              <View style={[styles.separator, { backgroundColor: border }]} />
            </>
          )}

          {/* ── Rules ── */}
          <PropertyRules
            houseRules={property.houseRules} allowsPets={property.allowsPets} allowsSmoking={property.allowsSmoking}
            allowsChildren={property.allowsChildren} allowsInfants={property.allowsInfants}
            cancellationPolicy={property.cancellationPolicy} textColor={text} tintColor={tint} secondaryText={subtle}
          />
          <View style={[styles.separator, { backgroundColor: border }]} />

          {/* ── Map ── */}
          {coordinates && (
            <>
              <PropertyLocation
                latitude={coordinates.latitude} longitude={coordinates.longitude} title={property.title}
                textColor={text} tintColor={tint} secondaryText={subtle} backgroundColor={bg} borderColor={border}
              />
              <View style={[styles.separator, { backgroundColor: border }]} />
            </>
          )}

          {/* ── Host full profile ── */}
          {property.host && (
            <PropertyHost
              firstName={property.host.firstName} lastName={property.host.lastName}
              profileImage={property.host.profileImage} textColor={text} tintColor={tint}
              backgroundColor={bg} borderColor={border}
            />
          )}

          {/* Bottom spacer for fixed bar */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* ─── BOTTOM BOOKING BAR ─── */}
      <View style={[styles.bottomBar, { backgroundColor: card, borderTopColor: border, paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.bottomLeft}>
          <Text style={[styles.barPrice, { color: text }]}>
            {property.currency === 'TZS' ? 'Tshs' : property.currency}{' '}
            {(property.nightlyRate ?? 0).toLocaleString()}
          </Text>
          <Text style={[styles.barUnit, { color: subtle }]}>per night</Text>
        </View>
        <TouchableOpacity
          style={[styles.reserveBtn, { backgroundColor: tint }]}
          onPress={() => setShowReservation(true)}
          activeOpacity={0.85}
        >
          {property.instantBookEnabled && (
            <Ionicons name="flash" size={16} color="#fff" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.reserveText}>
            {property.instantBookEnabled ? 'Reserve' : 'Request to Book'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── FULLSCREEN GALLERY ─── */}
      <Modal visible={galleryVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setGalleryVisible(false)}>
        <FullScreenGallery images={images} startIndex={galleryStart} onClose={() => setGalleryVisible(false)} />
      </Modal>

      {/* ─── RESERVATION MODAL ─── */}
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

      {/* ─── AUTH MODALS ─── */}
      <SignInModal
        visible={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }}
        onForgotPassword={() => {}}
        onNeedsVerification={() => {}}
      />
      <SignUpModal
        visible={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }}
        onNeedsVerification={() => {}}
      />
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────
const styles = StyleSheet.create({
  fill: { flex: 1 },

  // Sticky header
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  stickyBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stickyTitle: { flex: 1, fontSize: 15, fontWeight: '600', textAlign: 'center', marginHorizontal: 8 },
  stickyRight: { flexDirection: 'row', gap: 4 },

  // Gallery
  galleryGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  navOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  navRight: { flexDirection: 'row', gap: 8 },
  pillIndicator: {
    position: 'absolute', bottom: 16, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  showPhotosBtn: {
    position: 'absolute', bottom: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  showPhotosBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Content
  content: { paddingTop: 4 },

  // Title section
  titleSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  instantBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  instantText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4, lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700' },
  reviewCount: { fontSize: 13 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13 },

  // Separator (thin line)
  separator: { height: 1, marginHorizontal: 20 },

  // Host section
  hostSection: { paddingHorizontal: 20, paddingVertical: 20 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hostAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hostAvatarImg: { width: 52, height: 52 },
  hostInitial: { fontSize: 22, fontWeight: '700' },
  hostedBy: { fontSize: 16, fontWeight: '600' },
  hostSub: { fontSize: 13, marginTop: 2 },
  contactBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  // Highlights
  highlightsSection: { paddingHorizontal: 20, paddingVertical: 20, gap: 14 },
  highlightCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 2,
  },
  highlightIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  highlightTitle: { fontSize: 15, fontWeight: '600' },
  highlightSub: { fontSize: 13, marginTop: 1 },

  // Pricing
  pricingSection: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  priceList: { gap: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 15 },
  priceValue: { fontSize: 15, fontWeight: '600' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  bottomLeft: {},
  barPrice: { fontSize: 18, fontWeight: '800' },
  barUnit: { fontSize: 12, marginTop: 2 },
  reserveBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
  },
  reserveText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Gallery modal
  galleryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  galleryCloseBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  galleryCounter: { color: '#fff', fontSize: 16, fontWeight: '600' },
  galleryDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 30 },
  galleryDot: { width: 7, height: 7, borderRadius: 3.5 },
});
