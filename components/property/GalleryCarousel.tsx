import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const W = Dimensions.get('window').width;

interface GalleryCarouselProps {
  images: string[];
  height: number;
  onTap: (index: number) => void;
}

export default function GalleryCarousel({ images, height, onTap }: GalleryCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <View style={{ height }}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={0.95} onPress={() => onTap(index)}>
            <Image source={{ uri: item }} style={{ width: W, height }} contentFit="cover" transition={200} />
          </TouchableOpacity>
        )}
      />
      {images.length > 1 && (
        <View style={s.pill}>
          <Text style={s.pillText}>{activeIdx + 1} / {images.length}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    position: 'absolute', bottom: 16, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
