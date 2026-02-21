import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { getMediaUploadUrl } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MediaSelectorProps {
  selectedMedia: string[];
  onMediaChange: (mediaUrls: string[], images: string[], videos: string[]) => void;
  maxSelection?: number;
  onAuthRequired?: () => void;
}

export default function MediaSelector({
  selectedMedia,
  onMediaChange,
  maxSelection = 10,
  onAuthRequired,
}: MediaSelectorProps) {
  const { user } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});

  const checkAuthentication = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to upload photos',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => {
              if (onAuthRequired) {
                onAuthRequired();
              }
            }
          },
        ]
      );
      return false;
    }
    return true;
  };

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
    if (!checkAuthentication()) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (selectedMedia.length >= maxSelection) {
      Alert.alert('Limit Reached', `You can select up to ${maxSelection} media items`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxSelection - selectedMedia.length,
      });

      if (!result.canceled && result.assets) {
        await uploadMedia(result.assets);
      }
    } catch (error) {
      console.error('[MediaSelector] Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const takePhoto = async () => {
    if (!checkAuthentication()) return;

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
        await uploadMedia(result.assets);
      }
    } catch (error) {
      console.error('[MediaSelector] Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const generateVideoThumbnail = async (videoUri: string): Promise<string | null> => {
    try {
      const VideoThumbnails = require('expo-video-thumbnails');
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000, // Get frame at 1 second
        quality: 0.8,
      });
      return uri;
    } catch (error) {
      console.error('[MediaSelector] Error generating thumbnail:', error);
      return null;
    }
  };

  const uploadMedia = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploading(true);
    setUploadProgress({ current: 0, total: assets.length });
    
    try {
      const uploadedUrls: string[] = [];
      const newThumbnails: Record<string, string> = { ...videoThumbnails };

      // Upload all assets in parallel for better performance
      const uploadPromises = assets.map(async (asset, index) => {
        const filename = asset.uri.split('/').pop() || 'media.jpg';
        const match = /\.(\w+)$/.exec(filename);
        
        // Determine content type based on file extension or asset type
        let type = 'image/jpeg';
        const isVideo = asset.type === 'video' || (match && ['mp4', 'mov', 'avi', 'webm'].includes(match[1].toLowerCase()));
        
        if (match) {
          const ext = match[1].toLowerCase();
          if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
            type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
          } else {
            type = `image/${ext}`;
          }
        } else if (isVideo) {
          type = 'video/mp4';
        }

        // Generate thumbnail for videos (in parallel)
        let thumbnailPromise: Promise<string | null> | null = null;
        if (isVideo) {
          thumbnailPromise = generateVideoThumbnail(asset.uri);
        }

        // Step 1: Get presigned URL from backend
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

        // Wait for thumbnail if it was being generated
        if (thumbnailPromise) {
          const thumbnailUri = await thumbnailPromise;
          if (thumbnailUri) {
            newThumbnails[fileUrl] = thumbnailUri;
          }
        }

        // Update progress
        setUploadProgress({ current: index + 1, total: assets.length });

        return fileUrl;
      });

      // Wait for all uploads to complete (even if some fail)
      const results = await Promise.allSettled(uploadPromises);
      
      // Collect successful uploads and count failures
      let failedCount = 0;
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          uploadedUrls.push(result.value);
        } else {
          failedCount++;
          console.error('[MediaSelector] Upload failed:', result.reason);
        }
      });

      // Show warning if some uploads failed
      if (failedCount > 0) {
        Alert.alert(
          'Partial Upload',
          `${uploadedUrls.length} file(s) uploaded successfully. ${failedCount} file(s) failed.`,
          [{ text: 'OK' }]
        );
      }

      // Update thumbnails state
      setVideoThumbnails(newThumbnails);

      // Update selected media with successful uploads
      const newSelectedMedia = [...selectedMedia, ...uploadedUrls];
      const images = newSelectedMedia.filter(url => 
        url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
      );
      const videos = newSelectedMedia.filter(url => 
        url.match(/\.(mp4|mov|avi|webm)(\?|$)/i)
      );

      onMediaChange(newSelectedMedia, images, videos);
    } catch (error) {
      console.error('[MediaSelector] Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload media');
    } finally {
      setUploading(false);
      setUploadProgress(null);
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
          <Text style={styles.uploadButtonText}>Choose Media</Text>
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
          <Text style={[styles.uploadingText, { color: textColor }]}>
            {uploadProgress 
              ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
              : 'Uploading...'}
          </Text>
        </View>
      )}

      {/* Selected Media Grid */}
      {selectedMedia.length > 0 && (
        <View style={styles.mediaGrid}>
          <Text style={[styles.mediaCount, { color: textColor }]}>
            {selectedMedia.length} / {maxSelection} selected
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedMedia.map((url, index) => {
              const isVideo = url.match(/\.(mp4|mov|avi|webm)(\?|$)/i);
              const thumbnailUri = isVideo ? videoThumbnails[url] : null;
              
              return (
                <View key={index} style={styles.mediaItem}>
                  <Image 
                    source={{ uri: thumbnailUri || url }} 
                    style={styles.mediaImage} 
                  />
                  {isVideo && (
                    <View style={styles.playIconOverlay}>
                      <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                    </View>
                  )}
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
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: inputBg, borderColor }]}>
        <Ionicons name="information-circle" size={18} color={tintColor} />
        <Text style={[styles.infoText, { color: placeholderColor }]}>
          Upload photos and videos. The first image will be the thumbnail.
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
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
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
