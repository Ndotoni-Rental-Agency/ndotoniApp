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
  guests?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  isShortTerm: boolean;
}

// Kept in sync with components/create-listing/types.ts PROPERTY_TYPES —
// these are the only values a listing can actually be created with.
const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ROOM', label: 'Room' },
  { value: 'GUESTHOUSE', label: 'Guesthouse' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'COTTAGE', label: 'Cottage' },
];

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price ↑', icon: 'arrow-up' },
  { value: 'price_desc', label: 'Price ↓', icon: 'arrow-down' },
  { value: 'newest', label: 'Newest', icon: 'time' },
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
  const [guests, setGuests] = useState<number>(currentFilters.guests || 2);
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>(currentFilters.sortBy);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');

  const handlePriceMinChange = (text: string) => {
    const formatted = formatNumberWithCommas(text);
    setPriceMin(formatted);
  };

  const handlePriceMaxChange = (text: string) => {
    const formatted = formatNumberWithCommas(text);
    setPriceMax(formatted);
  };

  // Single-select: the search backend only accepts one propertyType per query.
  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev => (prev.includes(type) ? [] : [type]));
  };

  const handleApply = () => {
    const filters: FilterOptions = {
      priceMin: priceMin ? parseInt(priceMin.replace(/,/g, '')) : undefined,
      priceMax: priceMax ? parseInt(priceMax.replace(/,/g, '')) : undefined,
      propertyTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      bedrooms,
      bathrooms,
      guests: guests !== 2 ? guests : undefined,
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
    setGuests(2);
    setSortBy(undefined);
  };

  const hasActiveFilters = priceMin || priceMax || selectedTypes.length > 0 || bedrooms || bathrooms || guests !== 2 || sortBy;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: cardBg, borderColor }]}
          >
            <Ionicons name="close" size={22} color={textColor} />
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
          {/* Guests */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Guests</Text>
            <View style={styles.guestStepper}>
              <Text style={[styles.guestStepperText, { color: textColor }]}>
                {guests} guest{guests !== 1 ? 's' : ''}
              </Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { borderColor: guests <= 1 ? borderColor : tintColor }]}
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  accessibilityLabel="Decrease guests"
                >
                  <Ionicons name="remove" size={18} color={guests <= 1 ? secondaryText : tintColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.stepperBtn, { borderColor: tintColor }]}
                  onPress={() => setGuests(Math.min(50, guests + 1))}
                  accessibilityLabel="Increase guests"
                >
                  <Ionicons name="add" size={18} color={tintColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sort By — compact segmented row instead of a stacked card list */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Sort by</Text>
            <View style={[styles.segmented, { borderColor }]}>
              {SORT_OPTIONS.map((option, i) => {
                const active = sortBy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.segment,
                      i > 0 && { borderLeftWidth: 1, borderLeftColor: borderColor },
                      active && { backgroundColor: tintColor },
                    ]}
                    onPress={() => setSortBy(active ? undefined : (option.value as any))}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={15}
                      color={active ? '#fff' : secondaryText}
                    />
                    <Text style={[styles.segmentText, { color: active ? '#fff' : textColor }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price Range — single unified field split by a divider, not two floating cards */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Price range (TZS per {isShortTerm ? 'night' : 'month'})
            </Text>
            <View style={[styles.priceRow, { borderColor }]}>
              <View style={styles.priceField}>
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
              <View style={[styles.priceDivider, { backgroundColor: borderColor }]} />
              <View style={styles.priceField}>
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
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Property type</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map(type => {
                const active = selectedTypes.includes(type.value);
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      { borderColor },
                      active && { borderColor: tintColor, backgroundColor: tintColor },
                    ]}
                    onPress={() => togglePropertyType(type.value)}
                  >
                    <Text style={[styles.typeChipText, { color: active ? '#fff' : textColor }]}>
                      {type.label}
                    </Text>
                    {active && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bedrooms */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Bedrooms</Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4, 5].map(num => {
                const active = bedrooms === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numberButton,
                      { borderColor },
                      active && { borderColor: tintColor, backgroundColor: tintColor },
                    ]}
                    onPress={() => setBedrooms(active ? undefined : num)}
                  >
                    <Text style={[styles.numberButtonText, { color: active ? '#fff' : textColor }]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bathrooms */}
          <View style={styles.sectionLast}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Bathrooms</Text>
            <View style={styles.numberGrid}>
              {[1, 2, 3, 4].map(num => {
                const active = bathrooms === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numberButton,
                      { borderColor },
                      active && { borderColor: tintColor, backgroundColor: tintColor },
                    ]}
                    onPress={() => setBathrooms(active ? undefined : num)}
                  >
                    <Text style={[styles.numberButtonText, { color: active ? '#fff' : textColor }]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: tintColor }]}
            onPress={handleApply}
            activeOpacity={0.9}
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 15,
    fontWeight: '700',
  },
  placeholder: {
    width: 38,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderBottomWidth: 1,
  },
  sectionLast: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // Guests
  guestStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestStepperText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sort — segmented control
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Price range — one unified field
  priceRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 12,
    borderWidth: 1,
  },
  priceField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceDivider: {
    width: 1,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
    padding: 0,
  },

  // Property type
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 6,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Number grids (bedrooms/bathrooms)
  numberGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  numberButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
