import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export interface FilterOptions {
  priceMin?: number;
  priceMax?: number;
  propertyTypes?: string[];
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  isShortTerm: boolean;
}

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'CONDO', label: 'Condo' },
];

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up' },
  { value: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down' },
  { value: 'newest', label: 'Newest First', icon: 'time' },
];

export default function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
  isShortTerm,
}: FilterModalProps) {
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Add commas
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const [priceMin, setPriceMin] = useState(
    currentFilters.priceMin ? formatNumberWithCommas(currentFilters.priceMin.toString()) : ''
  );
  const [priceMax, setPriceMax] = useState(
    currentFilters.priceMax ? formatNumberWithCommas(currentFilters.priceMax.toString()) : ''
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentFilters.propertyTypes || []);
  const [bedrooms, setBedrooms] = useState<number | undefined>(currentFilters.bedrooms);
  const [bathrooms, setBathrooms] = useState<number | undefined>(currentFilters.bathrooms);
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>(currentFilters.sortBy);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const handlePriceMinChange = (text: string) => {
    const formatted = formatNumberWithCommas(text);
    setPriceMin(formatted);
  };

  const handlePriceMaxChange = (text: string) => {
    const formatted = formatNumberWithCommas(text);
    setPriceMax(formatted);
  };

  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleApply = () => {
    const filters: FilterOptions = {
      priceMin: priceMin ? parseInt(priceMin.replace(/,/g, '')) : undefined,
      priceMax: priceMax ? parseInt(priceMax.replace(/,/g, '')) : undefined,
      propertyTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      bedrooms,
      bathrooms,
      sortBy,
    };
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedTypes([]);
    setBedrooms(undefined);
    setBathrooms(undefined);
    setSortBy(undefined);
  };

  const hasActiveFilters = priceMin || priceMax || selectedTypes.length > 0 || bedrooms || bathrooms || sortBy;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose} 
            style={[styles.closeButton, { backgroundColor: borderColor }]}
          >
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Filters</Text>
          {hasActiveFilters ? (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={[styles.clearText, { color: tintColor }]}>Clear all</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Sort By */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Sort by</Text>
            <View style={styles.optionsGrid}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    { backgroundColor: cardBg, borderColor },
                    sortBy === option.value && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                  ]}
                  onPress={() => setSortBy(option.value as any)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={sortBy === option.value ? tintColor : secondaryText}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      { color: sortBy === option.value ? tintColor : textColor },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Price range (TZS per {isShortTerm ? 'night' : 'month'})
            </Text>
            <View style={styles.priceInputs}>
              <View style={[styles.priceInputContainer, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.priceLabel, { color: secondaryText }]}>Min</Text>
                <TextInput
                  style={[styles.priceInput, { color: textColor }]}
                  value={priceMin}
                  onChangeText={handlePriceMinChange}
                  placeholder="0"
                  placeholderTextColor={secondaryText}
                  keyboardType="numeric"
                />
              </View>
              <Text style={[styles.priceSeparator, { color: secondaryText }]}>—</Text>
              <View style={[styles.priceInputContainer, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.priceLabel, { color: secondaryText }]}>Max</Text>
                <TextInput
                  style={[styles.priceInput, { color: textColor }]}
                  value={priceMax}
                  onChangeText={handlePriceMaxChange}
                  placeholder="Any"
                  placeholderTextColor={secondaryText}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Property type</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    { backgroundColor: cardBg, borderColor },
                    selectedTypes.includes(type.value) && {
                      borderColor: tintColor,
                      backgroundColor: `${tintColor}10`,
                    },
                  ]}
                  onPress={() => togglePropertyType(type.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: selectedTypes.includes(type.value) ? tintColor : textColor },
                    ]}
                  >
                    {type.label}
                  </Text>
                  {selectedTypes.includes(type.value) && (
                    <Ionicons name="checkmark-circle" size={18} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedrooms */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Bedrooms</Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4, 5].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.numberButton,
                    { backgroundColor: cardBg, borderColor },
                    bedrooms === num && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                  ]}
                  onPress={() => setBedrooms(bedrooms === num ? undefined : num)}
                >
                  <Text
                    style={[
                      styles.numberButtonText,
                      { color: bedrooms === num ? tintColor : textColor },
                    ]}
                  >
                    {num}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bathrooms */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Bathrooms</Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.numberButton,
                    { backgroundColor: cardBg, borderColor },
                    bathrooms === num && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
                  ]}
                  onPress={() => setBathrooms(bathrooms === num ? undefined : num)}
                >
                  <Text
                    style={[
                      styles.numberButtonText,
                      { color: bathrooms === num ? tintColor : textColor },
                    ]}
                  >
                    {num}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: tintColor }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Show results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  optionsGrid: {
    gap: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceInputContainer: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceInput: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  priceSeparator: {
    fontSize: 24,
    fontWeight: '300',
    opacity: 0.4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  numberGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  numberButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  numberButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  applyButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
