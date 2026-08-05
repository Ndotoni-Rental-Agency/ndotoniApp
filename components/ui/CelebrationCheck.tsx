import { Brand, Secondary } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface CelebrationCheckProps {
  /** Diameter of the checkmark circle. The confetti burst radiates beyond this. */
  size?: number;
}

const PARTICLE_COLORS = [Brand[400], Brand[500], Brand[600], Secondary[400], Secondary[500]];
const PARTICLE_COUNT = 14;

/**
 * The one moment users are emotionally primed to notice: a booking or payment
 * going through. Replaces a static checkmark icon with a spring-scaled circle
 * plus a one-shot radial confetti burst in brand colors — plays once on mount,
 * doesn't loop (this is a celebration, not a loading state).
 */
export default function CelebrationCheck({ size = 96 }: CelebrationCheckProps) {
  const tint = useThemeColor({}, 'tint');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      anim: new Animated.Value(0),
      angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      distance: size * 0.55 + Math.random() * size * 0.35,
      dotSize: 5 + Math.random() * 5,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }))
  ).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
    Animated.stagger(
      12,
      particles.map((p) =>
        Animated.timing(p.anim, { toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      )
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapSize = size * 2.4;

  return (
    <View style={[styles.wrap, { width: wrapSize, height: wrapSize }]} pointerEvents="none">
      {particles.map((p, i) => {
        const translateX = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * p.distance] });
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * p.distance] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        const dotScale = p.anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0.4] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.dotSize,
                height: p.dotSize,
                borderRadius: p.dotSize / 2,
                marginLeft: -p.dotSize / 2,
                marginTop: -p.dotSize / 2,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { scale: dotScale }],
              },
            ]}
          />
        );
      })}
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: `${tint}12`,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={size * 0.62} color={tint} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute', top: '50%', left: '50%' },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
