import CurrencyPicker from '@/components/property/CurrencyPicker';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

interface PricingSectionProps {
  formData: {
    currency: string;
    monthlyRent?: string;
    nightlyRate?: string;
    deposit?: string;
    cleaningFee?: string;
    serviceCharge?: string;
    serviceFeePercentage?: string;
    taxPercentage?: string;
    utilitiesIncluded?: boolean;
  };
  onUpdate: (field: string, value: any) => void;
  propertyCategory: 'long-term' | 'short-term';
}

export default function PricingSection({ formData, onUpdate, propertyCategory }: PricingSectionProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Currency *</Text>
        <CurrencyPicker
          value={formData.currency}
          onChange={(currency) => onUpdate('currency', currency)}
        />
      </View>

      {propertyCategory === 'long-term' ? (
        <>
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Monthly Rent *</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 500000"
              placeholderTextColor={placeholderColor}
              value={formData.monthlyRent}
              onChangeText={(text) => onUpdate('monthlyRent', text)}
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
              onChangeText={(text) => onUpdate('deposit', text)}
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
              onChangeText={(text) => onUpdate('serviceCharge', text)}
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
              onValueChange={(value) => onUpdate('utilitiesIncluded', value)}
              trackColor={{ false: borderColor, true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Nightly Rate *</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 50000"
              placeholderTextColor={placeholderColor}
              value={formData.nightlyRate}
              onChangeText={(text) => onUpdate('nightlyRate', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Cleaning Fee</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="e.g., 20000"
              placeholderTextColor={placeholderColor}
              value={formData.cleaningFee}
              onChangeText={(text) => onUpdate('cleaningFee', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Service Fee (%)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.serviceFeePercentage}
                onChangeText={(text) => onUpdate('serviceFeePercentage', text)}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={[styles.label, { color: textColor }]}>Tax (%)</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                value={formData.taxPercentage}
                onChangeText={(text) => onUpdate('taxPercentage', text)}
                keyboardType="numeric"
                placeholder="18"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </View>
        </>
      )}
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
});
