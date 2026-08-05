import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';

interface BrandLoaderProps {
  /** Roughly matches ActivityIndicator's "large" (~36) vs "small" (~20) sizing. */
  size?: number;
  style?: ViewStyle;
}

/**
 * Drop-in replacement for `<ActivityIndicator size="large" />` that pulses the
 * actual ndotoni mark instead of a generic native spinner — the logo doesn't
 * appear anywhere else in the UI today, so this reuses it at the one place
 * users spend the most idle time looking at the screen.
 */
export default function BrandLoader({ size = 40, style }: BrandLoaderProps) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.82, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.55, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <Animated.Image
        source={require('@/assets/images/splash-icon.png')}
        style={{ width: size, height: size, transform: [{ scale }], opacity }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
