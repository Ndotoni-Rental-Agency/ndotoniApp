import PropertyMapView from '@/components/map/PropertyMapView';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { usePropertyDetail } from '@/hooks/propertyDetails/usePropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePropertyGeocode } from '@/hooks/useGeocode';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { Ionicons } from '@expo/vector-icons';
import { Audio, ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInitializingChat, setIsInitializingChat] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const headerBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#374151' }, 'background');

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
        {/* Image Gallery with Overlay Buttons */}
        {allMedia.length > 0 && (
          <View style={styles.imageGalleryContainer}>
            <FlatList
              data={allMedia}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setSelectedImageIndex(index);
              }}
              renderItem={({ item, index }) => {
                const isVideo = item.match(/\.(mp4|mov|avi|webm)(\?|$)/i);
                
                return isVideo ? (
                  <Video
                    source={{ uri: item }}
                    style={styles.propertyImage}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay={index === selectedImageIndex}
                    isLooping
                    isMuted={false}
                  />
                ) : (
                  <Image
                    source={{ uri: item }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                  />
                );
              }}
              keyExtractor={(item, index) => index.toString()}
            />
            
            {/* Overlay Header Buttons - Scroll with image */}
            <View style={styles.imageOverlayHeader}>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerRightButtons}>
                  <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                    onPress={() => console.log('Share')}
                  >
                    <Ionicons name="share-outline" size={22} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                    onPress={() => console.log('Favorite')}
                  >
                    <Ionicons name="heart-outline" size={22} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Media Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1} / {allMedia.length}
              </Text>
            </View>
          </View>
        )}

        {/* Property Info */}
        <View style={[styles.contentContainer, { backgroundColor: headerBg }]}>
          {/* Title and Location */}
          <View style={styles.section}>
            <Text style={[styles.propertyTitle, { color: textColor }]}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>
                {property.address.district}, {property.address.region}
              </Text>
            </View>
            {property.pricing && property.pricing.monthlyRent > 0 && (
              <View style={styles.ratingRow}>
                <Text style={[styles.ratingText, { color: textColor }]}>
                  {formatPrice(property.pricing.monthlyRent, property.pricing.currency)}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Description */}
          {property.description && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>About this place</Text>
                <Text style={[styles.descriptionText, { color: textColor }]}>
                  {property.description}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}


          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Amenities</Text>
                <View style={styles.amenitiesList}>
                  {property.amenities.slice(0, 6).map((amenity: string | null, index: number) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                      <Text style={[styles.amenityText, { color: textColor }]}>{amenity}</Text>
                    </View>
                  ))}
                </View>
                {property.amenities.length > 6 && (
                  <TouchableOpacity style={styles.showMoreButton}>
                    <Text style={[styles.showMoreText, { color: tintColor }]}>
                      Show all {property.amenities.length} amenities
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Host Info */}
          {property.landlord && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Hosted by</Text>
                <View style={styles.hostInfo}>
                  <View style={[styles.hostAvatar, { backgroundColor: tintColor }]}>
                    <Text style={styles.hostInitials}>
                      {property.landlord.firstName?.[0]}{property.landlord.lastName?.[0]}
                    </Text>
                  </View>
                  <View style={styles.hostDetails}>
                    <Text style={[styles.hostName, { color: textColor }]}>
                      {property.landlord.firstName} {property.landlord.lastName}
                    </Text>
                    <Text style={styles.hostRole}>Property Landlord</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            </>
          )}

          {/* Map View */}
          {coordinates && (
            <View style={styles.mapSection}>
              <Text style={[styles.sectionTitle, { color: textColor, paddingHorizontal: 20 }]}>Location</Text>
              <PropertyMapView
                latitude={coordinates.latitude}
                longitude={coordinates.longitude}
                title={property.title}
              />
              <Text style={[styles.mapDisclaimer, { paddingHorizontal: 20 }]}>
                Approximate location shown for privacy
              </Text>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar - Prominent */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: headerBg }}>
        <View style={[styles.bottomBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
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
            <Text style={styles.reserveButtonText}>Contact Owner</Text>
            <Ionicons name="chevron-up" size={20} color="#fff" />
          </TouchableOpacity>
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
  imageOverlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 8,
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
  imageGalleryContainer: {
    height: 420,
    position: 'relative',
  },
  propertyImage: {
    width: SCREEN_WIDTH,
    height: 420,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mapSection: {
    paddingVertical: 16,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  featureText: {
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  mapDisclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  amenitiesList: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amenityText: {
    fontSize: 15,
  },
  showMoreButton: {
    marginTop: 12,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  hostRole: {
    fontSize: 14,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
    paddingRight: 16,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomPriceUnit: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
