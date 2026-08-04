import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;
const DOUBLE_TAP_MS = 280;

interface FullScreenGalleryProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export default function FullScreenGallery({ images, startIndex, onClose }: FullScreenGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.counter}>{currentIdx + 1} / {images.length}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        onMomentumScrollEnd={(e) => setCurrentIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <ZoomableImage uri={item} width={W} height={H * 0.65} />
        )}
      />

      {images.length <= 12 && (
        <View style={s.dots}>
          {images.map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i === currentIdx ? '#fff' : 'rgba(255,255,255,0.3)' }]} />
          ))}
        </View>
      )}
    </View>
  );
}

// Pinch-to-zoom + pan, built on PanResponder (matching the plain-RN gesture pattern
// already used elsewhere in this app) rather than react-native-gesture-handler, which
// nothing else here relies on and isn't confirmed to be rooted at the app level.
function ZoomableImage({ uri, width, height }: { uri: string; width: number; height: number }) {
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Refs mirror the latest state synchronously so PanResponder callbacks (created once)
  // never read a stale closure value.
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const gesture = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialTranslate: { x: 0, y: 0 },
    lastTapAt: 0,
  }).current;

  const getDistance = (touches: any[]) => {
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  };

  const applyScale = (next: number) => {
    scaleRef.current = next;
    setScale(next);
  };
  const applyTranslate = (next: { x: number; y: number }) => {
    translateRef.current = next;
    setTranslate(next);
  };

  const reset = () => {
    applyScale(1);
    applyTranslate({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Only steal the gesture from the parent FlatList for a pinch (2 fingers) or
      // when already zoomed in (so panning moves the image instead of paging).
      onStartShouldSetPanResponder: (e) => e.nativeEvent.touches.length === 2,
      onStartShouldSetPanResponderCapture: (e) => e.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (e, g) => {
        if (e.nativeEvent.touches.length === 2) return true;
        return scaleRef.current > 1 && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2);
      },
      onMoveShouldSetPanResponderCapture: (e, g) => {
        if (e.nativeEvent.touches.length === 2) return true;
        return scaleRef.current > 1 && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2);
      },
      onPanResponderGrant: (e) => {
        const touches = e.nativeEvent.touches;
        gesture.initialTranslate = translateRef.current;
        if (touches.length === 2) {
          gesture.initialDistance = getDistance(touches);
          gesture.initialScale = scaleRef.current;
        }
      },
      onPanResponderMove: (e, g) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2 && gesture.initialDistance > 0) {
          const distance = getDistance(touches);
          const next = Math.min(MAX_SCALE, Math.max(1, gesture.initialScale * (distance / gesture.initialDistance)));
          applyScale(next);
        } else if (scaleRef.current > 1) {
          applyTranslate({
            x: gesture.initialTranslate.x + g.dx,
            y: gesture.initialTranslate.y + g.dy,
          });
        }
      },
      onPanResponderRelease: (e, g) => {
        if (scaleRef.current <= 1) {
          reset();
        }
        // Double-tap to toggle zoom — only for a quick, near-stationary single-finger tap.
        const isTap = Math.abs(g.dx) < 4 && Math.abs(g.dy) < 4;
        if (isTap) {
          const now = Date.now();
          if (now - gesture.lastTapAt < DOUBLE_TAP_MS) {
            if (scaleRef.current > 1) reset();
            else applyScale(DOUBLE_TAP_SCALE);
            gesture.lastTapAt = 0;
          } else {
            gesture.lastTapAt = now;
          }
        }
      },
    })
  ).current;

  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} {...panResponder.panHandlers}>
      {imageError ? (
        <View style={s.fallback}>
          <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.4)" />
        </View>
      ) : (
        <Animated.View style={{ width, height, transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }] }}>
          <Image
            source={{ uri }}
            style={{ width, height }}
            contentFit="contain"
            transition={150}
            cachePolicy="memory-disk"
            recyclingKey={uri}
            onError={() => setImageError(true)}
          />
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  counter: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 40 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  fallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
});
