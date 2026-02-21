import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  propertyType?: 'long-term' | 'short-term';
}

const LONG_TERM_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: 'wifi' },
  { id: 'parking', label: 'Parking', icon: 'car' },
  { id: 'security', label: '24/7 Security', icon: 'shield-checkmark' },
  { id: 'generator', label: 'Generator', icon: 'flash' },
  { id: 'water', label: 'Water Supply', icon: 'water' },
  { id: 'garden', label: 'Garden', icon: 'leaf' },
  { id: 'balcony', label: 'Balcony', icon: 'home' },
  { id: 'gym', label: 'Gym', icon: 'barbell' },
  { id: 'pool', label: 'Swimming Pool', icon: 'water' },
  { id: 'elevator', label: 'Elevator', icon: 'arrow-up' },
  { id: 'ac', label: 'Air Conditioning', icon: 'snow' },
  { id: 'heating', label: 'Heating', icon: 'flame' },
  { id: 'laundry', label: 'Laundry', icon: 'shirt' },
  { id: 'kitchen', label: 'Kitchen', icon: 'restaurant' },
  { id: 'furnished', label: 'Furnished', icon: 'bed' },
];

const SHORT_TERM_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: 'wifi' },
  { id: 'tv', label: 'TV', icon: 'tv' },
  { id: 'kitchen', label: 'Kitchen', icon: 'restaurant' },
  { id: 'washer', label: 'Washer', icon: 'shirt' },
  { id: 'dryer', label: 'Dryer', icon: 'shirt-outline' },
  { id: 'ac', label: 'Air Conditioning', icon: 'snow' },
  { id: 'heating', label: 'Heating', icon: 'flame' },
  { id: 'workspace', label: 'Dedicated Workspace', icon: 'desktop' },
  { id: 'pool', label: 'Pool', icon: 'water' },
  { id: 'hot_tub', label: 'Hot Tub', icon: 'water' },
  { id: 'gym', label: 'Gym', icon: 'barbell' },
  { id: 'parking', label: 'Free Parking', icon: 'car' },
  { id: 'ev_charger', label: 'EV Charger', icon: 'flash' },
  { id: 'crib', label: 'Crib', icon: 'bed-outline' },
  { id: 'bbq', label: 'BBQ Grill', icon: 'flame' },
  { id: 'outdoor_dining', label: 'Outdoor Dining', icon: 'restaurant-outline' },
  { id: 'fire_pit', label: 'Fire Pit', icon: 'bonfire' },
  { id: 'piano', label: 'Piano', icon: 'musical-notes' },
  { id: 'fireplace', label: 'Fireplace', icon: 'flame-outline' },
  { id: 'security', label: 'Security Cameras', icon: 'videocam' },
  { id: 'smoke_alarm', label: 'Smoke Alarm', icon: 'alert-circle' },
  { id: 'first_aid', label: 'First Aid Kit', icon: 'medical' },
  { id: 'fire_extinguisher', label: 'Fire Extinguisher', icon: 'flame-outline' },
];

export default function AmenitiesSelector({
  selectedAmenities,
  onAmenitiesChange,
  propertyType = 'long-term',
}: AmenitiesSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const inputBg = useThemeColor({ light: '#f9fafb', dark: '#111827' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const amenities = propertyType === 'short-term' ? SHORT_TERM_AMENITIES : LONG_TERM_AMENITIES;

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter an amenity name');
      return;
    }
    
    // Check if it already exists (case-insensitive)
    const exists = selectedAmenities.some(
      a => a.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) {
      Alert.alert('Error', 'This amenity is already added');
      return;
    }
    
    onAmenitiesChange([...selectedAmenities, trimmed]);
    setCustomAmenity('');
  };

  const removeCustomAmenity = (amenity: string) => {
    onAmenitiesChange(selectedAmenities.filter(id => id !== amenity));
  };

  const isCustomAmenity = (amenityId: string) => {
    return !amenities.some(a => a.id === amenityId);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: cardBg, borderColor }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="checkmark-done" size={20} color={tintColor} />
          <Text style={[styles.selectorText, { color: textColor }]}>
            {selectedAmenities.length === 0
              ? 'Select amenities'
              : `${selectedAmenities.length} amenities selected`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </TouchableOpacity>

      {selectedAmenities.length > 0 && (
        <View style={styles.selectedContainer}>
          {selectedAmenities.map(amenityId => {
            const amenity = amenities.find(a => a.id === amenityId);
            const isCustom = isCustomAmenity(amenityId);
            
            return (
              <View key={amenityId} style={[styles.chip, { backgroundColor: `${tintColor}20`, borderColor: tintColor }]}>
                <Ionicons 
                  name={amenity?.icon as any || 'add-circle'} 
                  size={14} 
                  color={tintColor} 
                />
                <Text style={[styles.chipText, { color: tintColor }]}>
                  {amenity?.label || amenityId}
                </Text>
                {isCustom && (
                  <TouchableOpacity onPress={() => removeCustomAmenity(amenityId)}>
                    <Ionicons name="close-circle" size={16} color={tintColor} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Amenities</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Custom Amenity Input */}
            <View style={[styles.customSection, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.customTitle, { color: textColor }]}>Add Custom Amenity</Text>
              <View style={styles.customInputContainer}>
                <TextInput
                  style={[styles.customInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="e.g., Rooftop Terrace"
                  placeholderTextColor={placeholderColor}
                  value={customAmenity}
                  onChangeText={setCustomAmenity}
                  onSubmitEditing={addCustomAmenity}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: tintColor }]}
                  onPress={addCustomAmenity}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Standard Amenities */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Standard Amenities</Text>
            {amenities.map(amenity => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityItem,
                    { backgroundColor: cardBg, borderColor },
                    isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                >
                  <View style={styles.amenityInfo}>
                    <Ionicons
                      name={amenity.icon as any}
                      size={24}
                      color={isSelected ? tintColor : textColor}
                    />
                    <Text style={[styles.amenityLabel, { color: textColor }]}>{amenity.label}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={tintColor} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  amenityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  amenityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  customSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
