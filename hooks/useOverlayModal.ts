import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler } from 'react-native';

/**
 * Drives a plain-View modal overlay (fade in/out + Android back button) instead of
 * React Native's <Modal>. Two native Modals can't reliably stack — a Modal-based
 * alert/dialog triggered from inside an already-open Modal can render hidden behind
 * it on both iOS and Android — so screens that need to coexist with the app's
 * themed alert render as plain overlays instead.
 */
export function useOverlayModal(visible: boolean, onClose: () => void) {
  const [shouldRender, setShouldRender] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else if (shouldRender) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setShouldRender(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  return { shouldRender, fadeAnim };
}
