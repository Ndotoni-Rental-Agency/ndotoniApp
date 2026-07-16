import MediaSelector from '@/components/media/MediaSelector';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StepProps } from './types';

export default function StepPhotos({ form, updateField, colors }: StepProps) {
  const { text, tint, subtle } = colors;

  const allMedia = [...(form.images || []), ...(form.videos || [])];

  const handleMediaChange = (urls: string[], images: string[], videos: string[]) => {
    updateField('images', images);
    updateField('videos', videos);
  };

  const imageCount = form.images?.length || 0;
  const videoCount = form.videos?.length || 0;

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Add photos & videos{'\n'}of your place
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        You'll need at least 1 photo to get started.{'\n'}Videos help guests get a better feel for the space.
      </Text>

      <View style={styles.mediaWrap}>
        <MediaSelector
          selectedMedia={allMedia}
          onMediaChange={handleMediaChange}
        />
      </View>

      {(imageCount > 0 || videoCount > 0) && (
        <Text style={[styles.count, { color: tint }]}>
          {imageCount > 0 && `${imageCount} photo${imageCount !== 1 ? 's' : ''}`}
          {imageCount > 0 && videoCount > 0 && ' · '}
          {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? 's' : ''}`}
          {' ✓'}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
  },
  mediaWrap: {
    minHeight: 200,
  },
  count: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
});
