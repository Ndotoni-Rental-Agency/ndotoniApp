import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

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
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
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
          <View style={{ width: W, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: item }} style={{ width: W, height: H * 0.65 }} contentFit="contain" transition={150} />
          </View>
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

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  counter: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 40 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
