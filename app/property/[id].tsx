import PropertyAddress from '@/components/property/PropertyAddress';
import PropertyAmenities from '@/components/property/PropertyAmenities';
import PropertyAvailability from '@/components/property/PropertyAvailability';
import PropertyDescription from '@/components/property/PropertyDescription';
import PropertyHeader from '@/components/property/PropertyHeader';
import PropertyHost from '@/components/property/PropertyHost';
import PropertyLocation from '@/components/property/PropertyLocation';
import PropertyMediaGallery from '@/components/property/PropertyMediaGallery';
import PropertyPricing from '@/components/property/PropertyPricing';
import PropertySpecifications from '@/components/property/PropertySpecifications';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { usePropertyDetail } from '@/hooks/propertyDetails/usePropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePropertyGeocode } from '@/hooks/useGeocode';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LongTermPropertyDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  // Use the property detail hook
  const { property, loading: isLoading, error, retry } = usePropertyDetail(propertyId);
  const { isAuthenticated } = useAuth();
  const { initializeChat } = useChat();
  
  // Use the new geocoding hook
  const { coordinates } = usePropertyGeocode(property);
  
  const [isInitializingChat, setIsInitializingChat] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');
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

  const formatPrice = (amount: number, currency: string = 'TZS') => {
    return `${currency} ${amount?.toLocaleString()}`;
  };

  const handleContactAgent = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to contact the property owner',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(tabs)/profile') }
        ]
      );
      return;
    }

    if (!property) return;

    try {
      setIsInitializingChat(true);
      const chatData = await initializeChat(property.propertyId);
      
      // Navigate to conversation
      const encodedConversationId = encodeURIComponent(chatData.conversationId);
      router.push(`/conversation/${encodedConversationId}`);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    } finally {
      setIsInitializingChat(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!property) return;

    const whatsappNumber = property.landlord?.whatsappNumber || property.agent?.whatsappNumber;
    
    if (!whatsappNumber) {
      Alert.alert('Not Available', 'WhatsApp contact is not available for this property');
      return;
    }

    const whatsappUrl = generateWhatsAppUrl(
      whatsappNumber,
      property.title,
      property.propertyId
    );

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed.');
    });
  };

  const images = property?.media?.images || [];
  const videos = property?.media?.videos || [];
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
          {/* Header with Title and Price */}
          <PropertyHeader
            title={property.title}
            district={property.address.district}
            region={property.address.region}
            textColor={textColor}
            tintColor={tintColor}
          />

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Property Specifications */}
          {property.specifications && (
            <>
              <PropertySpecifications
                bedrooms={property.specifications.bedrooms}
                bathrooms={property.specifications.bathrooms}
                squareMeters={property.specifications.squareMeters}
                floors={property.specifications.floors}
                parkingSpaces={property.specifications.parkingSpaces}
                furnished={property.specifications.furnished}
                textColor={textColor}
                tintColor={tintColor}
                backgroundColor={backgroundColor}
              />
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

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
          {property.pricing && property.pricing.monthlyRent && (
            <>
              <PropertyPricing
                monthlyRent={property.pricing.monthlyRent}
                currency={property.pricing.currency || 'TZS'}
                deposit={property.pricing.deposit}
                serviceCharge={property.pricing.serviceCharge}
                utilitiesIncluded={property.pricing.utilitiesIncluded}
                textColor={textColor}
                tintColor={tintColor}
                secondaryText={secondaryText}
              />
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Availability */}
          {property.availability && (
            <>
              <PropertyAvailability
                available={property.availability.available}
                availableFrom={property.availability.availableFrom}
                minimumLeaseTerm={property.availability.minimumLeaseTerm}
                maximumLeaseTerm={property.availability.maximumLeaseTerm}
                textColor={textColor}
                tintColor={tintColor}
                secondaryText={secondaryText}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
              />
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Full Address */}
          <PropertyAddress
            street={property.address.street}
            ward={property.address.ward}
            district={property.address.district}
            region={property.address.region}
            postalCode={property.address.postalCode}
            textColor={textColor}
            tintColor={tintColor}
            secondaryText={secondaryText}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
          />
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Host Info */}
          {property.landlord && (
            <>
              <PropertyHost
                firstName={property.landlord.firstName}
                lastName={property.landlord.lastName}
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

      {/* Bottom Bar - Modern Design */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: headerBg }}>
        <View style={[styles.bottomBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
          <View style={styles.bottomBarContent}>
            {property.pricing && property.pricing.monthlyRent > 0 && (
              <View style={styles.priceContainer}>
                <Text style={[styles.bottomPrice, { color: textColor }]}>
                  {formatPrice(property.pricing.monthlyRent, property.pricing.currency)}
                </Text>
                <Text style={styles.bottomPriceUnit}>per month</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.reserveButton, { backgroundColor: tintColor }]}
              onPress={() => setShowContactModal(true)}
            >
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.reserveButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: headerBg }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Contact Options</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Price Info */}
            {property.pricing && property.pricing.monthlyRent > 0 && (
              <View style={[styles.modalPriceSection, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalPrice, { color: textColor }]}>
                  {formatPrice(property.pricing.monthlyRent, property.pricing.currency)}
                </Text>
                <Text style={styles.modalPriceUnit}>per month</Text>
              </View>
            )}

            {/* Contact Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalContactButton, { backgroundColor: textColor }]}
                onPress={() => {
                  setShowContactModal(false);
                  handleContactAgent();
                }}
                disabled={isInitializingChat}
              >
                {isInitializingChat ? (
                  <ActivityIndicator size="small" color={backgroundColor} />
                ) : (
                  <>
                    <Ionicons name="chatbubble" size={20} color={backgroundColor} />
                    <Text style={[styles.modalContactButtonText, { color: backgroundColor }]}>
                      Contact Agent
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {(property.landlord?.whatsappNumber || property.agent?.whatsappNumber) && (
                <TouchableOpacity
                  style={[styles.modalWhatsappButton, { backgroundColor: '#10B981' }]}
                  onPress={() => {
                    setShowContactModal(false);
                    handleWhatsAppContact();
                  }}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={styles.modalWhatsappButtonText}>WhatsApp Contact</Text>
                </TouchableOpacity>
              )}

              {/* Check Availability Placeholder */}
              <TouchableOpacity
                style={[styles.modalCheckButton, { borderColor: borderColor }]}
                onPress={() => {
                  setShowContactModal(false);
                  Alert.alert('Coming Soon', 'Availability checker will be available soon');
                }}
              >
                <Ionicons name="calendar-outline" size={20} color={textColor} />
                <Text style={[styles.modalCheckButtonText, { color: textColor }]}>
                  Check Availability
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800',
  },
  bottomPriceUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalPriceSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalPriceUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  modalContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  modalContactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalWhatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  modalWhatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  modalCheckButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
