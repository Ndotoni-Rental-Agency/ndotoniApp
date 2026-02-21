import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyAddressProps {
  street?: string | null;
  ward?: string | null;
  district: string;
  region: string;
  postalCode?: string | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
  backgroundColor: string;
  borderColor: string;
}

export default function PropertyAddress({
  street,
  ward,
  district,
  region,
  postalCode,
  textColor,
  tintColor,
  secondaryText,
  backgroundColor,
  borderColor,
}: PropertyAddressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Full Address</Text>
      </View>
      
      <View style={styles.addressList}>
        {street && (
          <View style={styles.addressRow}>
            <Ionicons name="home-outline" size={18} color={secondaryText} />
            <Text style={[styles.addressText, { color: textColor }]}>{street}</Text>
          </View>
        )}
        
        {ward && (
          <View style={styles.addressRow}>
            <Ionicons name="business-outline" size={18} color={secondaryText} />
            <Text style={[styles.addressText, { color: textColor }]}>{ward} Ward</Text>
          </View>
        )}
        
        <View style={styles.addressRow}>
          <Ionicons name="navigate-outline" size={18} color={secondaryText} />
          <Text style={[styles.addressText, { color: textColor }]}>{district} District</Text>
        </View>
        
        <View style={styles.addressRow}>
          <Ionicons name="map-outline" size={18} color={secondaryText} />
          <Text style={[styles.addressText, { color: textColor }]}>{region} Region</Text>
        </View>
        
        {postalCode && (
          <View style={styles.addressRow}>
            <Ionicons name="mail-outline" size={18} color={secondaryText} />
            <Text style={[styles.addressText, { color: textColor }]}>{postalCode}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  addressList: {
    gap: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});
