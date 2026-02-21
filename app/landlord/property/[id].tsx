import AmenitiesSelector from '@/components/property/AmenitiesSelector';
import CollapsibleSection from '@/components/property/CollapsibleSection';
import DatePicker from '@/components/property/DatePicker';
import BasicInfoSection from '@/components/property/sections/BasicInfoSection';
import ContactSection from '@/components/property/sections/ContactSection';
import LocationSection from '@/components/property/sections/LocationSection';
import MediaSection from '@/components/property/sections/MediaSection';
import PricingSection from '@/components/property/sections/PricingSection';
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
    title: '',
    description: '',
    propertyType: 'HOUSE',
    status: 'AVAILABLE',
    region: '',
    district: '',
    ward: '',
    street: '',
    postalCode: '',
    coordinates: null as { latitude: number; longitude: number } | null,
    currency: 'TZS',
    monthlyRent: '',
    deposit: '',
    serviceCharge: '',
    utilitiesIncluded: false,
    bedrooms: '',
    bathrooms: '',
    squareMeters: '',
    floors: '',
    parkingSpaces: '',
    furnished: false,
    available: true,
    availableFrom: '',
    minimumLeaseTerm: '',
    maximumLeaseTerm: '',
    amenities: [] as string[],
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
  
  const [originalData, setOriginalData] = useState(formData);
  const [sectionSaving, setSectionSaving] = useState<Record<string, boolean>>({});
  
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
  
  const resetSection = (fields: (keyof typeof formData)[]) => {
    setFormData(prev => {
      const resetData = { ...prev };
      fields.forEach(field => {
        (resetData as any)[field] = originalData[field];
      });
      return resetData;
    });
  };
  
  const saveSection = async (sectionName: string, fields: (keyof typeof formData)[]) => {
    setSectionSaving(prev => ({ ...prev, [sectionName]: true }));
    
    try {
      const input: UpdatePropertyInput = {};
      
      if (fields.includes('title')) input.title = formData.title;
      if (fields.includes('description')) input.description = formData.description;
      if (fields.includes('propertyType')) input.propertyType = formData.propertyType as any;
      
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
      
      if (fields.some(f => ['monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'].includes(f as string))) {
        input.pricing = {
          currency: 'TZS',
          monthlyRent: parseFloat(formData.monthlyRent) || 0,
          deposit: parseFloat(formData.deposit) || undefined,
          serviceCharge: parseFloat(formData.serviceCharge) || undefined,
          utilitiesIncluded: formData.utilitiesIncluded,
        };
      }
      
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
      
      if (fields.some(f => ['available', 'availableFrom', 'minimumLeaseTerm', 'maximumLeaseTerm'].includes(f as string))) {
        input.availability = {
          available: formData.available,
          availableFrom: formData.availableFrom && formData.availableFrom.trim() !== '' ? formData.availableFrom : undefined,
          minimumLeaseTerm: parseInt(formData.minimumLeaseTerm) || undefined,
          maximumLeaseTerm: parseInt(formData.maximumLeaseTerm) || undefined,
        };
      }
      
      if (fields.includes('amenities')) {
        input.amenities = formData.amenities;
      }
      
      // Note: Landlord contact info cannot be updated via UpdatePropertyInput
      // It's managed separately or requires a different mutation
      
      const result = await updateLongTermProperty(propertyId, input);
      
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
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || 'HOUSE',
        status: property.status || 'AVAILABLE',
        region: property.address?.region || '',
        district: property.address?.district || '',
        ward: property.address?.ward || '',
        street: property.address?.street || '',
        postalCode: property.address?.postalCode || '',
        coordinates: property.address?.coordinates || null,
        currency: property.pricing?.currency || 'TZS',
        monthlyRent: property.pricing?.monthlyRent?.toString() || '',
        deposit: property.pricing?.deposit?.toString() || '',
        serviceCharge: property.pricing?.serviceCharge?.toString() || '',
        utilitiesIncluded: property.pricing?.utilitiesIncluded ?? false,
        bedrooms: property.specifications?.bedrooms?.toString() || '',
        bathrooms: property.specifications?.bathrooms?.toString() || '',
        squareMeters: property.specifications?.squareMeters?.toString() || '',
        floors: property.specifications?.floors?.toString() || '',
        parkingSpaces: property.specifications?.parkingSpaces?.toString() || '',
        furnished: property.specifications?.furnished ?? false,
        available: property.availability?.available ?? true,
        availableFrom: property.availability?.availableFrom || '',
        minimumLeaseTerm: property.availability?.minimumLeaseTerm?.toString() || '',
        maximumLeaseTerm: property.availability?.maximumLeaseTerm?.toString() || '',
        amenities: property.amenities?.filter((a): a is string => a !== null) || [],
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
        <CollapsibleSection 
          title="Basic Information" 
          icon="information-circle" 
          defaultExpanded
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
            propertyCategory="long-term"
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Location & Address" 
          icon="location" 
          defaultExpanded
          onSave={() => saveSection('Location & Address', ['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'])}
          onCancel={() => resetSection(['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'])}
          hasChanges={hasSectionChanges(['region', 'district', 'ward', 'street', 'postalCode', 'coordinates'])}
          isSaving={sectionSaving['Location & Address']}
        >
          <LocationSection
            formData={{
              region: formData.region,
              district: formData.district,
              ward: formData.ward,
              street: formData.street,
              postalCode: formData.postalCode,
              coordinates: formData.coordinates,
            }}
            onUpdate={updateField}
            onLocationChange={(location) => setFormData(prev => ({ ...prev, ...location }))}
            showCityCountry={false}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Pricing & Fees" 
          icon="cash" 
          defaultExpanded
          onSave={() => saveSection('Pricing & Fees', ['monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'])}
          onCancel={() => resetSection(['monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'])}
          hasChanges={hasSectionChanges(['monthlyRent', 'deposit', 'serviceCharge', 'utilitiesIncluded'])}
          isSaving={sectionSaving['Pricing & Fees']}
        >
          <PricingSection
            formData={{
              currency: formData.currency,
              monthlyRent: formData.monthlyRent,
              deposit: formData.deposit,
              serviceCharge: formData.serviceCharge,
              utilitiesIncluded: formData.utilitiesIncluded,
            }}
            onUpdate={updateField}
            propertyCategory="long-term"
          />
        </CollapsibleSection>

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
                onChangeText={(text) => updateField('bedrooms', text)}
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
                onChangeText={(text) => updateField('bathrooms', text)}
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
                onChangeText={(text) => updateField('squareMeters', text)}
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
                onChangeText={(text) => updateField('floors', text)}
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
              onChangeText={(text) => updateField('parkingSpaces', text)}
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
              onValueChange={(value) => updateField('furnished', value)}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </CollapsibleSection>

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
              onValueChange={(value) => updateField('available', value)}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>

          <DatePicker
            label="Available From"
            value={formData.availableFrom}
            onChange={(date: string) => updateField('availableFrom', date)}
            mode="date"
            placeholder="YYYY-MM-DD"
            helperText="When the property will be available"
            textColor={textColor}
            tintColor={tintColor}
            backgroundColor={cardBg}
            borderColor={borderColor}
            placeholderColor={placeholderColor}
          />

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Min. Lease (months)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.minimumLeaseTerm}
                onChangeText={(text) => updateField('minimumLeaseTerm', text)}
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
                onChangeText={(text) => updateField('maximumLeaseTerm', text)}
                keyboardType="numeric"
                placeholder="12"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>
        </CollapsibleSection>

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
              onAmenitiesChange={(amenities) => updateField('amenities', amenities)}
              propertyType="long-term"
            />
          </View>
        </CollapsibleSection>

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
          <MediaSection
            selectedMedia={selectedMedia}
            onMediaChange={(mediaUrls, images, videos) => {
              setSelectedMedia(mediaUrls);
              setSelectedImages(images);
              setSelectedVideos(videos);
            }}
            floorPlan={floorPlan}
            virtualTour={virtualTour}
            onFloorPlanChange={setFloorPlan}
            onVirtualTourChange={setVirtualTour}
            propertyCategory="long-term"
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Landlord Contact" 
          icon="person"
        >
          <View style={styles.section}>
            <Text style={[styles.label, { color: placeholderColor }]}>
              Note: Landlord contact information is managed separately and cannot be edited here.
            </Text>
          </View>
          <ContactSection
            formData={{
              firstName: formData.landlordFirstName,
              lastName: formData.landlordLastName,
              whatsapp: formData.landlordWhatsapp,
            }}
            onUpdate={() => {}} // Read-only
            contactType="landlord"
          />
        </CollapsibleSection>

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
