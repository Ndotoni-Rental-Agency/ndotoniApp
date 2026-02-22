import { useThemeColor } from '@/hooks/use-theme-color';
import { PropertyType, ShortTermPropertyType } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropertyTypePickerProps {
  value: string;
  onChange: (type: string) => void;
  propertyCategory: 'long-term' | 'short-term';
}

const LONG_TERM_TYPES = [
  { value: PropertyType.APARTMENT, label: 'Apartment', icon: 'business' },
  { value: PropertyType.HOUSE, label: 'House', icon: 'home' },
  { value: PropertyType.STUDIO, label: 'Studio', icon: 'cube' },
  { value: PropertyType.ROOM, label: 'Room', icon: 'bed' },
  { value: PropertyType.COMMERCIAL, label: 'Commercial', icon: 'briefcase' },
  { value: PropertyType.LAND, label: 'Land', icon: 'map' },
];

const SHORT_TERM_TYPES = [
  { value: ShortTermPropertyType.APARTMENT, label: 'Apartment', icon: 'business' },
  { value: ShortTermPropertyType.HOUSE, label: 'House', icon: 'home' },
  { value: ShortTermPropertyType.VILLA, label: 'Villa', icon: 'home-outline' },
  { value: ShortTermPropertyType.STUDIO, label: 'Studio', icon: 'cube' },
  { value: ShortTermPropertyType.ROOM, label: 'Room', icon: 'bed' },
  { value: ShortTermPropertyType.HOTEL, label: 'Hotel', icon: 'business-outline' },
  { value: ShortTermPropertyType.RESORT, label: 'Resort', icon: 'sunny' },
  { value: ShortTermPropertyType.GUESTHOUSE, label: 'Guesthouse', icon: 'home-sharp' },
  { value: ShortTermPropertyType.COTTAGE, label: 'Cottage', icon: 'home' },
  { value: ShortTermPropertyType.BUNGALOW, label: 'Bungalow', icon: 'home' },
  { value: ShortTermPropertyType.HOSTEL, label: 'Hostel', icon: 'people' },
];

export default function PropertyTypePicker({ value, onChange, propertyCategory }: PropertyTypePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const backgroundColor = useThemeColor({}, 'background');

  const types = propertyCategory === 'short-term' ? SHORT_TERM_TYPES : LONG_TERM_TYPES;
  const selectedType = types.find(t => t.value === value);

  const handleSelect = (type: string) => {
    onChange(type);
    setShowModal(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: cardBg, borderColor }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.selectorContent}>
          {selectedType && (
            <Ionicons name={selectedType.icon as any} size={24} color={tintColor} />
          )}
          <Text style={[styles.selectorText, { color: textColor }]}>
            {selectedType?.label || 'Select property type'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Property Type</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {types.map(type => {
              const isSelected = value === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeItem,
                    { backgroundColor: cardBg, borderColor },
                    isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                  ]}
                  onPress={() => handleSelect(type.value)}
                >
                  <View style={styles.typeInfo}>
                    <Ionicons
                      name={type.icon as any}
                      size={28}
                      color={isSelected ? tintColor : textColor}
                    />
                    <Text style={[styles.typeLabel, { color: textColor }]}>{type.label}</Text>
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
    gap: 12,
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
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
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  typeLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});
