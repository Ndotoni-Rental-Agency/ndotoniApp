import { useChat } from '@/contexts/ChatContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useChatDeletion } from '@/hooks/useChatDeletion';
import { ChatMessage } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');
  const myMessageBg = useThemeColor({ light: '#3b82f6', dark: '#2563eb' }, 'tint');
  const theirMessageBg = useThemeColor({ light: '#f3f4f6', dark: '#2c2c2e' }, 'background');

  const {
    messages,
    loadMessages,
    sendMessage,
    markConversationAsRead,
    loadingMessages,
    sendingMessage,
    conversations,
    loadingConversations,
    loadConversations,
  } = useChat();

  const { deleteMessage: deleteChatMessage, isDeletingMessage } = useChatDeletion();

  const [messageText, setMessageText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  // Decode the conversation ID from the URL parameter
  const decodedId = id ? decodeURIComponent(id as string) : '';
  const conversation = conversations.find(c => c.id === decodedId);

  useEffect(() => {
    if (id) {
      // Decode the conversation ID (it was URL-encoded to handle # character)
      console.log('[Conversation] Raw ID from params:', {
        id,
        idType: typeof id,
        isArray: Array.isArray(id),
        idValue: JSON.stringify(id)
      });
      
      const decodedId = decodeURIComponent(id as string);
      console.log('[Conversation] Loading conversation:', {
        encodedId: id,
        decodedId,
        hasHash: decodedId.includes('#'),
        decodedParts: decodedId.split('#')
      });
      // Always try to load messages - the backend will handle authorization
      loadMessages(decodedId);
      markConversationAsRead(decodedId);
    }
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !decodedId) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      await sendMessage(decodedId, text);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(text); // Restore message on error
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteChatMessage(messageId);
            if (success && decodedId) {
              // Reload messages after deletion
              await loadMessages(decodedId);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSelectedMessages = () => {
    const count = selectedMessages.size;
    Alert.alert(
      'Delete Messages',
      `Are you sure you want to delete ${count} message${count > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete all selected messages
            const deletePromises = Array.from(selectedMessages).map(id => 
              deleteChatMessage(id)
            );
            
            await Promise.all(deletePromises);
            
            // Reload messages and conversations list
            if (decodedId) {
              await loadMessages(decodedId);
              await loadConversations(); // Update the conversations list
            }
            
            setSelectionMode(false);
            setSelectedMessages(new Set());
          },
        },
      ]
    );
  };

  const toggleMessageSelection = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
    
    // Exit selection mode if no messages selected
    if (newSelection.size === 0) {
      setSelectionMode(false);
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.isMine;
    const isSelected = selectedMessages.has(item.id);
    const showCheckbox = selectionMode;

    return (
      <View
        style={[
          styles.messageWrapper,
          isMyMessage ? styles.myMessageWrapper : styles.theirMessageWrapper,
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (selectionMode) {
              toggleMessageSelection(item.id);
            }
          }}
          onLongPress={() => {
            if (!selectionMode) {
              setSelectionMode(true);
              setSelectedMessages(new Set([item.id]));
            }
          }}
          activeOpacity={0.7}
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
          ]}
        >
          <View style={styles.messageRow}>
            {/* Selection Checkbox - For all messages */}
            {showCheckbox && (
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  { 
                    borderColor: isSelected ? tintColor : '#d1d5db',
                    backgroundColor: isSelected ? tintColor : 'transparent',
                  }
                ]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </View>
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                {
                  backgroundColor: isMyMessage ? myMessageBg : theirMessageBg,
                },
                isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
              ]}
            >
              {!isMyMessage && (
                <Text style={[styles.senderName, { color: tintColor }]}>
                  {item.senderName}
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  { color: isMyMessage ? '#fff' : textColor },
                ]}
              >
                {item.content}
              </Text>
              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.messageTime,
                    { color: isMyMessage ? 'rgba(255,255,255,0.8)' : secondaryText },
                  ]}
                >
                  {formatTime(item.timestamp)}
                </Text>
                {isMyMessage && (
                  <Ionicons 
                    name="checkmark-done" 
                    size={14} 
                    color="rgba(255,255,255,0.8)" 
                    style={styles.readIcon}
                  />
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        {selectionMode ? (
          <>
            <TouchableOpacity onPress={exitSelectionMode} style={styles.backButton}>
              <Text style={[styles.cancelText, { color: tintColor }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                {selectedMessages.size} Selected
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleDeleteSelectedMessages}
              disabled={selectedMessages.size === 0}
              style={styles.deleteButton}
            >
              <Ionicons 
                name="trash" 
                size={24} 
                color={selectedMessages.size > 0 ? '#ff3b30' : secondaryText} 
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
                {conversation?.otherPartyName || 'Chat'}
              </Text>
              {conversation?.propertyTitle && (
                <Text style={[styles.headerSubtitle, { color: secondaryText }]} numberOfLines={1}>
                  {conversation.propertyTitle}
                </Text>
              )}
            </View>
          </>
        )}
      </View>

      {/* Messages List */}
      {loadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={secondaryText} />
              <Text style={[styles.emptyText, { color: secondaryText }]}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />
      )}

      {/* Input Area - Elevated and Prominent */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
          <View style={[styles.inputWrapper, { backgroundColor, borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={secondaryText}
              multiline
              maxLength={1000}
            />
            {messageText.trim().length > 0 && (
              <Text style={[styles.charCount, { color: secondaryText }]}>
                {messageText.length}/1000
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || sendingMessage}
            style={[
              styles.sendButton,
              { backgroundColor: tintColor },
              (!messageText.trim() || sendingMessage) && styles.sendButtonDisabled,
            ]}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '75%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageContainer: {
    maxWidth: '100%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messageRowNoCheckbox: {
    flexDirection: 'column',
  },
  checkboxContainer: {
    justifyContent: 'center',
    paddingRight: 4,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 24,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    padding: 0,
  },
  charCount: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
