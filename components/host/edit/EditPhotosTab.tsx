import MediaSelector from '@/components/media/MediaSelector';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { PhotosTabProps } from './types';

export default function EditPhotosTab({ images, setImages, saving, saveSec, text, tint, subtle }: PhotosTabProps) {
  return (
    <>
      <Text style={[s.title, { color: text }]}>Photos & Videos</Text>
      <Text style={[s.sub, { color: subtle }]}>First photo is the cover. Add up to 10.</Text>
      <MediaSelector selectedMedia={images} onMediaChange={(_, imgs) => setImages(imgs)} />
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: tint, opacity: saving ? 0.5 : 1 }]} onPress={() => saveSec('Photos', { images })} disabled={saving}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Save photos</Text>}
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 14 },
  saveBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
