import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface ContactSectionProps {
  formData: {
    firstName: string;
    lastName: string;
    whatsapp: string;
  };
  onUpdate: (field: string, value: string) => void;
  contactType: 'landlord' | 'host';
}

export default function ContactSection({ formData, onUpdate, contactType }: ContactSectionProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const prefix = contactType === 'landlord' ? 'landlord' : 'host';

  return (
    <>
      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: textColor }]}>First Name</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
            value={formData.firstName}
            onChangeText={(text) => onUpdate(`${prefix}FirstName`, text)}
            placeholder="John"
            placeholderTextColor={placeholderColor}
          />
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
            value={formData.lastName}
            onChangeText={(text) => onUpdate(`${prefix}LastName`, text)}
            placeholder="Doe"
            placeholderTextColor={placeholderColor}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>WhatsApp Number</Text>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
          value={formData.whatsapp}
          onChangeText={(text) => onUpdate(`${prefix}Whatsapp`, text)}
          placeholder="+255..."
          placeholderTextColor={placeholderColor}
          keyboardType="phone-pad"
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});
