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
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
  const subtleColor = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -8, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        slideAnim.setValue(8);
        // Fade in + slide down
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const dateSummary = checkInDate && checkOutDate
    ? `${formatDateShort(checkInDate)} – ${formatDateShort(checkOutDate)}`
    : null;

  return (
    <TouchableOpacity
      style={[styles.bar, { backgroundColor: cardBg, borderColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Colored search icon */}
      <View style={[styles.iconWrap, { backgroundColor: tintColor }]}>
        <Ionicons name="search" size={16} color="#fff" />
      </View>

      {/* Text area */}
      <View style={styles.textArea}>
        <Animated.Text
          style={[
            styles.mainText,
            { color: textColor, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          numberOfLines={1}
        >
          {PLACEHOLDERS[placeholderIdx]}
        </Animated.Text>
        <Text style={[styles.subText, { color: subtleColor }]} numberOfLines={1}>
          {dateSummary ? `${dateSummary} · Add guests` : 'Anywhere · Any week · Add guests'}
        </Text>
      </View>

      {/* Filter icon */}
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
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 10,
    borderRadius: 36,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textArea: { flex: 1, justifyContent: 'center' },
  mainText: { fontSize: 14, fontWeight: '600', marginBottom: 1 },
  subText: { fontSize: 12 },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
