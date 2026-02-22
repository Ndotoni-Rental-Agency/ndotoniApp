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
  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = backgroundColor;
  const borderColor = useThemeColor({ light: '#DDDDDD', dark: '#2C2C2E' }, 'background');
  const iconColor = useThemeColor({ light: '#222222', dark: '#9CA3AF' }, 'text');
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
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  searchContent: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 14,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
