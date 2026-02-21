import PropertyTypePicker from '@/components/property/PropertyTypePicker';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface BasicInfoSectionProps {
  formData: {
    title: string;
    description: string;
    propertyType: string;
  };
  onUpdate: (field: string, value: any) => void;
  propertyCategory: 'long-term' | 'short-term';
}

export default function BasicInfoSection({ formData, onUpdate, propertyCategory }: BasicInfoSectionProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Property Title *</Text>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
          placeholder={propertyCategory === 'long-term' ? 'e.g., 2 cozy bedrooms near city center' : 'e.g., Cozy beachfront villa'}
          placeholderTextColor={placeholderColor}
          value={formData.title}
          onChangeText={(text) => onUpdate('title', text)}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Description *</Text>
        <TextInput
          style={[styles.textArea, { color: textColor, backgroundColor: cardBg, borderColor }]}
          placeholder="Describe your property..."
          placeholderTextColor={placeholderColor}
          value={formData.description}
          onChangeText={(text) => onUpdate('description', text)}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Property Type *</Text>
        <PropertyTypePicker
          value={formData.propertyType}
          onChange={(type) => onUpdate('propertyType', type)}
          propertyCategory={propertyCategory}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
