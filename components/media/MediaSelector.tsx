import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { getMediaUploadUrl } from '@/lib/graphql/mutations';

interface MediaSelectorProps {
  selectedMedia: string[];
  onMediaChange: (mediaUrls: string[], images: string[], videos: string[]) => void;
  maxSelection?: number;
}

export default function MediaSelector({
  selectedMedia,
  onMediaChange,
  maxSelection = 10,
}: MediaSelectorProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (selectedMedia.length >= maxSelection) {
      Alert.alert('Limit Reached', `You can select up to ${maxSelection} media items`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxSelection - selectedMedia.length,
      });

      if (!result.canceled && result.assets) {
        await uploadImages(result.assets);
      }
    } catch (error) {
      console.error('[MediaSelector] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.'
      );
      return;
    }

    if (selectedMedia.length >= maxSelection) {
      Alert.alert('Limit Reached', `You can select up to ${maxSelection} media items`);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        await uploadImages(result.assets);
      }
    } catch (error) {
      console.error('[MediaSelector] Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImages = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const asset of assets) {
        const filename = asset.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Step 1: Get presigned URL from backend
        // Smart decision: use authenticated if signed in, otherwise guest mode
        const isAuthenticated = await GraphQLClient.isAuthenticated();
        const urlData = isAuthenticated
          ? await GraphQLClient.executeAuthenticated<{ getMediaUploadUrl: any }>(
              getMediaUploadUrl,
              { 
                fileName: filename,
                contentType: type
              }
            )
          : await GraphQLClient.executePublic<{ getMediaUploadUrl: any }>(
              getMediaUploadUrl,
              { 
                fileName: filename,
                contentType: type
              }
            );

        if (!urlData.getMediaUploadUrl?.uploadUrl) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, fileUrl } = urlData.getMediaUploadUrl;

        // Step 2: Upload file to S3 using presigned URL
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        await fetch(uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': type,
          },
        });

        uploadedUrls.push(fileUrl);
      }

      // Update selected media
      const newSelectedMedia = [...selectedMedia, ...uploadedUrls];
      const images = newSelectedMedia.filter(url => 
        url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
      );
      const videos = newSelectedMedia.filter(url => 
        url.match(/\.(mp4|mov|avi|webm)(\?|$)/i)
      );

      onMediaChange(newSelectedMedia, images, videos);
    } catch (error) {
      console.error('[MediaSelector] Error uploading images:', error);
      Alert.alert('Error', 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (url: string) => {
    const newSelectedMedia = selectedMedia.filter(u => u !== url);
    const images = newSelectedMedia.filter(url => 
      url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
    );
    const videos = newSelectedMedia.filter(url => 
      url.match(/\.(mp4|mov|avi|webm)(\?|$)/i)
    );
    onMediaChange(newSelectedMedia, images, videos);
  };

  return (
    <View style={styles.container}>
      {/* Upload Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: tintColor }]}
          onPress={pickImage}
          disabled={uploading}
        >
          <Ionicons name="images" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Choose Photos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: tintColor }]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Progress */}
      {uploading && (
        <View style={[styles.uploadingBox, { backgroundColor: inputBg, borderColor }]}>
          <ActivityIndicator size="small" color={tintColor} />
          <Text style={[styles.uploadingText, { color: textColor }]}>Uploading...</Text>
        </View>
      )}

      {/* Selected Media Grid */}
      {selectedMedia.length > 0 && (
        <View style={styles.mediaGrid}>
          <Text style={[styles.mediaCount, { color: textColor }]}>
            {selectedMedia.length} / {maxSelection} selected
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedMedia.map((url, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: url }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => removeMedia(url)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={[styles.primaryBadge, { backgroundColor: tintColor }]}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: inputBg, borderColor }]}>
        <Ionicons name="information-circle" size={18} color={tintColor} />
        <Text style={[styles.infoText, { color: placeholderColor }]}>
          The first image will be used as the property thumbnail
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
  },
  mediaGrid: {
    gap: 12,
  },
  mediaCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
