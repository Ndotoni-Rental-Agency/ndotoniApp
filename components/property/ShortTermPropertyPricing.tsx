import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShortTermPropertyPricingProps {
  nightlyRate: number;
  currency: string;
  cleaningFee?: number | null;
  serviceFeePercentage?: number | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
}

export default function ShortTermPropertyPricing({
  nightlyRate,
  currency,
  cleaningFee,
  serviceFeePercentage,
  textColor,
  tintColor,
  secondaryText,
}: ShortTermPropertyPricingProps) {
  const formatPrice = (amount: number) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cash" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Pricing Details</Text>
      </View>
      
      <View style={styles.priceList}>
        {/* Nightly Rate */}
        <View style={styles.priceRow}>
          <Text style={[styles.label, { color: secondaryText }]}>Nightly Rate</Text>
          <Text style={[styles.price, { color: tintColor }]}>{formatPrice(nightlyRate)}</Text>
        </View>
        
        {/* Cleaning Fee */}
        {cleaningFee && cleaningFee > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.label, { color: secondaryText }]}>Cleaning Fee</Text>
            <Text style={[styles.value, { color: textColor }]}>{formatPrice(cleaningFee)}</Text>
          </View>
        )}
        
        {/* Service Fee */}
        {serviceFeePercentage && serviceFeePercentage > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.label, { color: secondaryText }]}>Service Fee</Text>
            <Text style={[styles.value, { color: textColor }]}>{serviceFeePercentage}%</Text>
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
  priceList: {
    gap: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
  },
});
