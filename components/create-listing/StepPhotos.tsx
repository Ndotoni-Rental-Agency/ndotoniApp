import MediaSelector from '@/components/media/MediaSelector';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StepProps } from './types';

export default function StepPhotos({ form, updateField, colors }: StepProps) {
  const { text, tint, subtle } = colors;

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Add some photos{'\n'}of your place
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        You'll need at least 1 photo to get started.{'\n'}You can add more later.
      </Text>

      <View style={styles.mediaWrap}>
        <MediaSelector
          selectedMedia={form.images}
          onMediaChange={(_urls: string[], imgs: string[]) => updateField('images', imgs)}
        />
      </View>

      {form.images.length > 0 && (
        <Text style={[styles.count, { color: tint }]}>
          {form.images.length} photo{form.images.length !== 1 ? 's' : ''} added ✓
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
