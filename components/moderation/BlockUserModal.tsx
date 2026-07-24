import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface BlockUserModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  onBlock?: () => Promise<void>;
}

export default function BlockUserModal({
  visible,
  onClose,
  userName,
  onBlock,
}: BlockUserModalProps) {
  const [isBlocking, setIsBlocking] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      if (onBlock) {
        await onBlock();
      }
      Alert.alert(
        'User Blocked',
        `${userName} has been blocked. You will no longer see their content or receive messages from them. Our team has been notified.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { backgroundColor }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="ban" size={40} color="#dc2626" />
          </View>

          <Text style={[styles.title, { color: textColor }]}>Block {userName}?</Text>

          <Text style={[styles.description, { color: placeholderColor }]}>
            When you block someone:{'\n\n'}
            {'\u2022'} They won't be able to message you{'\n'}
            {'\u2022'} Their listings will be hidden from your feed{'\n'}
            {'\u2022'} Our moderation team will be notified{'\n'}
            {'\u2022'} You can unblock them later from Settings
          </Text>

          <TouchableOpacity
            style={[styles.blockButton]}
            onPress={handleBlock}
            disabled={isBlocking}
          >
            {isBlocking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.blockButtonText}>Block {userName}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  blockButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
