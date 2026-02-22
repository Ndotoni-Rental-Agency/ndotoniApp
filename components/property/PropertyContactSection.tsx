import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PropertyContactSectionProps {
  propertyId: string;
  propertyTitle: string;
  hostWhatsappNumber?: string | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
  backgroundColor: string;
  borderColor: string;
}

export default function PropertyContactSection({
  propertyId,
  propertyTitle,
  hostWhatsappNumber,
  textColor,
  tintColor,
  secondaryText,
  backgroundColor,
  borderColor,
}: PropertyContactSectionProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { initializeChat } = useChat();
  const [isInitializingChat, setIsInitializingChat] = useState(false);

  const handleContactHost = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to contact the property host',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }

    try {
      setIsInitializingChat(true);
      const chatData = await initializeChat(propertyId);

      // Navigate to conversation
      const encodedConversationId = encodeURIComponent(chatData.conversationId);
      router.push(`/conversation/${encodedConversationId}`);
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      
      // Check if it's a "Property not found" error (backend doesn't support short-term properties yet)
      if (error?.message?.includes('Property not found')) {
        Alert.alert(
          'Internal Messaging Not Available',
          hostWhatsappNumber 
            ? 'Internal messaging is not yet available for short-term properties. Please use WhatsApp to contact the host.'
            : 'Internal messaging is not yet available for short-term properties. Please contact support for assistance.',
          [
            hostWhatsappNumber && {
              text: 'Use WhatsApp',
              onPress: handleWhatsAppContact,
            },
            { text: 'OK', style: 'cancel' },
          ].filter(Boolean) as any
        );
      } else {
        Alert.alert('Error', 'Failed to start chat. Please try again or use WhatsApp.');
      }
    } finally {
      setIsInitializingChat(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!hostWhatsappNumber) {
      Alert.alert('Not Available', 'WhatsApp contact is not available for this property');
      return;
    }

    const whatsappUrl = generateWhatsAppUrl(hostWhatsappNumber, propertyTitle, propertyId);

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed.');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Contact Host</Text>
      </View>

      <Text style={[styles.description, { color: secondaryText }]}>
        Have questions? Get in touch with the host
      </Text>

      <View style={styles.buttonsContainer}>
        {/* WhatsApp Button - Primary */}
        {hostWhatsappNumber && (
          <TouchableOpacity
            style={[styles.whatsappButton, { backgroundColor: '#10B981' }]}
            onPress={handleWhatsAppContact}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.whatsappButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}

        {/* Message Host Button - Secondary (not yet supported for short-term) */}
        <TouchableOpacity
          style={[
            styles.contactButton,
            { backgroundColor: hostWhatsappNumber ? backgroundColor : tintColor, borderColor, borderWidth: hostWhatsappNumber ? 1 : 0 },
          ]}
          onPress={handleContactHost}
          disabled={isInitializingChat}
        >
          {isInitializingChat ? (
            <ActivityIndicator size="small" color={hostWhatsappNumber ? textColor : '#fff'} />
          ) : (
            <>
              <Ionicons name="chatbubble" size={20} color={hostWhatsappNumber ? textColor : '#fff'} />
              <Text style={[styles.contactButtonText, { color: hostWhatsappNumber ? textColor : '#fff' }]}>
                Message
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
