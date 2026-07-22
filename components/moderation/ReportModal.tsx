import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type ReportType = 'property' | 'user' | 'review' | 'message';

export interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: ReportType;
  targetId: string;
  targetName?: string;
  onSubmit?: (reason: string, details: string) => Promise<void>;
}

const REPORT_REASONS: Record<ReportType, string[]> = {
  property: [
    'Inaccurate or misleading listing',
    'Fraudulent or scam listing',
    'Inappropriate photos',
    'Discriminatory content',
    'Safety concern',
    'Other',
  ],
  user: [
    'Harassment or abusive behavior',
    'Fraudulent activity',
    'Spam or fake account',
    'Inappropriate content',
    'Safety concern',
    'Other',
  ],
  review: [
    'Fake or misleading review',
    'Inappropriate language',
    'Spam or irrelevant content',
    'Harassment',
    'Other',
  ],
  message: [
    'Harassment or threats',
    'Spam',
    'Fraudulent activity',
    'Inappropriate content',
    'Other',
  ],
};

export default function ReportModal({
  visible,
  onClose,
  targetType,
  targetId,
  targetName,
  onSubmit,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const reasons = REPORT_REASONS[targetType];

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for your report');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(selectedReason, details);
      }
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review this and take appropriate action.',
        [{ text: 'OK', onPress: onClose }]
      );
      setSelectedReason(null);
      setDetails('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (targetType) {
      case 'property': return 'Report Listing';
      case 'user': return 'Report User';
      case 'review': return 'Report Review';
      case 'message': return 'Report Message';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {targetName && (
            <Text style={[styles.subtitle, { color: placeholderColor }]}>
              Reporting: {targetName}
            </Text>
          )}

          {/* Reasons */}
          <Text style={[styles.sectionLabel, { color: textColor }]}>
            Why are you reporting this?
          </Text>
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonItem,
                { borderColor },
                selectedReason === reason && { borderColor: tintColor, backgroundColor: `${tintColor}10` },
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={[
                styles.radio,
                { borderColor: selectedReason === reason ? tintColor : borderColor },
              ]}>
                {selectedReason === reason && (
                  <View style={[styles.radioInner, { backgroundColor: tintColor }]} />
                )}
              </View>
              <Text style={[styles.reasonText, { color: textColor }]}>{reason}</Text>
            </TouchableOpacity>
          ))}

          {/* Additional details */}
          <Text style={[styles.sectionLabel, { color: textColor, marginTop: 16 }]}>
            Additional details (optional)
          </Text>
          <TextInput
            style={[styles.textArea, { color: textColor, backgroundColor: inputBg, borderColor }]}
            placeholder="Provide any additional context..."
            placeholderTextColor={placeholderColor}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#dc2626' }]}
            onPress={handleSubmit}
            disabled={isSubmitting || !selectedReason}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonText: {
    fontSize: 15,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 20,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
