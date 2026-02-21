import LocationSelector from '@/components/location/LocationSelector';
import MediaSelector from '@/components/media/MediaSelector';
import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import CollapsibleSection from '@/components/property/CollapsibleSection';
import CoordinatesPicker from '@/components/property/CoordinatesPicker';
import CurrencyPicker from '@/components/property/CurrencyPicker';
import PropertyTypePicker from '@/components/property/PropertyTypePicker';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { UpdateShortTermPropertyInput } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditShortTermPropertyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { property, loading, error } = useShortTermPropertyDetail(propertyId);
  const { updateShortProperty } = useUpdateProperty();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    status: 'AVAILABLE',
    
    // Location
    region: '',
    district: '',
    ward: '',
    street: '',
    city: '',
    country: '',
    postalCode: '',
    coordinates: null as { latitude: number; longitude: number } | null,
    
    // Pricing
    currency: 'TZS',
    nightlyRate: '',
    cleaningFee: '',
    serviceFeePercentage: '',
    taxPercentage: '',
    
    // Guest Capacity
    maxGuests: '',
    maxAdults: '',
    maxChildren: '',
    maxInfants: '',
    
    // Booking Rules
    minimumStay: '',
    maximumStay: '',
    advanceBookingDays: '',
    instantBookEnabled: false,
    
    // Check-in/Check-out
    checkInTime: '',
    checkOutTime: '',
    checkInInstructions: '',
    
    // Policies
    cancellationPolicy: 'MODERATE',
    allowsPets: false,
    allowsSmoking: false,
    allowsChildren: true,
    allowsInfants: true,
    
    // Amenities & Rules
    amenities: [] as string[],
    houseRules: [] as string[],
    
    // Host Contact
    hostFirstName: '',
    hostLastName: '',
    hostWhatsapp: '',
  });

  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Track original data for each section
  const [originalData, setOriginalData] = useState(formData);
  const [sectionSaving, setSectionSaving] = useState<Record<string, boolean>>({});
  
  // Check if section has changes
  const hasSectionChanges = (fields: (keyof typeof formData)[]) => {
    return fields.some(field => {
      const current = formData[field];
      const original = originalData[field];
      if (Array.isArray(current) && Array.isArray(original)) {
        return JSON.stringify(current) !== JSON.stringify(original);
      }
      if (typeof current === 'object' && typeof original === 'object') {
        return JSON.stringify(current) !== JSON.stringify(original);
      }
      return current !== original;
    });
  };
  
  // Reset section to original values
  const resetSection = (fields: (keyof typeof formData)[]) => {
    const resetData = { ...formData };
    fields.forEach(field => {
      resetData[field] = originalData[field];
    });
    setFormData(resetData);
  };
  
  // Save specific section
  const saveSection = async (sectionName: string, fields: (keyof typeof formData)[]) => {
    setSectionSaving(prev => ({ ...prev, [sectionName]: true }));
    
    try {
      // Build the update input with only the changed fields
      const input: UpdateShortTermPropertyInput = {};
      
      // Map form fields to UpdateShortTermPropertyInput structure
      if (fields.includes('title')) input.title = formData.title;
      if (fields.includes('description')) input.description = formData.description;
      if (fields.includes('propertyType')) input.propertyType = formData.propertyType as any;
      if (fields.includes('status')) input.status = formData.status as any;
      
      // Address fields
      if (fields.some(f => ['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'].includes(f as string))) {
        input.address = {
          region: formData.region,
          district: formData.district,
          ward: formData.ward,
          street: formData.street,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode || undefined,
        };
        if (formData.coordinates) {
          input.coordinates = formData.coordinates;
        }
      }
      
      // Pricing fields
      if (fields.some(f => ['currency', 'nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'].includes(f as string))) {
        input.pricing = {
          currency: formData.currency,
          serviceFeePercentage: parseFloat(formData.serviceFeePercentage) || undefined,
          taxPercentage: parseFloat(formData.taxPercentage) || undefined,
        };
        if (fields.includes('nightlyRate')) input.nightlyRate = parseFloat(formData.nightlyRate) || 0;
        if (fields.includes('cleaningFee')) input.cleaningFee = parseFloat(formData.cleaningFee) || undefined;
      }
      
      // Guest capacity fields
      if (fields.some(f => ['maxGuests', 'maxAdults', 'maxChildren', 'maxInfants'].includes(f as string))) {
        if (fields.includes('maxGuests')) input.maxGuests = parseInt(formData.maxGuests) || 1;
        input.guestCapacity = {
          maxAdults: parseInt(formData.maxAdults) || undefined,
          maxChildren: parseInt(formData.maxChildren) || undefined,
          maxInfants: parseInt(formData.maxInfants) || undefined,
        };
      }
      
      // Booking rules fields
      if (fields.some(f => ['minimumStay', 'maximumStay', 'advanceBookingDays', 'instantBookEnabled'].includes(f as string))) {
        if (fields.includes('minimumStay')) input.minimumStay = parseInt(formData.minimumStay) || 1;
        if (fields.includes('instantBookEnabled')) input.instantBookEnabled = formData.instantBookEnabled;
        input.bookingRules = {
          maximumStay: parseInt(formData.maximumStay) || undefined,
          advanceBookingDays: parseInt(formData.advanceBookingDays) || undefined,
        };
      }
      
      // Check-in/Check-out fields
      if (fields.some(f => ['checkInTime', 'checkOutTime', 'checkInInstructions'].includes(f as string))) {
        input.checkIn = {
          checkInTime: formData.checkInTime || undefined,
          checkOutTime: formData.checkOutTime || undefined,
          checkInInstructions: formData.checkInInstructions || undefined,
        };
      }
      
      // Policies fields
      if (fields.some(f => ['cancellationPolicy', 'allowsPets', 'allowsSmoking', 'allowsChildren', 'allowsInfants'].includes(f as string))) {
        input.policies = {
          cancellationPolicy: formData.cancellationPolicy as any,
          allowsPets: formData.allowsPets,
          allowsSmoking: formData.allowsSmoking,
          allowsChildren: formData.allowsChildren,
          allowsInfants: formData.allowsInfants,
        };
      }
      
      // Amenities
      if (fields.includes('amenities')) {
        input.amenities = formData.amenities;
      }
      
      // Host contact
      if (fields.some(f => ['hostFirstName', 'hostLastName', 'hostWhatsapp'].includes(f as string))) {
        input.host = {
          firstName: formData.hostFirstName,
          lastName: formData.hostLastName,
          whatsappNumber: formData.hostWhatsapp,
        };
      }
      
      const result = await updateShortProperty(propertyId, input);
      
      if (result.success) {
        // Update original data after successful save
        const updatedOriginal = { ...originalData };
        fields.forEach(field => {
          updatedOriginal[field] = formData[field];
        });
        setOriginalData(updatedOriginal);
        
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      Alert.alert('Error', `Failed to save ${sectionName}`);
    } finally {
      setSectionSaving(prev => ({ ...prev, [sectionName]: false }));
    }
  };

  useEffect(() => {
    if (property) {
      const initialData = {
        // Basic Info
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || 'APARTMENT',
        status: property.status || 'AVAILABLE',
        
        // Location
        region: property.address?.region || '',
        district: property.address?.district || '',
        ward: property.address?.ward || '',
        street: property.address?.street || '',
        city: property.address?.city || '',
        country: property.address?.country || '',
        postalCode: property.address?.postalCode || '',
        coordinates: property.address?.coordinates || null,
        
        // Pricing
        currency: property.pricing?.currency || 'TZS',
        nightlyRate: property.nightlyRate?.toString() || '',
        cleaningFee: property.cleaningFee?.toString() || '',
        serviceFeePercentage: property.pricing?.serviceFeePercentage?.toString() || '',
        taxPercentage: property.pricing?.taxPercentage?.toString() || '',
        
        // Guest Capacity
        maxGuests: property.maxGuests?.toString() || '',
        maxAdults: property.guestCapacity?.maxAdults?.toString() || '',
        maxChildren: property.guestCapacity?.maxChildren?.toString() || '',
        maxInfants: property.guestCapacity?.maxInfants?.toString() || '',
        
        // Booking Rules
        minimumStay: property.minimumStay?.toString() || '',
        maximumStay: property.bookingRules?.maximumStay?.toString() || '',
        advanceBookingDays: property.bookingRules?.advanceBookingDays?.toString() || '',
        instantBookEnabled: property.instantBookEnabled ?? false,
        
        // Check-in/Check-out
        checkInTime: property.checkIn?.checkInTime || '',
        checkOutTime: property.checkIn?.checkOutTime || '',
        checkInInstructions: property.checkIn?.checkInInstructions || '',
        
        // Policies
        cancellationPolicy: property.policies?.cancellationPolicy || 'MODERATE',
        allowsPets: property.policies?.allowsPets ?? false,
        allowsSmoking: property.policies?.allowsSmoking ?? false,
        allowsChildren: property.policies?.allowsChildren ?? true,
        allowsInfants: property.policies?.allowsInfants ?? true,
        
        // Amenities & Rules
        amenities: property.amenities?.filter((a): a is string => a !== null) || [],
        houseRules: property.houseRules?.filter((r): r is string => r !== null) || [],
        
        // Host Contact
        hostFirstName: property.host?.firstName || '',
        hostLastName: property.host?.lastName || '',
        hostWhatsapp: property.host?.whatsappNumber || '',
      };
      
      setFormData(initialData);
      setOriginalData(initialData);

      const images = property.images || [];
      const videos = property.videos || [];
      setSelectedMedia([...images, ...videos]);
      setSelectedImages(images);
      setSelectedVideos(videos);
      setThumbnail(property.thumbnail || '');
    }
  }, [property]);

  const handleSave = async () => {
    Alert.alert('Save Changes', 'Property update functionality coming soon!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete', 'Property deletion functionality coming soon!');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={[styles.errorText, { color: textColor }]}>{error || 'Property not found'}</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Property</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : (
            <Ionicons name="checkmark" size={24} color={tintColor} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <CollapsibleSection 
          title="Basic Information" 
          icon="information-circle" 
          defaultExpanded
          onSave={() => saveSection('Basic Information', ['title', 'description', 'propertyType', 'status'])}
          onCancel={() => resetSection(['title', 'description', 'propertyType', 'status'])}
          hasChanges={hasSectionChanges(['title', 'description', 'propertyType', 'status'])}
          isSaving={sectionSaving['Basic Information']}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Property Title *</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., Cozy beachfront villa"
              placeholderTextColor={placeholderColor}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="Describe your property..."
              placeholderTextColor={placeholderColor}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Property Type *</Text>
            <PropertyTypePicker
              value={formData.propertyType}
              onChange={(type) => setFormData({ ...formData, propertyType: type })}
              propertyCategory="short-term"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Status</Text>
            <View style={styles.statusButtons}>
              {['AVAILABLE', 'DRAFT', 'MAINTENANCE', 'BOOKED'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    { borderColor },
                    formData.status === status && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setFormData({ ...formData, status })}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      { color: textColor },
                      formData.status === status && { color: '#fff' },
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </CollapsibleSection>

        {/* Location & Address */}
        <CollapsibleSection 
          title="Location & Address" 
          icon="location" 
          defaultExpanded
          onSave={() => saveSection('Location & Address', ['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'])}
          onCancel={() => resetSection(['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'])}
          hasChanges={hasSectionChanges(['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'])}
          isSaving={sectionSaving['Location & Address']}
        >
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

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>City</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                placeholder="e.g., Dar es Salaam"
                placeholderTextColor={placeholderColor}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Country</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                placeholder="e.g., Tanzania"
                placeholderTextColor={placeholderColor}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Postal Code</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 12345"
              placeholderTextColor={placeholderColor}
              value={formData.postalCode}
              onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>GPS Coordinates</Text>
            <CoordinatesPicker
              value={formData.coordinates}
              onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
            />
          </View>
        </CollapsibleSection>

        {/* Pricing & Fees */}
        <CollapsibleSection 
          title="Pricing & Fees" 
          icon="cash" 
          defaultExpanded
          onSave={() => saveSection('Pricing & Fees', ['currency', 'nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'])}
          onCancel={() => resetSection(['currency', 'nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'])}
          hasChanges={hasSectionChanges(['currency', 'nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'])}
          isSaving={sectionSaving['Pricing & Fees']}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Currency *</Text>
            <CurrencyPicker
              value={formData.currency}
              onChange={(currency) => setFormData({ ...formData, currency })}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Nightly Rate *</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 50000"
              placeholderTextColor={placeholderColor}
              value={formData.nightlyRate}
              onChangeText={(text) => setFormData({ ...formData, nightlyRate: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Cleaning Fee</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 20000"
              placeholderTextColor={placeholderColor}
              value={formData.cleaningFee}
              onChangeText={(text) => setFormData({ ...formData, cleaningFee: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Service Fee (%)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.serviceFeePercentage}
                onChangeText={(text) => setFormData({ ...formData, serviceFeePercentage: text })}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Tax (%)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.taxPercentage}
                onChangeText={(text) => setFormData({ ...formData, taxPercentage: text })}
                keyboardType="numeric"
                placeholder="18"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>
        </CollapsibleSection>

        {/* Guest Capacity */}
        <CollapsibleSection 
          title="Guest Capacity" 
          icon="people"
          onSave={() => saveSection('Guest Capacity', ['maxGuests', 'maxAdults', 'maxChildren', 'maxInfants'])}
          onCancel={() => resetSection(['maxGuests', 'maxAdults', 'maxChildren', 'maxInfants'])}
          hasChanges={hasSectionChanges(['maxGuests', 'maxAdults', 'maxChildren', 'maxInfants'])}
          isSaving={sectionSaving['Guest Capacity']}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Maximum Guests *</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.maxGuests}
              onChangeText={(text) => setFormData({ ...formData, maxGuests: text })}
              keyboardType="numeric"
              placeholder="4"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Max Adults</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.maxAdults}
                onChangeText={(text) => setFormData({ ...formData, maxAdults: text })}
                keyboardType="numeric"
                placeholder="2"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Max Children</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.maxChildren}
                onChangeText={(text) => setFormData({ ...formData, maxChildren: text })}
                keyboardType="numeric"
                placeholder="2"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Max Infants</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.maxInfants}
              onChangeText={(text) => setFormData({ ...formData, maxInfants: text })}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor={placeholderColor}
            />
          </View>
        </CollapsibleSection>

        {/* Booking Rules */}
        <CollapsibleSection 
          title="Booking Rules" 
          icon="calendar"
          onSave={() => saveSection('Booking Rules', ['minimumStay', 'maximumStay', 'advanceBookingDays', 'instantBookEnabled'])}
          onCancel={() => resetSection(['minimumStay', 'maximumStay', 'advanceBookingDays', 'instantBookEnabled'])}
          hasChanges={hasSectionChanges(['minimumStay', 'maximumStay', 'advanceBookingDays', 'instantBookEnabled'])}
          isSaving={sectionSaving['Booking Rules']}
        >
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Min. Stay (nights) *</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.minimumStay}
                onChangeText={(text) => setFormData({ ...formData, minimumStay: text })}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Max. Stay (nights)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.maximumStay}
                onChangeText={(text) => setFormData({ ...formData, maximumStay: text })}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Advance Booking (days)</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.advanceBookingDays}
              onChangeText={(text) => setFormData({ ...formData, advanceBookingDays: text })}
              keyboardType="numeric"
              placeholder="365"
              placeholderTextColor={placeholderColor}
            />
            <Text style={[styles.helperText, { color: placeholderColor }]}>
              How far in advance guests can book
            </Text>
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <View style={styles.switchLabel}>
              <Text style={[styles.label, { color: textColor }]}>Instant Book</Text>
              <Text style={[styles.switchSubtext, { color: placeholderColor }]}>
                Allow guests to book without approval
              </Text>
            </View>
            <Switch
              value={formData.instantBookEnabled}
              onValueChange={(value) => setFormData({ ...formData, instantBookEnabled: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

        {/* Check-in & Check-out */}
        <CollapsibleSection 
          title="Check-in & Check-out" 
          icon="time"
          onSave={() => saveSection('Check-in & Check-out', ['checkInTime', 'checkOutTime', 'checkInInstructions'])}
          onCancel={() => resetSection(['checkInTime', 'checkOutTime', 'checkInInstructions'])}
          hasChanges={hasSectionChanges(['checkInTime', 'checkOutTime', 'checkInInstructions'])}
          isSaving={sectionSaving['Check-in & Check-out']}
        >
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Check-in Time</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.checkInTime}
                onChangeText={(text) => setFormData({ ...formData, checkInTime: text })}
                placeholder="14:00"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Check-out Time</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.checkOutTime}
                onChangeText={(text) => setFormData({ ...formData, checkOutTime: text })}
                placeholder="11:00"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Check-in Instructions</Text>
            <TextInput
              style={[styles.textArea, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="Provide instructions for guests..."
              placeholderTextColor={placeholderColor}
              value={formData.checkInInstructions}
              onChangeText={(text) => setFormData({ ...formData, checkInInstructions: text })}
              multiline
              numberOfLines={3}
            />
          </View>
        </CollapsibleSection>

        {/* Policies */}
        <CollapsibleSection 
          title="Policies & Rules" 
          icon="document-text"
          onSave={() => saveSection('Policies & Rules', ['cancellationPolicy', 'allowsPets', 'allowsSmoking', 'allowsChildren', 'allowsInfants'])}
          onCancel={() => resetSection(['cancellationPolicy', 'allowsPets', 'allowsSmoking', 'allowsChildren', 'allowsInfants'])}
          hasChanges={hasSectionChanges(['cancellationPolicy', 'allowsPets', 'allowsSmoking', 'allowsChildren', 'allowsInfants'])}
          isSaving={sectionSaving['Policies & Rules']}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Cancellation Policy</Text>
            <View style={styles.statusButtons}>
              {['FLEXIBLE', 'MODERATE', 'STRICT'].map((policy) => (
                <TouchableOpacity
                  key={policy}
                  style={[
                    styles.statusButton,
                    { borderColor },
                    formData.cancellationPolicy === policy && { backgroundColor: tintColor, borderColor: tintColor },
                  ]}
                  onPress={() => setFormData({ ...formData, cancellationPolicy: policy })}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      { color: textColor },
                      formData.cancellationPolicy === policy && { color: '#fff' },
                    ]}
                  >
                    {policy}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Pets</Text>
            <Switch
              value={formData.allowsPets}
              onValueChange={(value) => setFormData({ ...formData, allowsPets: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Smoking</Text>
            <Switch
              value={formData.allowsSmoking}
              onValueChange={(value) => setFormData({ ...formData, allowsSmoking: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Children</Text>
            <Switch
              value={formData.allowsChildren}
              onValueChange={(value) => setFormData({ ...formData, allowsChildren: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Infants</Text>
            <Switch
              value={formData.allowsInfants}
              onValueChange={(value) => setFormData({ ...formData, allowsInfants: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

        {/* Amenities */}
        <CollapsibleSection 
          title="Amenities & Features" 
          icon="checkmark-done"
          onSave={() => saveSection('Amenities & Features', ['amenities'])}
          onCancel={() => resetSection(['amenities'])}
          hasChanges={hasSectionChanges(['amenities'])}
          isSaving={sectionSaving['Amenities & Features']}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Select Amenities</Text>
            <AmenitiesSelector
              selectedAmenities={formData.amenities}
              onAmenitiesChange={(amenities) => setFormData({ ...formData, amenities })}
              propertyType="short-term"
            />
          </View>
        </CollapsibleSection>

        {/* Media */}
        <CollapsibleSection 
          title="Photos & Media" 
          icon="images"
          onSave={async () => {
            setSectionSaving(prev => ({ ...prev, 'Photos & Media': true }));
            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('Success', 'Photos & Media saved successfully!');
            } catch (err) {
              Alert.alert('Error', 'Failed to save Photos & Media');
            } finally {
              setSectionSaving(prev => ({ ...prev, 'Photos & Media': false }));
            }
          }}
          onCancel={() => {
            const images = property?.images || [];
            const videos = property?.videos || [];
            setSelectedMedia([...images, ...videos]);
            setSelectedImages(images);
            setSelectedVideos(videos);
            setThumbnail(property?.thumbnail || '');
          }}
          hasChanges={
            JSON.stringify(selectedImages) !== JSON.stringify(property?.images || []) ||
            JSON.stringify(selectedVideos) !== JSON.stringify(property?.videos || []) ||
            thumbnail !== (property?.thumbnail || '')
          }
          isSaving={sectionSaving['Photos & Media']}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Property Photos & Videos</Text>
            <MediaSelector
              selectedMedia={selectedMedia}
              onMediaChange={(mediaUrls, images, videos) => {
                setSelectedMedia(mediaUrls);
                setSelectedImages(images);
                setSelectedVideos(videos);
              }}
              maxSelection={10}
              onAuthRequired={() => {}}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Thumbnail URL</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="https://..."
              placeholderTextColor={placeholderColor}
              value={thumbnail}
              onChangeText={setThumbnail}
            />
            <Text style={[styles.helperText, { color: placeholderColor }]}>
              Main image shown in listings
            </Text>
          </View>
        </CollapsibleSection>

        {/* Host Contact */}
        <CollapsibleSection 
          title="Host Contact" 
          icon="person"
          onSave={() => saveSection('Host Contact', ['hostFirstName', 'hostLastName', 'hostWhatsapp'])}
          onCancel={() => resetSection(['hostFirstName', 'hostLastName', 'hostWhatsapp'])}
          hasChanges={hasSectionChanges(['hostFirstName', 'hostLastName', 'hostWhatsapp'])}
          isSaving={sectionSaving['Host Contact']}
        >
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>First Name</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.hostFirstName}
                onChangeText={(text) => setFormData({ ...formData, hostFirstName: text })}
                placeholder="John"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.hostLastName}
                onChangeText={(text) => setFormData({ ...formData, hostLastName: text })}
                placeholder="Doe"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>WhatsApp Number</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.hostWhatsapp}
              onChangeText={(text) => setFormData({ ...formData, hostWhatsapp: text })}
              placeholder="+255..."
              placeholderTextColor={placeholderColor}
              keyboardType="phone-pad"
            />
          </View>
        </CollapsibleSection>

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: '#ef4444' }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Property</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
  },
  switchSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
