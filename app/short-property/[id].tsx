import PropertyAmenities from '@/components/property/PropertyAmenities';
import PropertyDescription from '@/components/property/PropertyDescription';
import PropertyHost from '@/components/property/PropertyHost';
import PropertyLocation from '@/components/property/PropertyLocation';
import PropertyMediaGallery from '@/components/property/PropertyMediaGallery';
import PropertyRules from '@/components/property/PropertyRules';
import ReservationModal from '@/components/property/ReservationModal';
import ShortTermPropertyDetails from '@/components/property/ShortTermPropertyDetails';
import ShortTermPropertyHeader from '@/components/property/ShortTermPropertyHeader';
import ShortTermPropertyPricing from '@/components/property/ShortTermPropertyPricing';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePropertyGeocode } from '@/hooks/useGeocode';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShortTermPropertyDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [showReservationModal, setShowReservationModal] = useState(false);
  
  // Use the short-term property detail hook
  const { property, loading: isLoading, error, retry } = useShortTermPropertyDetail(propertyId);
  
  // Use the new geocoding hook
  const { coordinates } = usePropertyGeocode(property);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#374151' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  // Set up audio mode for video playback with sound
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  const images = property?.images || [];
  const videos = (property as any)?.videos || [];
  const allMedia = [...images, ...videos];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: textColor }]}>Error</Text>
          <Text style={styles.errorText}>{error || 'Property not found'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={retry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Media Gallery */}
        {allMedia.length > 0 && (
          <PropertyMediaGallery
            images={images}
            videos={videos}
            onBack={() => router.back()}
            onShare={() => console.log('Share')}
            onFavorite={() => console.log('Favorite')}
          />
        )}

        {/* Property Info */}
        <View style={[styles.contentContainer, { backgroundColor: headerBg }]}>
          {/* Header with Title, Rating, and Price */}
          <ShortTermPropertyHeader
            title={property.title}
            district={property.district}
            region={property.region}
            averageRating={property.averageRating}
            totalReviews={property.ratingSummary?.totalReviews}
            textColor={textColor}
            tintColor={tintColor}
            secondaryText={secondaryText}
          />

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Property Details */}
          <ShortTermPropertyDetails
            maxGuests={property.maxGuests}
            maxAdults={property.maxAdults}
            maxChildren={property.maxChildren}
            maxInfants={property.maxInfants}
            minimumStay={property.minimumStay}
            maximumStay={property.maximumStay}
            checkInTime={property.checkInTime}
            checkOutTime={property.checkOutTime}
            textColor={textColor}
            tintColor={tintColor}
            secondaryText={secondaryText}
          />

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Description */}
          {property.description && (
            <>
              <PropertyDescription
                description={property.description}
                textColor={textColor}
                tintColor={tintColor}
              />
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <>
              <PropertyAmenities
                amenities={property.amenities}
                textColor={textColor}
                tintColor={tintColor}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
              />
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Pricing Details */}
          <ShortTermPropertyPricing
            nightlyRate={property.nightlyRate}
            currency={property.currency}
            cleaningFee={property.cleaningFee}
            serviceFeePercentage={property.serviceFeePercentage}
            textColor={textColor}
            tintColor={tintColor}
            secondaryText={secondaryText}
          />
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* House Rules & Policies */}
          <PropertyRules
            houseRules={property.houseRules}
            allowsPets={property.allowsPets}
            allowsSmoking={property.allowsSmoking}
            allowsChildren={property.allowsChildren}
            allowsInfants={property.allowsInfants}
            cancellationPolicy={property.cancellationPolicy}
            textColor={textColor}
            tintColor={tintColor}
            secondaryText={secondaryText}
          />
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Host Info */}
          {property.host && (
            <>
              <PropertyHost
                firstName={property.host.firstName}
                lastName={property.host.lastName}
                textColor={textColor}
                tintColor={tintColor}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
              />
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Map View */}
          {coordinates && (
            <PropertyLocation
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              title={property.title}
              textColor={textColor}
              tintColor={tintColor}
              secondaryText={secondaryText}
              backgroundColor={backgroundColor}
              borderColor={borderColor}
            />
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Booking Bar - Prominent */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: headerBg }}>
        <View style={[styles.bottomBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
          <View style={styles.bottomBarContent}>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: textColor }]}>
                {property.currency} {property.nightlyRate.toLocaleString()}
              </Text>
              <Text style={styles.priceUnit}>per night</Text>
            </View>
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: tintColor }]}
              onPress={() => setShowReservationModal(true)}
            >
              <Text style={styles.bookButtonText}>Reserve</Text>
            </TouchableOpacity>
          </View>

          {/* Reservation Modal */}
          {property && (
            <ReservationModal
              visible={showReservationModal}
              onClose={() => setShowReservationModal(false)}
              propertyId={property.propertyId}
              propertyTitle={property.title}
              pricePerNight={property.nightlyRate}
              currency={property.currency}
              minimumStay={property.minimumStay ?? 1}
              propertyImage={property.thumbnail || property.images?.[0]}
            />
          )}
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    paddingRight: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
