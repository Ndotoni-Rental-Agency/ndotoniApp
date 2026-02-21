import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import LocationSelector from '@/components/location/LocationSelector';
import MediaSelector from '@/components/media/MediaSelector';
import MapCoordinatesPicker from '@/components/property/MapCoordinatesPicker';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createPropertyDraft, createShortTermPropertyDraft } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ROOM', label: 'Room' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const SHORT_TERM_PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ROOM', label: 'Room' },
  { value: 'GUESTHOUSE', label: 'Guesthouse' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'COTTAGE', label: 'Cottage' },
];

export default function ListPropertyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const [formData, setFormData] = useState({
    rentalType: 'LONG_TERM', // 'LONG_TERM' or 'SHORT_TERM'
    title: 'Beautiful Home Available',
    propertyType: 'HOUSE',
    shortTermPropertyType: 'HOUSE',
    region: '',
    district: '',
    ward: '',
    street: '',
    monthlyRent: '',
    nightlyRate: '',
    cleaningFee: '',
    maxGuests: '2',
    minimumStay: '1',
    bedrooms: '1',
    bathrooms: '1',
    coordinates: null as { latitude: number; longitude: number } | null,
  });

  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPropertyTypePicker, setShowPropertyTypePicker] = useState(false);
  const [showTitleGenerator, setShowTitleGenerator] = useState(false);

  // Generate multiple title variations
  const generateTitleOptions = () => {
    const titles: string[] = [];
    
    const bedrooms = formData.bedrooms && parseInt(formData.bedrooms) > 0 ? formData.bedrooms : null;
    const propertyType = formData.rentalType === 'LONG_TERM' 
      ? PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label
      : SHORT_TERM_PROPERTY_TYPES.find(t => t.value === formData.shortTermPropertyType)?.label;
    const location = formData.ward || formData.district || formData.region;
    
    if (!propertyType || !location) {
      return [
        'Modern Property for Rent',
        'Beautiful Home Available',
        'Spacious Living Space',
        'Comfortable Accommodation',
        'Quality Property Available',
      ];
    }

    // Template variations
    if (bedrooms) {
      titles.push(`${bedrooms} Bedroom ${propertyType} in ${location}`);
      titles.push(`Spacious ${bedrooms} Bedroom ${propertyType} - ${location}`);
      titles.push(`Modern ${bedrooms}BR ${propertyType} | ${location}`);
      titles.push(`Beautiful ${bedrooms} Bed ${propertyType}, ${location}`);
      titles.push(`${bedrooms}BR ${propertyType} Available in ${location}`);
      titles.push(`Cozy ${bedrooms} Bedroom ${propertyType} - ${location}`);
      titles.push(`${location}: ${bedrooms} Bedroom ${propertyType}`);
      titles.push(`Lovely ${bedrooms}BR ${propertyType} in ${location}`);
      titles.push(`${bedrooms} Bedroom ${propertyType} | ${location} Area`);
      titles.push(`Quality ${bedrooms}BR ${propertyType} - ${location}`);
    } else {
      titles.push(`${propertyType} in ${location}`);
      titles.push(`Modern ${propertyType} - ${location}`);
      titles.push(`Beautiful ${propertyType} | ${location}`);
      titles.push(`Spacious ${propertyType}, ${location}`);
      titles.push(`${propertyType} Available in ${location}`);
      titles.push(`Cozy ${propertyType} - ${location}`);
      titles.push(`${location}: ${propertyType}`);
      titles.push(`Lovely ${propertyType} in ${location}`);
      titles.push(`${propertyType} | ${location} Area`);
      titles.push(`Quality ${propertyType} - ${location}`);
    }
    
    return titles.slice(0, 10);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a property title');
      return;
    }
    if (!formData.region) {
      Alert.alert('Error', 'Please select a region');
      return;
    }
    if (!formData.district) {
      Alert.alert('Error', 'Please select a district');
      return;
    }

    // Validate pricing based on rental type
    if (formData.rentalType === 'LONG_TERM') {
      if (!formData.monthlyRent || parseFloat(formData.monthlyRent) <= 0) {
        Alert.alert('Error', 'Please enter a valid monthly rent');
        return;
      }
    } else {
      if (!formData.nightlyRate || parseFloat(formData.nightlyRate) <= 0) {
        Alert.alert('Error', 'Please enter a valid nightly rate');
        return;
      }
    }

    // Check authentication - show modal if not signed in
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to list a property',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => setShowSignIn(true) },
        ]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.rentalType === 'LONG_TERM') {
        await handleLongTermSubmit();
      } else {
        await handleShortTermSubmit();
      }
    } catch (error: any) {
      console.error('[ListProperty] Error:', error);
      Alert.alert('Error', error?.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLongTermSubmit = async () => {
    const hasMedia = selectedMedia.length > 0;
    
    const input: any = {
      title: formData.title.trim(),
      propertyType: formData.propertyType,
      region: formData.region,
      district: formData.district,
      monthlyRent: parseFloat(formData.monthlyRent),
      currency: 'TZS',
      available: hasMedia, // Publish if has media, draft otherwise
      latitude: formData.coordinates?.latitude || 0.0,
      longitude: formData.coordinates?.longitude || 0.0,
    };

    if (formData.ward) input.ward = formData.ward;
    if (formData.street) input.street = formData.street;
    if (formData.bedrooms) input.bedrooms = parseInt(formData.bedrooms);
    if (formData.bathrooms) input.bathrooms = parseInt(formData.bathrooms);
    if (selectedImages.length > 0) input.images = selectedImages;
    if (selectedVideos.length > 0) input.videos = selectedVideos;

    const data = await GraphQLClient.executeAuthenticated<{ createPropertyDraft: any }>(
      createPropertyDraft,
      { input }
    );

    if (data.createPropertyDraft?.success) {
      const message = hasMedia 
        ? 'Property published successfully!' 
        : 'Long-term rental draft created successfully!';
      showSuccessAndReset(message);
    } else {
      Alert.alert('Error', data.createPropertyDraft?.message || 'Failed to create property');
    }
  };

  const handleShortTermSubmit = async () => {
    const hasMedia = selectedMedia.length > 0;
    
    const input: any = {
      title: formData.title.trim(),
      propertyType: formData.shortTermPropertyType,
      region: formData.region,
      district: formData.district,
      nightlyRate: parseFloat(formData.nightlyRate),
      currency: 'TZS',
      available: hasMedia, // Publish if has media, draft otherwise
      latitude: formData.coordinates?.latitude || 0.0,
      longitude: formData.coordinates?.longitude || 0.0,
    };

    // Optional fields - only include if provided
    if (formData.cleaningFee) input.cleaningFee = parseFloat(formData.cleaningFee);
    if (formData.maxGuests) input.maxGuests = parseInt(formData.maxGuests);
    if (formData.minimumStay) input.minimumStay = parseInt(formData.minimumStay);
    if (formData.bedrooms) input.bedrooms = parseInt(formData.bedrooms);
    if (formData.bathrooms) input.bathrooms = parseInt(formData.bathrooms);
    if (selectedImages.length > 0) input.images = selectedImages;
    if (selectedVideos.length > 0) input.videos = selectedVideos;

    const data = await GraphQLClient.executeAuthenticated<{ createShortTermPropertyDraft: any }>(
      createShortTermPropertyDraft,
      { input }
    );

    if (data.createShortTermPropertyDraft?.success) {
      const message = hasMedia 
        ? 'Property published successfully!' 
        : 'Short-term rental draft created successfully!';
      showSuccessAndReset(message);
    } else {
      Alert.alert('Error', data.createShortTermPropertyDraft?.message || 'Failed to create property');
    }
  };

  const showSuccessAndReset = (message: string) => {
    const hasMedia = selectedMedia.length > 0;
    const detailMessage = hasMedia 
      ? 'Your property is now live and visible to potential tenants!'
      : 'You can add more details, photos, and videos later.';
    
    Alert.alert(
      'Success!',
      message + ' ' + detailMessage,
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              rentalType: 'LONG_TERM',
              title: '',
              propertyType: 'HOUSE',
              shortTermPropertyType: 'HOUSE',
              region: '',
              district: '',
              ward: '',
              street: '',
              monthlyRent: '',
              nightlyRate: '',
              cleaningFee: '',
              maxGuests: '2',
              minimumStay: '1',
              bedrooms: '1',
              bathrooms: '1',
              coordinates: null,
            });
            setSelectedMedia([]);
            setSelectedImages([]);
            setSelectedVideos([]);
            router.push('/(tabs)/profile');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.headerIcon, { backgroundColor: `${tintColor}15` }]}>
                <View style={[styles.headerIconInner, { backgroundColor: tintColor }]}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: textColor }]}>List Your Property</Text>
                <Text style={[styles.subtitle, { color: placeholderColor }]}>
                  Quick draft • Add details later
                </Text>
              </View>
            </View>
          </View>

          {/* Rental Type Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>
              Rental Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.rentalTypeRow}>
              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  { 
                    borderColor,
                    backgroundColor: formData.rentalType === 'LONG_TERM' ? tintColor : inputBg,
                  },
                  formData.rentalType === 'LONG_TERM' && {
                    borderColor: tintColor,
                  },
                ]}
                onPress={() => setFormData({ ...formData, rentalType: 'LONG_TERM' })}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconCircle,
                  { 
                    backgroundColor: formData.rentalType === 'LONG_TERM' 
                      ? 'rgba(255,255,255,0.2)' 
                      : `${tintColor}15`,
                  }
                ]}>
                  <Ionicons 
                    name="home" 
                    size={20} 
                    color={formData.rentalType === 'LONG_TERM' ? '#fff' : tintColor} 
                  />
                </View>
                <View style={styles.rentalTypeTextContainer}>
                  <Text
                    style={[
                      styles.rentalTypeText,
                      { color: textColor },
                      formData.rentalType === 'LONG_TERM' && styles.rentalTypeTextActive,
                    ]}
                  >
                    Long-term
                  </Text>
                  <Text
                    style={[
                      styles.rentalTypeSubtext,
                      { color: placeholderColor },
                      formData.rentalType === 'LONG_TERM' && { color: 'rgba(255,255,255,0.8)' },
                    ]}
                  >
                    Monthly rent
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  { 
                    borderColor,
                    backgroundColor: formData.rentalType === 'SHORT_TERM' ? tintColor : inputBg,
                  },
                  formData.rentalType === 'SHORT_TERM' && {
                    borderColor: tintColor,
                  },
                ]}
                onPress={() => setFormData({ ...formData, rentalType: 'SHORT_TERM' })}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconCircle,
                  { 
                    backgroundColor: formData.rentalType === 'SHORT_TERM' 
                      ? 'rgba(255,255,255,0.2)' 
                      : `${tintColor}15`,
                  }
                ]}>
                  <Ionicons 
                    name="calendar" 
                    size={20} 
                    color={formData.rentalType === 'SHORT_TERM' ? '#fff' : tintColor} 
                  />
                </View>
                <View style={styles.rentalTypeTextContainer}>
                  <Text
                    style={[
                      styles.rentalTypeText,
                      { color: textColor },
                      formData.rentalType === 'SHORT_TERM' && styles.rentalTypeTextActive,
                    ]}
                  >
                    Short-term
                  </Text>
                  <Text
                    style={[
                      styles.rentalTypeSubtext,
                      { color: placeholderColor },
                      formData.rentalType === 'SHORT_TERM' && { color: 'rgba(255,255,255,0.8)' },
                    ]}
                  >
                    Nightly rate
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>
              Property Title <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.titleInputContainer}>
              <TextInput
                style={[styles.titleInput, { color: textColor, backgroundColor: inputBg, borderColor }]}
                placeholder="e.g., 2 Bedroom Apartment in Ilala"
                placeholderTextColor={placeholderColor}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
              <TouchableOpacity
                style={[styles.generateIconButton, { backgroundColor: tintColor }]}
                onPress={() => setShowTitleGenerator(true)}
              >
                <Ionicons name="sparkles" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>
              Property Type <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: inputBg, borderColor }]}
              onPress={() => setShowPropertyTypePicker(true)}
            >
              <Text style={[styles.selectorText, { color: textColor }]}>
                {formData.rentalType === 'LONG_TERM'
                  ? PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label
                  : SHORT_TERM_PROPERTY_TYPES.find(t => t.value === formData.shortTermPropertyType)?.label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={placeholderColor} />
            </TouchableOpacity>
          </View>

          {/* Location */}
          <LocationSelector
            value={{
              region: formData.region,
              district: formData.district,
              ward: formData.ward,
              street: formData.street,
            }}
            onChange={(location) => setFormData({ ...formData, ...location })}
            required
          />

          {/* GPS Coordinates - Only show when region is selected */}
          {formData.region && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>GPS Coordinates (optional)</Text>
              <MapCoordinatesPicker
                value={formData.coordinates}
                onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
                region={formData.region}
                district={formData.district}
                ward={formData.ward}
              />
            </View>
          )}

          {/* Pricing */}
          {formData.rentalType === 'LONG_TERM' ? (
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>
                Monthly Rent (TZS) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                placeholder="e.g., 500000"
                placeholderTextColor={placeholderColor}
                value={formData.monthlyRent}
                onChangeText={(text) => setFormData({ ...formData, monthlyRent: text })}
                keyboardType="numeric"
              />
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={[styles.label, { color: textColor }]}>
                  Nightly Rate (TZS) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                  placeholder="e.g., 50000"
                  placeholderTextColor={placeholderColor}
                  value={formData.nightlyRate}
                  onChangeText={(text) => setFormData({ ...formData, nightlyRate: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.section, styles.halfWidth]}>
                  <Text style={[styles.label, { color: textColor }]}>Cleaning Fee (optional)</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                    placeholder="e.g., 10000"
                    placeholderTextColor={placeholderColor}
                    value={formData.cleaningFee}
                    onChangeText={(text) => setFormData({ ...formData, cleaningFee: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.section, styles.halfWidth]}>
                  <Text style={[styles.label, { color: textColor }]}>Min. Stay (nights)</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                    value={formData.minimumStay}
                    onChangeText={(text) => setFormData({ ...formData, minimumStay: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}

          {/* Bedrooms & Bathrooms */}
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>
                Bedrooms <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>
                {formData.rentalType === 'SHORT_TERM' ? 'Max Guests' : 'Bathrooms'}
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                value={formData.rentalType === 'SHORT_TERM' ? formData.maxGuests : formData.bathrooms}
                onChangeText={(text) => {
                  if (formData.rentalType === 'SHORT_TERM') {
                    setFormData({ ...formData, maxGuests: text });
                  } else {
                    setFormData({ ...formData, bathrooms: text });
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {formData.rentalType === 'SHORT_TERM' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>Bathrooms</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
                value={formData.bathrooms}
                onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Media Selector */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.mediaSelectorToggle,
                { 
                  backgroundColor: showMediaSelector ? `${tintColor}10` : inputBg,
                  borderColor: showMediaSelector ? tintColor : borderColor,
                }
              ]}
              onPress={() => setShowMediaSelector(!showMediaSelector)}
              activeOpacity={0.7}
            >
              <View style={styles.mediaSelectorHeader}>
                <View style={styles.mediaSelectorLeft}>
                  <Ionicons 
                    name={showMediaSelector ? "images" : "images-outline"} 
                    size={20} 
                    color={tintColor} 
                  />
                  <Text style={[styles.mediaSelectorText, { color: tintColor }]}>
                    {showMediaSelector ? 'Hide' : 'Add'} photos & videos
                  </Text>
                </View>
                <Ionicons 
                  name={showMediaSelector ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={tintColor} 
                />
              </View>
              {selectedMedia.length > 0 && (
                <Text style={[styles.mediaCount, { color: placeholderColor }]}>
                  {selectedMedia.length} {selectedMedia.length === 1 ? 'file' : 'files'} selected
                </Text>
              )}
            </TouchableOpacity>

            {showMediaSelector && (
              <MediaSelector
                selectedMedia={selectedMedia}
                onMediaChange={(mediaUrls, images, videos) => {
                  setSelectedMedia(mediaUrls);
                  setSelectedImages(images);
                  setSelectedVideos(videos);
                }}
                maxSelection={10}
                onAuthRequired={() => setShowSignIn(true)}
              />
            )}
          </View>

          {/* Info Note */}
          <View style={[styles.infoBox, { backgroundColor: inputBg, borderColor }]}>
            <Ionicons name="information-circle" size={20} color={tintColor} />
            <Text style={[styles.infoText, { color: placeholderColor }]}>
              You can add photos, videos, and more details later using Edit Property
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonText}>
                  {selectedMedia.length > 0 ? 'Publish Property' : 'Save Draft'}
                </Text>
                <Ionicons 
                  name={selectedMedia.length > 0 ? "checkmark-done-circle" : "checkmark-circle"} 
                  size={22} 
                  color="#fff" 
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>

      {/* Property Type Picker Modal */}
      <Modal visible={showPropertyTypePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Property Type</Text>
              <TouchableOpacity onPress={() => setShowPropertyTypePicker(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {(formData.rentalType === 'LONG_TERM' ? PROPERTY_TYPES : SHORT_TERM_PROPERTY_TYPES).map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.modalListItem,
                    { borderBottomColor: borderColor },
                    (formData.rentalType === 'LONG_TERM' 
                      ? formData.propertyType === type.value 
                      : formData.shortTermPropertyType === type.value) && { 
                      backgroundColor: `${tintColor}15` 
                    },
                  ]}
                  onPress={() => {
                    if (formData.rentalType === 'LONG_TERM') {
                      setFormData({ ...formData, propertyType: type.value });
                    } else {
                      setFormData({ ...formData, shortTermPropertyType: type.value });
                    }
                    setShowPropertyTypePicker(false);
                  }}
                >
                  <Text style={[styles.modalListItemText, { color: textColor }]}>
                    {type.label}
                  </Text>
                  {(formData.rentalType === 'LONG_TERM' 
                    ? formData.propertyType === type.value 
                    : formData.shortTermPropertyType === type.value) && (
                    <Ionicons name="checkmark-circle" size={22} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Title Generator Modal */}
      <Modal visible={showTitleGenerator} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="sparkles" size={22} color={tintColor} />
                <Text style={[styles.modalTitle, { color: textColor }]}>Generate Title</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTitleGenerator(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {generateTitleOptions().map((title, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.titleOption,
                    { borderBottomColor: borderColor },
                    formData.title === title && { backgroundColor: `${tintColor}15` },
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, title });
                    setShowTitleGenerator(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.titleOptionText, 
                      { color: textColor },
                      formData.title === title && { fontWeight: '600' },
                    ]}
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                  {formData.title === title && (
                    <Ionicons name="checkmark-circle" size={22} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Authentication Modals */}
      <SignInModal
        visible={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
        onForgotPassword={() => {
          // TODO: Implement forgot password flow
          Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
        }}
        onNeedsVerification={(email) => {
          // TODO: Implement email verification flow
          Alert.alert('Verify Email', `Please check ${email} for verification code`);
        }}
      />
      <SignUpModal
        visible={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
        onNeedsVerification={(email) => {
          // TODO: Implement email verification flow
          Alert.alert('Verify Email', `Please check ${email} for verification code`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIconInner: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  required: {
    color: '#ef4444',
    fontSize: 15,
  },
  titleInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  titleInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  generateIconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  selectorText: {
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  typeButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
    minWidth: 100,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  mediaSelectorToggle: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  mediaSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mediaSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  mediaCount: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 30,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 28,
    gap: 14,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  rentalTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rentalTypeButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rentalTypeTextContainer: {
    flex: 1,
  },
  rentalTypeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  rentalTypeSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  rentalTypeTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalList: {
    maxHeight: 400,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalListItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  titleOptionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
