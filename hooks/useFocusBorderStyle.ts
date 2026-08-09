import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Animates a field's border color between its idle and focused color. */
export function useFocusBorderStyle(idleColor: string, focusColor: string) {
  const progress = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [idleColor, focusColor]),
  }));

  const onFocus = () => {
    progress.value = withTiming(1, { duration: 150 });
  };
  const onBlur = () => {
    progress.value = withTiming(0, { duration: 150 });
  };

  return { style, onFocus, onBlur };
}
