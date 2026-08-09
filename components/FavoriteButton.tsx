/**
 * Self-contained favorite/heart button that subscribes to global favorites state.
 * Only THIS component re-renders when favorites change — the parent card/list doesn't.
 */

import AnimatedPressable from '@/components/ui/AnimatedPressable';
import { Secondary } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface FavoriteButtonProps {
  propertyId: string;
  size?: number;
  /** Style variant */
  variant?: 'dark-bg' | 'light-bg';
  style?: ViewStyle;
}

export default function FavoriteButton({ propertyId, size = 18, variant = 'dark-bg', style }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthPrompt();
  const favorited = isFavorited(propertyId);
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
  }, [favorited, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.btn,
        variant === 'light-bg' ? styles.lightBg : styles.darkBg,
        style,
      ]}
      pressedScale={0.85}
      onPress={() => {
        if (!isAuthenticated) {
          requireAuth();
          return;
        }
        toggleFavorite(propertyId);
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={favorited ? 'heart' : 'heart-outline'}
          size={size}
          color={favorited ? Secondary[600] : variant === 'dark-bg' ? '#fff' : '#222'}
        />
      </Animated.View>
    </AnimatedPressable>
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
