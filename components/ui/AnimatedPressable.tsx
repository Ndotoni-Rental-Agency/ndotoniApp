import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  /** Scale applied while pressed. Defaults to 0.96. */
  pressedScale?: number;
  /** Light haptic tick on press-in. Defaults to false — opt in per use site. */
  haptic?: boolean;
}

export default function AnimatedPressable({
  style,
  pressedScale = 0.96,
  haptic = false,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      style={[style, animatedStyle]}
      // Without this, touching a card to start a scroll fires onPressIn before
      // the gesture resolves as a scroll (not a tap), so the card scales down
      // and springs back on every scroll start — reads as the card "bouncing".
      // This delay gives the scroll responder a chance to claim the gesture first.
      unstable_pressDelay={80}
      onPressIn={(e) => {
        scale.value = withSpring(pressedScale, { damping: 18, stiffness: 300 });
        if (haptic && process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 250 });
        onPressOut?.(e);
      }}
      {...props}
    />
  );
}
