import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import { formatDateShort } from '@/lib/utils/common';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = backgroundColor;
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const iconColor = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  const isShortTerm = rentalType === RentalType.SHORT_TERM;
  
  const getLocationText = () => {
    // Always show "Search destinations" - don't display selected location
    return 'Search destinations';
  };

  const getDateText = () => {
    if (isShortTerm) {
      if (checkInDate && checkOutDate) {
        return `${formatDateShort(checkInDate)} - ${formatDateShort(checkOutDate)}`;
      }
      if (checkInDate) {
        return `From ${formatDateShort(checkInDate)}`;
      }
      return 'Add dates';
    } else {
      if (moveInDate) {
        return formatDateShort(moveInDate);
      }
      return 'Anytime';
    }
  };

  const hasSearchCriteria = checkInDate || checkOutDate || moveInDate;

  return (
    <TouchableOpacity 
      style={[styles.searchBar, { backgroundColor: cardBg, borderColor }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.searchContent}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={22} color={iconColor} style={styles.searchIcon} />
          <View style={styles.searchTextContainer}>
            <Text 
              style={[
                styles.searchTitle, 
                { color: hasSearchCriteria ? textColor : iconColor }
              ]} 
              numberOfLines={1}
            >
              {getLocationText()}
            </Text>
            <View style={styles.searchMetaRow}>
              <Text style={[styles.searchSubtitle, { color: iconColor }]}>
                {getDateText()}
              </Text>
              {hasSearchCriteria && (
                <>
                  <View style={[styles.dot, { backgroundColor: iconColor }]} />
                  <Text style={[styles.searchSubtitle, { color: iconColor }]}>
                    {isShortTerm ? 'Stays' : 'Rentals'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
      <View style={[styles.searchButton, { backgroundColor: tintColor }]}>
        <Ionicons name="search" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchContent: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
