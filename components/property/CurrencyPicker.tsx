import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CurrencyPickerProps {
  value: string;
  onChange: (currency: string) => void;
}

const CURRENCIES = [
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export default function CurrencyPicker({ value, onChange }: CurrencyPickerProps) {
  const [showModal, setShowModal] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const backgroundColor = useThemeColor({}, 'background');

  const selectedCurrency = CURRENCIES.find(c => c.code === value);

  const handleSelect = (code: string) => {
    onChange(code);
    setShowModal(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: cardBg, borderColor }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={[styles.symbol, { color: tintColor }]}>
            {selectedCurrency?.symbol || '$'}
          </Text>
          <Text style={[styles.selectorText, { color: textColor }]}>
            {selectedCurrency?.code || 'Select currency'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Currency</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {CURRENCIES.map(currency => {
              const isSelected = value === currency.code;
              return (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyItem,
                    { backgroundColor: cardBg, borderColor },
                    isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                  ]}
                  onPress={() => handleSelect(currency.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={[styles.currencySymbol, { color: tintColor }]}>
                      {currency.symbol}
                    </Text>
                    <View>
                      <Text style={[styles.currencyCode, { color: textColor }]}>
                        {currency.code}
                      </Text>
                      <Text style={[styles.currencyName, { color: textColor, opacity: 0.6 }]}>
                        {currency.name}
                      </Text>
                    </View>
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
  symbol: {
    fontSize: 20,
    fontWeight: '700',
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    width: 40,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 13,
  },
});
