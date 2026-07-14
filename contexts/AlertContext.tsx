import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  icon?: 'success' | 'error' | 'warning' | 'info' | 'delete';
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const showAlert = useCallback((opts: AlertOptions) => {
    setOptions(opts);
    setVisible(true);
    scaleAnim.setValue(0.85);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = useCallback((button?: AlertButton) => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      button?.onPress?.();
    });
  }, []);

  const getIconConfig = (icon?: AlertOptions['icon']) => {
    switch (icon) {
      case 'success': return { name: 'checkmark-circle', color: '#10b981', bg: '#10b98115' };
      case 'error': return { name: 'close-circle', color: '#ef4444', bg: '#ef444415' };
      case 'warning': return { name: 'warning', color: '#f59e0b', bg: '#f59e0b15' };
      case 'delete': return { name: 'trash', color: '#ef4444', bg: '#ef444415' };
      case 'info': default: return { name: 'information-circle', color: tint, bg: `${tint}15` };
    }
  };

  const buttons = options?.buttons || [{ text: 'OK', style: 'default' }];
  const iconConfig = getIconConfig(options?.icon);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={() => dismiss()} />
          <Animated.View style={[styles.dialog, { backgroundColor: card, transform: [{ scale: scaleAnim }] }]}>
            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: iconConfig.bg }]}>
              <Ionicons name={iconConfig.name as any} size={32} color={iconConfig.color} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: text }]}>{options?.title}</Text>

            {/* Message */}
            {options?.message && (
              <Text style={[styles.message, { color: subtle }]}>{options.message}</Text>
            )}

            {/* Buttons */}
            <View style={styles.buttons}>
              {buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                const isPrimary = !isCancel && !isDestructive && buttons.length > 1 && i === buttons.length - 1;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.button,
                      isCancel && [styles.cancelBtn, { borderColor: border }],
                      isDestructive && styles.destructiveBtn,
                      isPrimary && [styles.primaryBtn, { backgroundColor: tint }],
                      !isCancel && !isDestructive && !isPrimary && buttons.length === 1 && [styles.primaryBtn, { backgroundColor: tint }],
                    ]}
                    onPress={() => dismiss(btn)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.buttonText,
                      isCancel && { color: text },
                      isDestructive && styles.destructiveBtnText,
                      (isPrimary || (!isCancel && !isDestructive && buttons.length === 1)) && styles.primaryBtnText,
                    ]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  primaryBtn: {},
  primaryBtnText: {
    color: '#fff',
  },
  destructiveBtn: {
    backgroundColor: '#ef4444',
  },
  destructiveBtnText: {
    color: '#fff',
  },
});
