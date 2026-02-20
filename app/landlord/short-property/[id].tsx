import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useShortTermPropertyDetail } from '@/hooks/propertyDetails/useShortTermPropertyDetail';
import MediaSelector from '@/components/media/MediaSelector';

export default function EditShortTermPropertyScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { property, loading, error } = useShortTermPropertyDetail(propertyId);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    nightlyRate: '',
    cleaningFee: '',
    maxGuests: '',
    minimumStay: '',
    instantBookEnabled: false,
  });

  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        nightlyRate: property.nightlyRate?.toString() || '',
        cleaningFee: property.cleaningFee?.toString() || '',
        maxGuests: property.maxGuests?.toString() || '',
        minimumStay: property.minimumStay?.toString() || '',
        instantBookEnabled: property.instantBookEnabled ?? false,
      });

      const images = property.images || [];
      const videos = property.videos || [];
      setSelectedMedia([...images, ...videos]);
      setSelectedImages(images);
      setSelectedVideos(videos);
    }
  }, [property]);

  const handleSave = async () => {
    Alert.alert('Save Changes', 'Property update functionality coming soon!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete', 'Property deletion functionality coming soon!');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={[styles.errorText, { color: textColor }]}>{error || 'Property not found'}</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Property</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : (
            <Ionicons name="checkmark" size={24} color={tintColor} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Property Title</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
            placeholder="e.g., Cozy beachfront villa"
            placeholderTextColor={placeholderColor}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { color: textColor, backgroundColor: cardBg, borderColor }]}
            placeholder="Describe your property..."
            placeholderTextColor={placeholderColor}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Nightly Rate (TZS)</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
            placeholder="e.g., 50000"
            placeholderTextColor={placeholderColor}
            value={formData.nightlyRate}
            onChangeText={(text) => setFormData({ ...formData, nightlyRate: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={[styles.label, { color: textColor }]}>Cleaning Fee</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              placeholder="Optional"
              placeholderTextColor={placeholderColor}
              value={formData.cleaningFee}
              onChangeText={(text) => setFormData({ ...formData, cleaningFee: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={[styles.label, { color: textColor }]}>Min. Stay (nights)</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
              value={formData.minimumStay}
              onChangeText={(text) => setFormData({ ...formData, minimumStay: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Max Guests */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Maximum Guests</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
            value={formData.maxGuests}
            onChangeText={(text) => setFormData({ ...formData, maxGuests: text })}
            keyboardType="numeric"
          />
        </View>

        {/* Instant Book */}
        <View style={[styles.section, styles.switchRow]}>
          <View style={styles.switchLabel}>
            <Text style={[styles.label, { color: textColor }]}>Instant Book</Text>
            <Text style={[styles.switchSubtext, { color: placeholderColor }]}>
              Allow guests to book without approval
            </Text>
          </View>
          <Switch
            value={formData.instantBookEnabled}
            onValueChange={(value) => setFormData({ ...formData, instantBookEnabled: value })}
            trackColor={{ false: borderColor, true: tintColor }}
            thumbColor="#fff"
          />
        </View>

        {/* Media */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Photos & Videos</Text>
          <MediaSelector
            selectedMedia={selectedMedia}
            onMediaChange={(mediaUrls, images, videos) => {
              setSelectedMedia(mediaUrls);
              setSelectedImages(images);
              setSelectedVideos(videos);
            }}
            maxSelection={10}
            onAuthRequired={() => {}}
          />
        </View>

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: '#ef4444' }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Property</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
  },
  switchSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
