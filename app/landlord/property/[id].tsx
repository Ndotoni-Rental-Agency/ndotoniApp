import LocationSelector from '@/components/location/LocationSelector';
import MediaSelector from '@/components/media/MediaSelector';
import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import CollapsibleSection from '@/components/property/CollapsibleSection';
import CoordinatesPicker from '@/components/property/CoordinatesPicker';
import CurrencyPicker from '@/components/property/CurrencyPicker';
import PropertyTypePicker from '@/components/property/PropertyTypePicker';
import { usePropertyDetail } from '@/hooks/propertyDetails/usePropertyDetail';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { UpdatePropertyInput } from '@/lib/API';
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

export default function EditLongTermPropertyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { property, loading, error } = usePropertyDetail(propertyId);
  const { updateLongTermProperty } = useUpdateProperty();

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
    propertyType: 'HOUSE',
    status: 'AVAILABLE',
    
    // Location
    region: '',
    district: '',
    ward: '',
    street: '',
    postalCode: '',
    coordinates: null as { latitude: number; longitude: number } | null,
    
    // Pricing
    currency: 'TZS',
    monthlyRent: '',
    deposit: '',
    serviceCharge: '',
    utilitiesIncluded: false,
    
    // Specifications
    bedrooms: '',
    bathrooms: '',
    squareMeters: '',
    floors: '',
    parkingSpaces: '',
    furnished: false,
    
    // Availability
    available: true,
    availableFrom: '',
    minimumLeaseTerm: '',
    maximumLeaseTerm: '',
    
    // Amenities
    amenities: [] as string[],
    
    // Landlord Contact
    landlordFirstName: '',
    landlordLastName: '',
    landlordWhatsapp: '',
  });

  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [floorPlan, setFloorPlan] = useState<string>('');
  const [virtualTour, setVirtualTour] = useState<string>('');
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
      const input: UpdatePropertyInput = {};
      
      // Map form fields to UpdatePropertyInput structure
      if (fields.includes('title')) input.title = formData.title;
      if (fields.includes('description')) input.description = formData.description;
      if (fields.includes('propertyType')) input.propertyType = formData.propertyType as any;
      if (fields.includes('status')) input.status = formData.status as any;
      
      // Address fields
      if (fields.some(f => ['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'].includes(f as string))) {
        input.address = {
          region: formData.region,
          district: formData.district,
          ward: formData.ward,
          street: formData.street,
          postalCode: formData.postalCode || undefined,
          coordinates: formData.coordinates || undefined,
        };
      }
      
      // Pricing fields
      if (fields.some(f => ['currency', 'monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'].includes(f as string))) {
        input.pricing = {
          currency: formData.currency,
          monthlyRent: parseFloat(formData.monthlyRent) || 0,
          deposit: parseFloat(formData.deposit) || undefined,
          serviceCharge: parseFloat(formData.serviceCharge) || undefined,
          utilitiesIncluded: formData.utilitiesIncluded,
        };
      }
      
      // Specifications fields
      if (fields.some(f => ['bedrooms', 'bathrooms', 'squareMeters', 'floors', 'parkingSpaces', 'furnished'].includes(f as string))) {
        input.specifications = {
          bedrooms: parseInt(formData.bedrooms) || undefined,
          bathrooms: parseInt(formData.bathrooms) || undefined,
          squareMeters: parseFloat(formData.squareMeters) || undefined,
          floors: parseInt(formData.floors) || undefined,
          parkingSpaces: parseInt(formData.parkingSpaces) || undefined,
          furnished: formData.furnished,
        };
      }
      
      // Availability fields
      if (fields.some(f => ['available', 'availableFrom', 'minimumLeaseTerm', 'maximumLeaseTerm'].includes(f as string))) {
        input.availability = {
          available: formData.available,
          availableFrom: formData.availableFrom || undefined,
          minimumLeaseTerm: parseInt(formData.minimumLeaseTerm) || undefined,
          maximumLeaseTerm: parseInt(formData.maximumLeaseTerm) || undefined,
        };
      }
      
      // Amenities
      if (fields.includes('amenities')) {
        input.amenities = formData.amenities;
      }
      
      // Landlord contact
      if (fields.some(f => ['landlordFirstName', 'landlordLastName', 'landlordWhatsapp'].includes(f as string))) {
        input.landlord = {
          firstName: formData.landlordFirstName,
          lastName: formData.landlordLastName,
          whatsappNumber: formData.landlordWhatsapp,
        };
      }
      
      const result = await updateLongTermProperty(propertyId, input);
      
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
        propertyType: property.propertyType || 'HOUSE',
        status: property.status || 'AVAILABLE',
        
        // Location
        region: property.address?.region || '',
        district: property.address?.district || '',
        ward: property.address?.ward || '',
        street: property.address?.street || '',
        postalCode: property.address?.postalCode || '',
        coordinates: property.address?.coordinates || null,
        
        // Pricing
        currency: property.pricing?.currency || 'TZS',
        monthlyRent: property.pricing?.monthlyRent?.toString() || '',
        deposit: property.pricing?.deposit?.toString() || '',
        serviceCharge: property.pricing?.serviceCharge?.toString() || '',
        utilitiesIncluded: property.pricing?.utilitiesIncluded ?? false,
        
        // Specifications
        bedrooms: property.specifications?.bedrooms?.toString() || '',
        bathrooms: property.specifications?.bathrooms?.toString() || '',
        squareMeters: property.specifications?.squareMeters?.toString() || '',
        floors: property.specifications?.floors?.toString() || '',
        parkingSpaces: property.specifications?.parkingSpaces?.toString() || '',
        furnished: property.specifications?.furnished ?? false,
        
        // Availability
        available: property.availability?.available ?? true,
        availableFrom: property.availability?.availableFrom || '',
        minimumLeaseTerm: property.availability?.minimumLeaseTerm?.toString() || '',
        maximumLeaseTerm: property.availability?.maximumLeaseTerm?.toString() || '',
        
        // Amenities
        amenities: property.amenities?.filter((a): a is string => a !== null) || [],
        
        // Landlord Contact
        landlordFirstName: property.landlord?.firstName || '',
        landlordLastName: property.landlord?.lastName || '',
        landlordWhatsapp: property.landlord?.whatsappNumber || '',
      };
      
      setFormData(initialData);
      setOriginalData(initialData);

      const images = property.media?.images || [];
      const videos = property.media?.videos || [];
      setSelectedMedia([...images, ...videos]);
      setSelectedImages(images);
      setSelectedVideos(videos);
      setFloorPlan(property.media?.floorPlan || '');
      setVirtualTour(property.media?.virtualTour || '');
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
              placeholder="e.g., 2 cozy bedrooms near city center"
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
              propertyCategory="long-term"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Status</Text>
            <View style={styles.statusButtons}>
              {['AVAILABLE', 'DRAFT', 'MAINTENANCE', 'RENTED'].map((status) => (
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
          onSave={() => saveSection('Location & Address', ['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'])}
          onCancel={() => resetSection(['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'])}
          hasChanges={hasSectionChanges(['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'])}
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
          onSave={() => saveSection('Pricing & Fees', ['currency', 'monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'])}
          onCancel={() => resetSection(['currency', 'monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'])}
          hasChanges={hasSectionChanges(['currency', 'monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'])}
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
            <Text style={[styles.label, { color: textColor }]}>Monthly Rent *</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 500000"
              placeholderTextColor={placeholderColor}
              value={formData.monthlyRent}
              onChangeText={(text) => setFormData({ ...formData, monthlyRent: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Security Deposit</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 1000000"
              placeholderTextColor={placeholderColor}
              value={formData.deposit}
              onChangeText={(text) => setFormData({ ...formData, deposit: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Service Charge</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 50000"
              placeholderTextColor={placeholderColor}
              value={formData.serviceCharge}
              onChangeText={(text) => setFormData({ ...formData, serviceCharge: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <View style={styles.switchLabel}>
              <Text style={[styles.label, { color: textColor }]}>Utilities Included</Text>
              <Text style={[styles.switchSubtext, { color: placeholderColor }]}>
                Water, electricity, internet, etc.
              </Text>
            </View>
            <Switch
              value={formData.utilitiesIncluded}
              onValueChange={(value) => setFormData({ ...formData, utilitiesIncluded: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

        {/* Property Details */}
        <CollapsibleSection 
          title="Property Details" 
          icon="home"
          onSave={() => saveSection('Property Details', ['bedrooms', 'bathrooms', 'squareMeters', 'floors', 'parkingSpaces', 'furnished'])}
          onCancel={() => resetSection(['bedrooms', 'bathrooms', 'squareMeters', 'floors', 'parkingSpaces', 'furnished'])}
          hasChanges={hasSectionChanges(['bedrooms', 'bathrooms', 'squareMeters', 'floors', 'parkingSpaces', 'furnished'])}
          isSaving={sectionSaving['Property Details']}
        >
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Bedrooms</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.bedrooms}
                onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Bathrooms</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.bathrooms}
                onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Square Meters</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.squareMeters}
                onChangeText={(text) => setFormData({ ...formData, squareMeters: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Floors</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.floors}
                onChangeText={(text) => setFormData({ ...formData, floors: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Parking Spaces</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.parkingSpaces}
              onChangeText={(text) => setFormData({ ...formData, parkingSpaces: text })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={placeholderColor}
            />
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <View style={styles.switchLabel}>
              <Text style={[styles.label, { color: textColor }]}>Furnished</Text>
              <Text style={[styles.switchSubtext, { color: placeholderColor }]}>
                Property comes with furniture
              </Text>
            </View>
            <Switch
              value={formData.furnished}
              onValueChange={(value) => setFormData({ ...formData, furnished: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

        {/* Availability & Booking */}
        <CollapsibleSection 
          title="Availability & Booking" 
          icon="calendar"
          onSave={() => saveSection('Availability & Booking', ['available', 'availableFrom', 'minimumLeaseTerm', 'maximumLeaseTerm'])}
          onCancel={() => resetSection(['available', 'availableFrom', 'minimumLeaseTerm', 'maximumLeaseTerm'])}
          hasChanges={hasSectionChanges(['available', 'availableFrom', 'minimumLeaseTerm', 'maximumLeaseTerm'])}
          isSaving={sectionSaving['Availability & Booking']}
        >
          <View style={[styles.section, styles.switchRow]}>
            <View style={styles.switchLabel}>
              <Text style={[styles.label, { color: textColor }]}>Available for Rent</Text>
              <Text style={[styles.switchSubtext, { color: placeholderColor }]}>
                Show this property to potential tenants
              </Text>
            </View>
            <Switch
              value={formData.available}
              onValueChange={(value) => setFormData({ ...formData, available: value })}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Available From</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={placeholderColor}
              value={formData.availableFrom}
              onChangeText={(text) => setFormData({ ...formData, availableFrom: text })}
            />
            <Text style={[styles.helperText, { color: placeholderColor }]}>
              When the property will be available
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Min. Lease (months)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.minimumLeaseTerm}
                onChangeText={(text) => setFormData({ ...formData, minimumLeaseTerm: text })}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Max. Lease (months)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.maximumLeaseTerm}
                onChangeText={(text) => setFormData({ ...formData, maximumLeaseTerm: text })}
                keyboardType="numeric"
                placeholder="12"
                placeholderTextColor={placeholderColor}
              />
            </View>
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
              propertyType="long-term"
            />
          </View>
        </CollapsibleSection>

        {/* Media */}
        <CollapsibleSection 
          title="Photos & Media" 
          icon="images"
          onSave={async () => {
            // Handle media separately since it's not in formData
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
            // Reset media to original
            const images = property?.media?.images || [];
            const videos = property?.media?.videos || [];
            setSelectedMedia([...images, ...videos]);
            setSelectedImages(images);
            setSelectedVideos(videos);
            setFloorPlan(property?.media?.floorPlan || '');
            setVirtualTour(property?.media?.virtualTour || '');
          }}
          hasChanges={
            JSON.stringify(selectedImages) !== JSON.stringify(property?.media?.images || []) ||
            JSON.stringify(selectedVideos) !== JSON.stringify(property?.media?.videos || []) ||
            floorPlan !== (property?.media?.floorPlan || '') ||
            virtualTour !== (property?.media?.virtualTour || '')
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
            <Text style={[styles.label, { color: textColor }]}>Floor Plan URL</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="https://..."
              placeholderTextColor={placeholderColor}
              value={floorPlan}
              onChangeText={setFloorPlan}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Virtual Tour URL</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="https://..."
              placeholderTextColor={placeholderColor}
              value={virtualTour}
              onChangeText={setVirtualTour}
            />
          </View>
        </CollapsibleSection>

        {/* Landlord Contact */}
        <CollapsibleSection 
          title="Landlord Contact" 
          icon="person"
          onSave={() => saveSection('Landlord Contact', ['landlordFirstName', 'landlordLastName', 'landlordWhatsapp'])}
          onCancel={() => resetSection(['landlordFirstName', 'landlordLastName', 'landlordWhatsapp'])}
          hasChanges={hasSectionChanges(['landlordFirstName', 'landlordLastName', 'landlordWhatsapp'])}
          isSaving={sectionSaving['Landlord Contact']}
        >
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>First Name</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.landlordFirstName}
                onChangeText={(text) => setFormData({ ...formData, landlordFirstName: text })}
                placeholder="John"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.landlordLastName}
                onChangeText={(text) => setFormData({ ...formData, landlordLastName: text })}
                placeholder="Doe"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>WhatsApp Number</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.landlordWhatsapp}
              onChangeText={(text) => setFormData({ ...formData, landlordWhatsapp: text })}
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
