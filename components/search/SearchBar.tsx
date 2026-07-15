import { useThemeColor } from '@/hooks/use-theme-color';
import { RentalType } from '@/hooks/useRentalType';
import { formatDateShort } from '@/lib/utils/common';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  onPress?: () => void;
  rentalType?: RentalType;
  selectedLocation?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
}

const PLACEHOLDERS = [
  'Find a place tonight',
  'Book a party venue',
  'Get a photoshoot spot',
  'Plan a weekend getaway',
  'Reserve a meeting space',
];

export default function SearchBar({
  onPress,
  rentalType = RentalType.SHORT_TERM,
  selectedLocation,
  checkInDate,
  checkOutDate,
  guests,
}: SearchBarProps) {
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#333' }, 'background');
  const subtleColor = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');
  const shadowBg = useThemeColor({ light: '#000', dark: '#000' }, 'background');

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -6, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        slideAnim.setValue(6);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dateSummary = checkInDate && checkOutDate
    ? `${formatDateShort(checkInDate)} – ${formatDateShort(checkOutDate)}`
    : null;

  const guestSummary = guests && guests > 1 ? `${guests} guests` : null;
  const detailParts = [
    dateSummary || 'Any week',
    guestSummary || 'Add guests',
  ];

  return (
    <TouchableOpacity
      style={[styles.bar, { backgroundColor: cardBg, borderColor, shadowColor: shadowBg }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Search icon */}
      <View style={styles.searchIconWrap}>
        <Ionicons name="search" size={18} color={textColor} />
      </View>

      {/* Content area — Airbnb style stacked text */}
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.mainText,
            { color: textColor, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          numberOfLines={1}
        >
          {selectedLocation || PLACEHOLDERS[placeholderIdx]}
        </Animated.Text>
        <View style={styles.detailRow}>
          <Text style={[styles.detailText, { color: subtleColor }]} numberOfLines={1}>
            {selectedLocation ? 'Stays' : 'Anywhere'}
          </Text>
          <View style={[styles.detailDot, { backgroundColor: subtleColor }]} />
          <Text style={[styles.detailText, { color: subtleColor }]} numberOfLines={1}>
            {detailParts[0]}
          </Text>
          <View style={[styles.detailDot, { backgroundColor: subtleColor }]} />
          <Text style={[styles.detailText, { color: subtleColor }]} numberOfLines={1}>
            {detailParts[1]}
          </Text>
        </View>
      </View>

      {/* Filter button */}
      <View style={[styles.filterBtn, { borderColor }]}>
        <Ionicons name="options-outline" size={16} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 12,
    borderRadius: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: { flex: 1, justifyContent: 'center' },
  mainText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '400',
  },
  detailDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    marginHorizontal: 6,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
