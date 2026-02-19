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
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = backgroundColor; // Use same background as main screen
  const borderColor = useThemeColor({ light: '#ddd', dark: '#374151' }, 'background');
  const iconColor = useThemeColor({ light: '#222', dark: '#e5e7eb' }, 'text');
  
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
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
});
