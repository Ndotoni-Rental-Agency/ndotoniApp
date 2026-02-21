import MediaSelector from '@/components/media/MediaSelector';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface MediaSectionProps {
  selectedMedia: string[];
  onMediaChange: (mediaUrls: string[], images: string[], videos: string[]) => void;
  floorPlan?: string;
  virtualTour?: string;
  thumbnail?: string;
  onFloorPlanChange?: (url: string) => void;
  onVirtualTourChange?: (url: string) => void;
  onThumbnailChange?: (url: string) => void;
  propertyCategory: 'long-term' | 'short-term';
}

export default function MediaSection({
  selectedMedia,
  onMediaChange,
  floorPlan,
  virtualTour,
  thumbnail,
  onFloorPlanChange,
  onVirtualTourChange,
  onThumbnailChange,
  propertyCategory,
}: MediaSectionProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.label, { color: textColor }]}>Property Photos & Videos</Text>
        <MediaSelector
          selectedMedia={selectedMedia}
          onMediaChange={onMediaChange}
          maxSelection={10}
          onAuthRequired={() => {}}
        />
      </View>

      {propertyCategory === 'long-term' ? (
        <>
          {onFloorPlanChange && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>Floor Plan URL</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                placeholder="https://..."
                placeholderTextColor={placeholderColor}
                value={floorPlan}
                onChangeText={onFloorPlanChange}
              />
            </View>
          )}

          {onVirtualTourChange && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>Virtual Tour URL</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                placeholder="https://..."
                placeholderTextColor={placeholderColor}
                value={virtualTour}
                onChangeText={onVirtualTourChange}
              />
            </View>
          )}
        </>
      ) : (
        onThumbnailChange && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: textColor }]}>Thumbnail URL</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="https://..."
              placeholderTextColor={placeholderColor}
              value={thumbnail}
              onChangeText={onThumbnailChange}
            />
            <Text style={[styles.helperText, { color: placeholderColor }]}>
              Main image shown in listings
            </Text>
          </View>
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
});
