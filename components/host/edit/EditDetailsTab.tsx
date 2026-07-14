import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EditTabProps } from './types';
import { BasicInfoSection, LocationSection, PricingSection, CapacitySection, AmenitiesSection } from './sections';

const SECTIONS = [
  { key: 'basic', label: 'Basic Info', icon: 'document-text-outline' },
  { key: 'location', label: 'Location', icon: 'location-outline' },
  { key: 'pricing', label: 'Pricing', icon: 'cash-outline' },
  { key: 'capacity', label: 'Capacity & Duration', icon: 'people-outline' },
  { key: 'amenities', label: 'Amenities & Rules', icon: 'list-outline' },
];

export default function EditDetailsTab(props: EditTabProps) {
  const [active, setActive] = useState<string>('basic');
  const { text, tint, border, subtle } = props;

  return (
    <>
      {SECTIONS.map(sec => {
        const isOpen = active === sec.key;
        return (
          <View key={sec.key} style={[s.accordion, { borderColor: isOpen ? tint : border }]}>
            <TouchableOpacity style={s.accordionHeader} onPress={() => setActive(isOpen ? '' : sec.key)}>
              <View style={s.accordionLeft}>
                <Ionicons name={sec.icon as any} size={18} color={isOpen ? tint : subtle} />
                <Text style={[s.accordionTitle, { color: isOpen ? tint : text }]}>{sec.label}</Text>
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={isOpen ? tint : subtle} />
            </TouchableOpacity>
            {isOpen && (
              <View style={s.accordionBody}>
                {sec.key === 'basic' && <BasicInfoSection {...props} />}
                {sec.key === 'location' && <LocationSection {...props} />}
                {sec.key === 'pricing' && <PricingSection {...props} />}
                {sec.key === 'capacity' && <CapacitySection {...props} />}
                {sec.key === 'amenities' && <AmenitiesSection {...props} />}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
  accordion: { borderWidth: 1, borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accordionTitle: { fontSize: 15, fontWeight: '600' },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
});
