import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import CollapsibleSection from '@/components/property/CollapsibleSection';
import DatePicker from '@/components/property/DatePicker';
import BasicInfoSection from '@/components/property/sections/BasicInfoSection';
import ContactSection from '@/components/property/sections/ContactSection';
import LocationSection from '@/components/property/sections/LocationSection';
import MediaSection from '@/components/property/sections/MediaSection';
import PricingSection from '@/components/property/sections/PricingSection';
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
  
  // Track original data for each section
  const [originalData, setOriginalData] = useState(formData);
  const [originalMedia, setOriginalMedia] = useState<{
    images: string[];
    videos: string[];
    thumbnail: string;
  }>({ images: [], videos: [], thumbnail: '' });
  
  const [sectionSaving, setSectionSaving] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>('Basic Information');
  
  const handleToggleSection = (sectionTitle: string) => {
    setExpandedSection(prev => prev === sectionTitle ? null : sectionTitle);
  };
  
  const hasMediaChanges = () => {
    const imagesChanged = JSON.stringify(selectedImages.sort()) !== JSON.stringify(originalMedia.images.sort());
    const videosChanged = JSON.stringify(selectedVideos.sort()) !== JSON.stringify(originalMedia.videos.sort());
    const thumbnailChanged = thumbnail !== originalMedia.thumbnail;
    return imagesChanged || videosChanged || thumbnailChanged;
  };
  
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
    setFormData(prev => {
      const resetData = { ...prev };
      fields.forEach(field => {
        (resetData as any)[field] = originalData[field];
      });
      return resetData;
    });
  };
  
  // Save specific section
  const saveSection = async (sectionName: string, fields: (keyof typeof formData)[]) => {
    setSectionSaving(prev => ({ ...prev, [sectionName]: true }));
    
    try {
      const input: UpdateShortTermPropertyInput = {};
      
      if (fields.includes('title')) input.title = formData.title;
      if (fields.includes('description')) input.description = formData.description;
      if (fields.includes('propertyType')) input.propertyType = formData.propertyType as any;
      
      if (fields.some(f => ['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'].includes(f as string))) {
        if (fields.includes('region')) input.region = formData.region;
        if (fields.includes('district')) input.district = formData.district;
        if (formData.coordinates) {
          input.coordinates = formData.coordinates;
        }
      }
      
      if (fields.some(f => ['nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'].includes(f as string))) {
        if (fields.includes('nightlyRate')) input.nightlyRate = parseFloat(formData.nightlyRate) || 0;
        if (fields.includes('cleaningFee')) input.cleaningFee = parseFloat(formData.cleaningFee) || undefined;
        if (fields.includes('serviceFeePercentage')) input.serviceFeePercentage = parseFloat(formData.serviceFeePercentage) || undefined;
        if (fields.includes('taxPercentage')) input.taxPercentage = parseFloat(formData.taxPercentage) || undefined;
        input.currency = 'TZS';
      }
      
      if (fields.some(f => ['maxGuests', 'maxAdults', 'maxChildren', 'maxInfants'].includes(f as string))) {
        if (fields.includes('maxGuests')) input.maxGuests = parseInt(formData.maxGuests) || 1;
        if (fields.includes('maxAdults')) input.maxAdults = parseInt(formData.maxAdults) || undefined;
        if (fields.includes('maxChildren')) input.maxChildren = parseInt(formData.maxChildren) || undefined;
        if (fields.includes('maxInfants')) input.maxInfants = parseInt(formData.maxInfants) || undefined;
      }
      
      if (fields.some(f => ['minimumStay', 'maximumStay', 'advanceBookingDays', 'instantBookEnabled'].includes(f as string))) {
        if (fields.includes('minimumStay')) input.minimumStay = parseInt(formData.minimumStay) || 1;
        if (fields.includes('maximumStay')) input.maximumStay = parseInt(formData.maximumStay) || undefined;
        if (fields.includes('advanceBookingDays')) input.advanceBookingDays = parseInt(formData.advanceBookingDays) || undefined;
        if (fields.includes('instantBookEnabled')) input.instantBookEnabled = formData.instantBookEnabled;
      }
      
      if (fields.some(f => ['checkInTime', 'checkOutTime', 'checkInInstructions'].includes(f as string))) {
        if (fields.includes('checkInTime')) input.checkInTime = formData.checkInTime && formData.checkInTime.trim() !== '' ? formData.checkInTime : undefined;
        if (fields.includes('checkOutTime')) input.checkOutTime = formData.checkOutTime && formData.checkOutTime.trim() !== '' ? formData.checkOutTime : undefined;
        if (fields.includes('checkInInstructions')) input.checkInInstructions = formData.checkInInstructions && formData.checkInInstructions.trim() !== '' ? formData.checkInInstructions : undefined;
      }
      
      if (fields.some(f => ['cancellationPolicy', 'allowsPets', 'allowsSmoking', 'allowsChildren', 'allowsInfants'].includes(f as string))) {
        if (fields.includes('cancellationPolicy')) input.cancellationPolicy = formData.cancellationPolicy as any;
        if (fields.includes('allowsPets')) input.allowsPets = formData.allowsPets;
        if (fields.includes('allowsSmoking')) input.allowsSmoking = formData.allowsSmoking;
        if (fields.includes('allowsChildren')) input.allowsChildren = formData.allowsChildren;
        if (fields.includes('allowsInfants')) input.allowsInfants = formData.allowsInfants;
      }
      
      if (fields.includes('amenities')) {
        input.amenities = formData.amenities;
      }
      
      // Note: Host contact info cannot be updated via UpdateShortTermPropertyInput
      // It's managed separately or requires a different mutation
      
      const result = await updateShortProperty(propertyId, input);
      
      if (result.success) {
        const updatedOriginal = { ...originalData };
        fields.forEach(field => {
          (updatedOriginal as any)[field] = formData[field];
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
        region: property.region || '',
        district: property.district || '',
        ward: '', // Not in ShortTermProperty type
        street: property.address?.street || '',
        city: property.address?.city || '',
        country: property.address?.country || '',
        postalCode: property.address?.postalCode || '',
        coordinates: property.coordinates || null,
        
        // Pricing
        currency: property.currency || 'TZS',
        nightlyRate: property.nightlyRate?.toString() || '',
        cleaningFee: property.cleaningFee?.toString() || '',
        serviceFeePercentage: property.serviceFeePercentage?.toString() || '',
        taxPercentage: property.taxPercentage?.toString() || '',
        
        // Guest Capacity
        maxGuests: property.maxGuests?.toString() || '',
        maxAdults: property.maxAdults?.toString() || '',
        maxChildren: property.maxChildren?.toString() || '',
        maxInfants: property.maxInfants?.toString() || '',
        
        // Booking Rules
        minimumStay: property.minimumStay?.toString() || '',
        maximumStay: property.maximumStay?.toString() || '',
        advanceBookingDays: property.advanceBookingDays?.toString() || '',
        instantBookEnabled: property.instantBookEnabled ?? false,
        
        // Check-in/Check-out
        checkInTime: property.checkInTime || '',
        checkOutTime: property.checkOutTime || '',
        checkInInstructions: property.checkInInstructions || '',
        
        // Policies
        cancellationPolicy: property.cancellationPolicy || 'MODERATE',
        allowsPets: property.allowsPets ?? false,
        allowsSmoking: property.allowsSmoking ?? false,
        allowsChildren: property.allowsChildren ?? true,
        allowsInfants: property.allowsInfants ?? true,
        
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
      const videos: string[] = []; // ShortTermProperty doesn't have videos field
      setSelectedMedia([...images]);
      setSelectedImages(images);
      setSelectedVideos(videos);
      setThumbnail(property.thumbnail || '');
      
      setOriginalMedia({
        images,
        videos,
        thumbnail: property.thumbnail || '',
      });
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
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
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
      <View style={[styles.titleContainer, { backgroundColor: cardBg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Ionicons name="arrow-back" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: textColor }]}>Edit Property</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <CollapsibleSection 
          title="Basic Information" 
          icon="information-circle" 
          expanded={expandedSection === 'Basic Information'}
          onToggle={handleToggleSection}
          onSave={() => saveSection('Basic Information', ['title', 'description', 'propertyType'])}
          onCancel={() => resetSection(['title', 'description', 'propertyType'])}
          hasChanges={hasSectionChanges(['title', 'description', 'propertyType'])}
          isSaving={sectionSaving['Basic Information']}
        >
          <BasicInfoSection
            formData={{
              title: formData.title,
              description: formData.description,
              propertyType: formData.propertyType,
            }}
            onUpdate={updateField}
            propertyCategory="short-term"
          />
        </CollapsibleSection>

        {/* Location & Address */}
        <CollapsibleSection 
          title="Location & Address" 
          icon="location" 
          expanded={expandedSection === 'Location & Address'}
          onToggle={handleToggleSection}
          onSave={() => saveSection('Location & Address', ['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'])}
          onCancel={() => resetSection(['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'])}
          hasChanges={hasSectionChanges(['region', 'district', 'ward', 'street', 'city', 'country', 'postalCode', 'coordinates'])}
          isSaving={sectionSaving['Location & Address']}
        >
          <LocationSection
            formData={{
              region: formData.region,
              district: formData.district,
              ward: formData.ward,
              street: formData.street,
              city: formData.city,
              country: formData.country,
              postalCode: formData.postalCode,
              coordinates: formData.coordinates,
            }}
            onUpdate={updateField}
            onLocationChange={(location: any) => setFormData(prev => ({ ...prev, ...location }))}
            showCityCountry={true}
          />
        </CollapsibleSection>

        {/* Pricing & Fees */}
        <CollapsibleSection 
          title="Pricing & Fees" 
          icon="cash" 
          expanded={expandedSection === 'Pricing & Fees'}
          onToggle={handleToggleSection}
          onSave={() => saveSection('Pricing & Fees', ['nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'])}
          onCancel={() => resetSection(['nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'])}
          hasChanges={hasSectionChanges(['nightlyRate', 'cleaningFee', 'serviceFeePercentage', 'taxPercentage'])}
          isSaving={sectionSaving['Pricing & Fees']}
        >
          <PricingSection
            formData={{
              currency: formData.currency,
              nightlyRate: formData.nightlyRate,
              cleaningFee: formData.cleaningFee,
              serviceFeePercentage: formData.serviceFeePercentage,
              taxPercentage: formData.taxPercentage,
            }}
            onUpdate={updateField}
            propertyCategory="short-term"
          />
        </CollapsibleSection>

        {/* Guest Capacity */}
        <CollapsibleSection 
          title="Guest Capacity" 
          icon="people"
          expanded={expandedSection === 'Guest Capacity'}
          onToggle={handleToggleSection}
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
          expanded={expandedSection === 'Booking Rules'}
          onToggle={handleToggleSection}
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
              trackColor={{ false: '#d1d5db', true: tintColor }}
              ios_backgroundColor="#d1d5db"
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

        {/* Check-in & Check-out */}
        <CollapsibleSection 
          title="Check-in & Check-out" 
          icon="time"
          expanded={expandedSection === 'Check-in & Check-out'}
          onToggle={handleToggleSection}
          onSave={() => saveSection('Check-in & Check-out', ['checkInTime', 'checkOutTime', 'checkInInstructions'])}
          onCancel={() => resetSection(['checkInTime', 'checkOutTime', 'checkInInstructions'])}
          hasChanges={hasSectionChanges(['checkInTime', 'checkOutTime', 'checkInInstructions'])}
          isSaving={sectionSaving['Check-in & Check-out']}
        >
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <DatePicker
                label="Check-in Time"
                value={formData.checkInTime}
                onChange={(time: string) => setFormData({ ...formData, checkInTime: time })}
                mode="time"
                placeholder="14:00"
                textColor={textColor}
                tintColor={tintColor}
                backgroundColor={cardBg}
                borderColor={borderColor}
                placeholderColor={placeholderColor}
              />
            </View>

            <View style={styles.halfWidth}>
              <DatePicker
                label="Check-out Time"
                value={formData.checkOutTime}
                onChange={(time: string) => setFormData({ ...formData, checkOutTime: time })}
                mode="time"
                placeholder="11:00"
                textColor={textColor}
                tintColor={tintColor}
                backgroundColor={cardBg}
                borderColor={borderColor}
                placeholderColor={placeholderColor}
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
          expanded={expandedSection === 'Policies & Rules'}
          onToggle={handleToggleSection}
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
              trackColor={{ false: '#d1d5db', true: tintColor }}
              ios_backgroundColor="#d1d5db"
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Smoking</Text>
            <Switch
              value={formData.allowsSmoking}
              onValueChange={(value) => setFormData({ ...formData, allowsSmoking: value })}
              trackColor={{ false: '#d1d5db', true: tintColor }}
              ios_backgroundColor="#d1d5db"
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Children</Text>
            <Switch
              value={formData.allowsChildren}
              onValueChange={(value) => setFormData({ ...formData, allowsChildren: value })}
              trackColor={{ false: '#d1d5db', true: tintColor }}
              ios_backgroundColor="#d1d5db"
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <Text style={[styles.label, { color: textColor }]}>Allows Infants</Text>
            <Switch
              value={formData.allowsInfants}
              onValueChange={(value) => setFormData({ ...formData, allowsInfants: value })}
              trackColor={{ false: '#d1d5db', true: tintColor }}
              ios_backgroundColor="#d1d5db"
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

        {/* Amenities */}
        <CollapsibleSection 
          title="Amenities & Features" 
          icon="checkmark-done"
          expanded={expandedSection === 'Amenities & Features'}
          onToggle={handleToggleSection}
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
          expanded={expandedSection === 'Photos & Media'}
          onToggle={handleToggleSection}
          hasChanges={hasMediaChanges()}
          isSaving={sectionSaving['Photos & Media']}
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
            const videos: string[] = [];
            setSelectedMedia([...images]);
            setSelectedImages(images);
            setSelectedVideos(videos);
            setThumbnail(property?.thumbnail || '');
          }}
        >
          <MediaSection
            selectedMedia={selectedMedia}
            onMediaChange={(mediaUrls: string[], images: string[], videos: string[]) => {
              setSelectedMedia(mediaUrls);
              setSelectedImages(images);
              setSelectedVideos(videos);
            }}
            thumbnail={thumbnail}
            onThumbnailChange={setThumbnail}
            propertyCategory="short-term"
          />
        </CollapsibleSection>

        {/* Host Contact */}
        <CollapsibleSection 
          title="Host Contact" 
          icon="person"
          expanded={expandedSection === 'Host Contact'}
          onToggle={handleToggleSection}
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: placeholderColor }]}>
              Note: Host contact information is managed separately and cannot be edited here.
            </Text>
          </View>
          <ContactSection
            formData={{
              firstName: formData.hostFirstName,
              lastName: formData.hostLastName,
              whatsapp: formData.hostWhatsapp,
            }}
            onUpdate={() => {}} // Read-only
            contactType="host"
          />
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backArrow: {
    padding: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
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
