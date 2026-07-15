import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createReview } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  onReviewSubmitted?: () => void;
}

const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' as const },
  { key: 'accuracy', label: 'Accuracy', icon: 'checkmark-circle' as const },
  { key: 'communication', label: 'Communication', icon: 'chatbubble' as const },
  { key: 'location', label: 'Location', icon: 'location' as const },
  { key: 'value', label: 'Value', icon: 'cash' as const },
] as const;

export default function ReviewModal({
  visible,
  onClose,
  bookingId,
  propertyId,
  propertyTitle,
  onReviewSubmitted,
}: ReviewModalProps) {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#e5e5e5', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const [ratings, setRatings] = useState<Record<string, number>>({
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    location: 0,
    value: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const overallRating = Math.round(
    Object.values(ratings).reduce((sum, r) => sum + r, 0) / 5
  );

  const allRated = Object.values(ratings).every(r => r > 0);

  const handleSubmit = async () => {
    if (!allRated || !comment.trim()) {
      Alert.alert('Incomplete', 'Please rate all categories and add a comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await GraphQLClient.executeAuthenticated(createReview, {
        input: {
          bookingId,
          propertyId,
          overallRating,
          cleanliness: ratings.cleanliness,
          accuracy: ratings.accuracy,
          communication: ratings.communication,
          location: ratings.location,
          value: ratings.value,
          comment: comment.trim(),
        },
      });
      Alert.alert('Thank you!', 'Your review has been submitted.');
      onReviewSubmitted?.();
      onClose();
    } catch (err: any) {
      console.error('[ReviewModal] Error:', err);
      Alert.alert('Error', err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (category: string, current: number) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => setRatings(prev => ({ ...prev, [category]: star }))}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons
            name={star <= current ? 'star' : 'star-outline'}
            size={28}
            color={star <= current ? '#f59e0b' : border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: border, paddingTop: insets.top || 16 }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: text }]}>Leave a Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Property info */}
          <Text style={[styles.propertyTitle, { color: text }]} numberOfLines={2}>
            {propertyTitle}
          </Text>

          {/* Overall rating display */}
          {allRated && (
            <View style={[styles.overallCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.overallLabel, { color: subtle }]}>Overall Rating</Text>
              <View style={styles.overallRow}>
                <Text style={[styles.overallNum, { color: text }]}>{overallRating}</Text>
                <Ionicons name="star" size={20} color="#f59e0b" />
              </View>
            </View>
          )}

          {/* Category ratings */}
          {CATEGORIES.map(cat => (
            <View key={cat.key} style={[styles.ratingCard, { backgroundColor: card, borderColor: border }]}>
              <View style={styles.ratingHeader}>
                <Ionicons name={cat.icon} size={18} color={tint} />
                <Text style={[styles.ratingLabel, { color: text }]}>{cat.label}</Text>
              </View>
              {renderStars(cat.key, ratings[cat.key])}
            </View>
          ))}

          {/* Comment */}
          <Text style={[styles.commentLabel, { color: text }]}>Your experience</Text>
          <TextInput
            style={[styles.commentInput, { color: text, backgroundColor: card, borderColor: border }]}
            placeholder="Share details about your stay..."
            placeholderTextColor={subtle}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: subtle }]}>{comment.length}/1000</Text>
        </ScrollView>

        {/* Submit button */}
        <View style={[styles.footer, { borderTopColor: border, paddingBottom: insets.bottom || 16 }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: tint, opacity: allRated && comment.trim() ? 1 : 0.5 }]}
            onPress={handleSubmit}
            disabled={!allRated || !comment.trim() || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { padding: 24, paddingBottom: 40 },
  propertyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  overallLabel: { fontSize: 14, fontWeight: '500' },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overallNum: { fontSize: 24, fontWeight: '800' },
  ratingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  ratingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ratingLabel: { fontSize: 15, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 8 },
  commentLabel: { fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
