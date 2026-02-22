import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyPricingProps {
  monthlyRent: number;
  currency: string;
  deposit?: number | null;
  serviceCharge?: number | null;
  utilitiesIncluded?: boolean | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
}

export default function PropertyPricing({
  monthlyRent,
  currency,
  deposit,
  serviceCharge,
  utilitiesIncluded,
  textColor,
  tintColor,
  secondaryText,
}: PropertyPricingProps) {
  const formatPrice = (amount: number) => {
    const currencyStr = currency || 'TZS';
    return `${currencyStr} ${amount.toLocaleString()}`;
  };

  // Ensure we have valid data
  if (!monthlyRent || monthlyRent <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cash" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Pricing Details</Text>
      </View>
      
      <View style={styles.priceList}>
        {/* Main Rent */}
        <View style={styles.priceRow}>
          <Text style={[styles.label, { color: secondaryText }]}>Monthly Rent</Text>
          <Text style={[styles.price, { color: tintColor }]}>{formatPrice(monthlyRent)}</Text>
        </View>
        
        {/* Deposit */}
        {deposit && deposit > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.label, { color: secondaryText }]}>Security Deposit</Text>
            <Text style={[styles.value, { color: textColor }]}>{formatPrice(deposit)}</Text>
          </View>
        )}
        
        {/* Service Charge */}
        {serviceCharge && serviceCharge > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.label, { color: secondaryText }]}>Service Charge</Text>
            <Text style={[styles.value, { color: textColor }]}>{formatPrice(serviceCharge)}</Text>
          </View>
        )}
        
        {/* Utilities */}
        {utilitiesIncluded !== null && utilitiesIncluded !== undefined && (
          <View style={styles.priceRow}>
            <Text style={[styles.label, { color: secondaryText }]}>Utilities</Text>
            <View style={styles.utilityBadge}>
              <Ionicons 
                name={utilitiesIncluded ? 'checkmark-circle' : 'close-circle'} 
                size={16} 
                color={utilitiesIncluded ? '#10b981' : secondaryText} 
              />
              <Text style={[styles.utilityText, { color: utilitiesIncluded ? '#10b981' : secondaryText }]}>
                {utilitiesIncluded ? 'Included' : 'Not Included'}
              </Text>
            </View>
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
  utilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  utilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
