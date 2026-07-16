/**
 * Self-contained favorite/heart button that subscribes to global favorites state.
 * Only THIS component re-renders when favorites change — the parent card/list doesn't.
 */

import { useFavorites } from '@/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FavoriteButtonProps {
  propertyId: string;
  size?: number;
  /** Style variant */
  variant?: 'dark-bg' | 'light-bg';
  style?: ViewStyle;
}

export default function FavoriteButton({ propertyId, size = 18, variant = 'dark-bg', style }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(propertyId);

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        variant === 'light-bg' ? styles.lightBg : styles.darkBg,
        style,
      ]}
      onPress={() => toggleFavorite(propertyId)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={favorited ? 'heart' : 'heart-outline'}
        size={size}
        color={favorited ? '#ff385c' : variant === 'dark-bg' ? '#fff' : '#222'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkBg: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  lightBg: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
});
