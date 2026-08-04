import MediaSelector from '@/components/media/MediaSelector';
import { useAlert } from '@/contexts/AlertContext';
import { useOverlayModal } from '@/hooks/useOverlayModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { UpdatePropertyInput } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { publishProperty, updateProperty } from '@/lib/graphql/mutations';
import { getSafeErrorMessage } from '@/lib/utils/errorUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PublishPropertyModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  existingMedia?: string[];
  onSuccess: () => void;
  isLongTerm: boolean;
}

export default function PublishPropertyModal({
  visible,
  onClose,
  propertyId,
  existingMedia = [],
  onSuccess,
  isLongTerm,
}: PublishPropertyModalProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');

  const [selectedMedia, setSelectedMedia] = useState<string[]>(existingMedia);
  const [isPublishing, setIsPublishing] = useState(false);
  const { showAlert } = useAlert();
  const { shouldRender, fadeAnim } = useOverlayModal(visible, onClose);

  const handleMediaChange = (mediaUrls: string[], images: string[], videos: string[]) => {
    setSelectedMedia(images); // Only use images for now
  };

  const handlePublish = async () => {
    if (selectedMedia.length === 0) {
      showAlert({ title: 'Error', message: 'Please select or upload at least one image.', icon: 'warning' });
      return;
    }

    setIsPublishing(true);

    try {
      // Merge existing media with newly selected media
      const mergedImages = Array.from(new Set([...existingMedia, ...selectedMedia]));

      // Update property with media
      const input: UpdatePropertyInput = {
        media: {
          images: mergedImages,
          videos: [],
          floorPlan: '',
          virtualTour: '',
        },
      };

      await GraphQLClient.executeAuthenticated(updateProperty, {
        propertyId,
        input,
      });

      // Publish the property
      const response = await GraphQLClient.executeAuthenticated<{
        publishProperty: { success: boolean; message: string };
      }>(publishProperty, {
        propertyId,
      });

      if (response.publishProperty?.success) {
        showAlert({
          title: 'Success',
          message: 'Your property is now live!',
          icon: 'success',
          buttons: [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                onSuccess();
              },
            },
          ],
        });
      } else {
        throw new Error(response.publishProperty?.message || 'Failed to publish property');
      }
    } catch (error) {
      console.error('Publish failed:', error);
      showAlert({ title: 'Error', message: getSafeErrorMessage(error, 'publishing your property'), icon: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Select Images to Publish
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.infoText, { color: secondaryText }]}>
              Select or upload images for your property. At least one image is required to publish.
            </Text>

            <MediaSelector
              selectedMedia={selectedMedia}
              onMediaChange={handleMediaChange}
              maxSelection={10}
            />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { borderColor }]}
              disabled={isPublishing}
            >
              <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePublish}
              style={[
                styles.publishButton,
                { backgroundColor: tintColor, opacity: isPublishing || selectedMedia.length === 0 ? 0.5 : 1 },
              ]}
              disabled={isPublishing || selectedMedia.length === 0}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.publishButtonText}>Attach & Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 20,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
