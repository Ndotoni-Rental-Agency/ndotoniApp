import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import { formatDateShort } from '@/lib/utils/common';

interface SearchBarProps {
  onPress?: () => void;
  rentalType?: RentalType;
  selectedLocation?: string;
  checkInDate?: string;
  checkOutDate?: string;
  moveInDate?: string;
}

export default function SearchBar({ 
  onPress, 
  rentalType = RentalType.LONG_TERM,
  selectedLocation,
  checkInDate,
  checkOutDate,
  moveInDate,
}: SearchBarProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#374151' }, 'background');
  const iconColor = useThemeColor({ light: '#222', dark: '#e5e7eb' }, 'text');
  const filterBg = useThemeColor({ light: '#f7f7f7', dark: '#374151' }, 'background');
  
  const isShortTerm = rentalType === RentalType.SHORT_TERM;
  
  const getSubtitle = () => {
    if (isShortTerm) {
      if (checkInDate && checkOutDate) {
        return `${formatDateShort(checkInDate)} - ${formatDateShort(checkOutDate)}`;
      }
      if (checkInDate) {
        return `From ${formatDateShort(checkInDate)}`;
      }
      return 'Any dates';
    } else {
      if (moveInDate) {
        return `Move in: ${formatDateShort(moveInDate)}`;
      }
      return 'Any time';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.searchBar, { backgroundColor: cardBg, borderColor }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={20} color={iconColor} />
      <View style={styles.searchContent}>
        <Text style={[styles.searchTitle, { color: textColor }]}>
          {selectedLocation || 'Where to?'}
        </Text>
        <Text style={styles.searchSubtitle}>{getSubtitle()}</Text>
      </View>
      <View style={[styles.filterButton, { backgroundColor: filterBg, borderColor }]}>
        <Ionicons name="options-outline" size={20} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContent: {
    flex: 1,
    marginLeft: 12,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 12,
    color: '#717171',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
