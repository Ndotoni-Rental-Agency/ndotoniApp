import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { createPropertyDraft, createShortTermPropertyDraft } from '@/lib/graphql/mutations';
import LocationSelector from '@/components/location/LocationSelector';
import MediaSelector from '@/components/media/MediaSelector';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';

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
  });

  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

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
    const input: any = {
      title: formData.title.trim(),
      propertyType: formData.propertyType,
      region: formData.region,
      district: formData.district,
      monthlyRent: parseFloat(formData.monthlyRent),
      currency: 'TZS',
      available: false,
      latitude: 0.0,
      longitude: 0.0,
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
      showSuccessAndReset('Long-term rental draft created successfully!');
    } else {
      Alert.alert('Error', data.createPropertyDraft?.message || 'Failed to create property');
    }
  };

  const handleShortTermSubmit = async () => {
    const input: any = {
      title: formData.title.trim(),
      propertyType: formData.shortTermPropertyType,
      region: formData.region,
      district: formData.district,
      nightlyRate: parseFloat(formData.nightlyRate),
      currency: 'TZS',
      latitude: 0.0,
      longitude: 0.0,
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
      showSuccessAndReset('Short-term rental draft created successfully!');
    } else {
      Alert.alert('Error', data.createShortTermPropertyDraft?.message || 'Failed to create property');
    }
  };

  const showSuccessAndReset = (message: string) => {
    Alert.alert(
      'Success!',
      message + ' You can add more details and photos later.',
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
            <Text style={[styles.title, { color: textColor }]}>List a Property</Text>
            <Text style={[styles.subtitle, { color: placeholderColor }]}>
              Create a draft in seconds. Add photos later.
            </Text>
          </View>

          {/* Rental Type Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Rental Type</Text>
            <View style={styles.rentalTypeRow}>
              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  { borderColor },
                  formData.rentalType === 'LONG_TERM' && {
                    backgroundColor: tintColor,
                    borderColor: tintColor,
                  },
                ]}
                onPress={() => setFormData({ ...formData, rentalType: 'LONG_TERM' })}
              >
                <Ionicons 
                  name="home" 
                  size={20} 
                  color={formData.rentalType === 'LONG_TERM' ? '#fff' : textColor} 
                />
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
                    formData.rentalType === 'LONG_TERM' && { color: '#fff' },
                  ]}
                >
                  Monthly rent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rentalTypeButton,
                  { borderColor },
                  formData.rentalType === 'SHORT_TERM' && {
                    backgroundColor: tintColor,
                    borderColor: tintColor,
                  },
                ]}
                onPress={() => setFormData({ ...formData, rentalType: 'SHORT_TERM' })}
              >
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={formData.rentalType === 'SHORT_TERM' ? '#fff' : textColor} 
                />
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
                    formData.rentalType === 'SHORT_TERM' && { color: '#fff' },
                  ]}
                >
                  Nightly rate
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Property Title</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
              placeholder="e.g., 2 cozy bedrooms near city center"
              placeholderTextColor={placeholderColor}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Property Type</Text>
            <View style={styles.typeGrid}>
              {(formData.rentalType === 'LONG_TERM' ? PROPERTY_TYPES : SHORT_TERM_PROPERTY_TYPES).map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    { borderColor },
                    (formData.rentalType === 'LONG_TERM' 
                      ? formData.propertyType === type.value 
                      : formData.shortTermPropertyType === type.value) && {
                      backgroundColor: tintColor,
                      borderColor: tintColor,
                    },
                  ]}
                  onPress={() => {
                    if (formData.rentalType === 'LONG_TERM') {
                      setFormData({ ...formData, propertyType: type.value });
                    } else {
                      setFormData({ ...formData, shortTermPropertyType: type.value });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: textColor },
                      (formData.rentalType === 'LONG_TERM' 
                        ? formData.propertyType === type.value 
                        : formData.shortTermPropertyType === type.value) && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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

          {/* Pricing */}
          {formData.rentalType === 'LONG_TERM' ? (
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>Monthly Rent (TZS)</Text>
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
                <Text style={[styles.label, { color: textColor }]}>Nightly Rate (TZS)</Text>
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
              <Text style={[styles.label, { color: textColor }]}>Bedrooms</Text>
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
              style={styles.mediaSelectorToggle}
              onPress={() => setShowMediaSelector(!showMediaSelector)}
            >
              <Text style={[styles.label, { color: tintColor }]}>
                {showMediaSelector ? '− Hide' : '+ Add'} photos (optional)
              </Text>
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
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Draft</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>

      {/* Authentication Modals */}
      <SignInModal
        visible={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignUpPress={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />
      <SignUpModal
        visible={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSignInPress={() => {
          setShowSignUp(false);
          setShowSignIn(true);
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rentalTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rentalTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  rentalTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rentalTypeSubtext: {
    fontSize: 12,
  },
  rentalTypeTextActive: {
    color: '#fff',
  },
});
