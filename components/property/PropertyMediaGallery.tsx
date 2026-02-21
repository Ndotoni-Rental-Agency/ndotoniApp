import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PropertyMediaGalleryProps {
  images: string[];
  videos: string[];
  onBack: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
}

export default function PropertyMediaGallery({
  images,
  videos,
  onBack,
  onShare,
  onFavorite,
}: PropertyMediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allMedia = [...images, ...videos];

  if (allMedia.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={allMedia}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setSelectedIndex(index);
        }}
        renderItem={({ item, index }) => {
          const isVideo = item.match(/\.(mp4|mov|avi|webm)(\?|$)/i);
          
          return isVideo ? (
            <Video
              source={{ uri: item }}
              style={styles.media}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay={index === selectedIndex}
              isLooping
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: item }}
              style={styles.media}
              resizeMode="cover"
            />
          );
        }}
        keyExtractor={(item, index) => index.toString()}
      />
      
      {/* Overlay Header Buttons */}
      <View style={styles.overlayHeader}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerRightButtons}>
            {onShare && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onShare}
              >
                <Ionicons name="share-outline" size={22} color="#000" />
              </TouchableOpacity>
            )}
            {onFavorite && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onFavorite}
              >
                <Ionicons name="heart-outline" size={22} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      {/* Media Counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {selectedIndex + 1} / {allMedia.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 420,
    position: 'relative',
  },
  media: {
    width: SCREEN_WIDTH,
    height: 420,
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  counter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
