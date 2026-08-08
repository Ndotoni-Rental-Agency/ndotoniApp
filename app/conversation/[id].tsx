import { useAlert } from '@/contexts/AlertContext';
import { useChat } from '@/contexts/ChatContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useChatDeletion } from '@/hooks/useChatDeletion';
import {
  useChatSubscription,
  useMessageUpdatedSubscription,
  useTypingIndicatorSubscription,
  useConversationReadSubscription,
  SubscriptionMessage,
  SubscriptionTypingEvent,
  SubscriptionReadEvent,
} from '@/hooks/useChatSubscription';
import { ChatMessage } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { checkConversationBlockStatus } from '@/lib/graphql/queries';
import { reportUser as reportUserMutation } from '@/lib/graphql/mutations';
import { toggleBlockUser as toggleBlockMutation } from '@/lib/graphql/mutations';
import ReportModal from '@/components/moderation/ReportModal';
import BlockUserModal from '@/components/moderation/BlockUserModal';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import BrandLoader from '@/components/ui/BrandLoader';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

type ListItem =
  | { type: 'date'; id: string; label: string }
  | { type: 'message'; id: string; message: ChatMessage; showSender: boolean };

function formatDateLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  if (date.getFullYear() !== today.getFullYear()) options.year = 'numeric';
  return date.toLocaleDateString('en-US', options);
}

function toReactions(reactions?: Array<{ emoji: string; userIds: string[] }> | null): ChatMessage['reactions'] {
  return reactions?.map(r => ({ ...r, __typename: 'MessageReaction' as const }));
}

function buildListItems(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDateKey = '';
  let lastSenderId: string | null | undefined = undefined;

  messages.forEach((message) => {
    const dateKey = new Date(message.timestamp).toDateString();
    if (dateKey !== lastDateKey) {
      items.push({ type: 'date', id: `date-${dateKey}`, label: formatDateLabel(message.timestamp) });
      lastDateKey = dateKey;
      lastSenderId = undefined;
    }
    const showSender = !message.isMine && message.senderId !== lastSenderId;
    items.push({ type: 'message', id: message.id, message, showSender });
    lastSenderId = message.senderId;
  });

  return items;
}

export default function ConversationScreen() {
  const { id, draft } = useLocalSearchParams<{ id: string; draft?: string }>();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const myMessageBg = useThemeColor({ light: '#3b82f6', dark: '#2563eb' }, 'tint');
  const theirMessageBg = useThemeColor({ light: '#f0f1f3', dark: '#26282c' }, 'card');
  const chatAreaBg = useThemeColor({ light: '#f7f5f2' }, 'background');

  const {
    messages,
    loadMessages,
    sendMessage,
    markConversationAsRead,
    loadingMessages,
    sendingMessage,
    conversations,
    loadConversations,
    addMessageFromSubscription,
    applyMessageUpdate,
    applyConversationRead,
    typingUser,
    setTypingUser,
    toggleReaction,
    sendTypingIndicator,
  } = useChat();

  const { deleteMessage: deleteChatMessage } = useChatDeletion();
  const { showAlert } = useAlert();

  const [messageText, setMessageText] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlockedOther, setHasBlockedOther] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [actionSheetFor, setActionSheetFor] = useState<ChatMessage | null>(null);
  const [reactionPickerFor, setReactionPickerFor] = useState<ChatMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const draftApplied = useRef(false);

  // Pre-fill message input with draft from navigation (e.g. property inquiry)
  useEffect(() => {
    if (draft && !draftApplied.current) {
      setMessageText(decodeURIComponent(draft));
      draftApplied.current = true;
    }
  }, [draft]);

  // Decode the conversation ID from the URL parameter
  const decodedId = id ? decodeURIComponent(id as string) : '';
  const conversation = conversations.find(c => c.id === decodedId);

  const listItems = useMemo(() => buildListItems(messages), [messages]);
  const messageIndexById = useMemo(() => {
    const map = new Map<string, number>();
    listItems.forEach((item, index) => {
      if (item.type === 'message') map.set(item.id, index);
    });
    return map;
  }, [listItems]);
  // FlatList sticks these indices to the top while their section scrolls by —
  // the date pill behaves like WhatsApp's sticky day headers.
  const stickyDateIndices = useMemo(
    () => listItems.reduce<number[]>((acc, item, index) => {
      if (item.type === 'date') acc.push(index);
      return acc;
    }, []),
    [listItems]
  );

  // Check block status when conversation loads
  useEffect(() => {
    if (!decodedId) return;
    let cancelled = false;

    (async () => {
      try {
        const result = await GraphQLClient.executeAuthenticated(checkConversationBlockStatus, {
          conversationId: decodedId,
        });
        if (cancelled) return;
        const status = result?.checkConversationBlockStatus;
        if (status) {
          setIsBlocked(!status.canMessage);
          setHasBlockedOther(status.hasBlocked);
        }
      } catch (err) {
        // Fail open — don't prevent messaging on query failure
        console.warn('[Conversation] Block status check failed:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [decodedId]);

  // Real-time subscription for new messages
  const handleNewMessage = useCallback((message: SubscriptionMessage) => {
    // Add the message to the chat context (deduplication by ID handles messages we sent ourselves).
    // senderId is passed through so the context can compute isMine itself against the signed-in
    // user's real id — the subscription connects with apiKey auth, which has no identity for
    // AppSync to compute isMine against, so message.isMine here can't be trusted on its own.
    addMessageFromSubscription({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      timestamp: message.timestamp,
      isRead: message.isRead,
      isMine: message.isMine,
      replyToMessageId: message.replyToMessageId,
      replyToContent: message.replyToContent,
      replyToSenderName: message.replyToSenderName,
      reactions: toReactions(message.reactions),
      readAt: message.readAt,
      __typename: 'ChatMessage',
    });
    // A new message from the other party means they're done typing
    setTypingUser(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useChatSubscription({
    conversationId: decodedId || null,
    onMessageReceived: handleNewMessage,
    enabled: !!decodedId,
  });

  const handleMessageUpdated = useCallback((message: SubscriptionMessage) => {
    applyMessageUpdate({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      timestamp: message.timestamp,
      isRead: message.isRead,
      isMine: message.isMine,
      replyToMessageId: message.replyToMessageId,
      replyToContent: message.replyToContent,
      replyToSenderName: message.replyToSenderName,
      reactions: toReactions(message.reactions),
      readAt: message.readAt,
      __typename: 'ChatMessage',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useMessageUpdatedSubscription({
    conversationId: decodedId || null,
    onMessageUpdated: handleMessageUpdated,
    enabled: !!decodedId,
  });

  const handleTypingReceived = useCallback((event: SubscriptionTypingEvent) => {
    setTypingUser({ ...event, __typename: 'TypingIndicatorEvent' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useTypingIndicatorSubscription({
    conversationId: decodedId || null,
    onTypingReceived: handleTypingReceived,
    enabled: !!decodedId,
  });

  const handleConversationRead = useCallback((event: SubscriptionReadEvent) => {
    applyConversationRead(event);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useConversationReadSubscription({
    conversationId: decodedId || null,
    onConversationRead: handleConversationRead,
    enabled: !!decodedId,
  });

  useEffect(() => {
    if (id) {
      const decodedId = decodeURIComponent(id as string);
      // Always try to load messages - the backend will handle authorization
      loadMessages(decodedId);
      markConversationAsRead(decodedId);
    }
    // Clear any stale typing indicator when switching conversations
    setTypingUser(null);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleReportUser = async (reason: string, details: string) => {
    if (!decodedId) {
      throw new Error('Unable to identify this conversation.');
    }
    await GraphQLClient.executeAuthenticated(reportUserMutation, {
      input: {
        conversationId: decodedId,
        reason,
        details: details || undefined,
      },
    });
  };

  const handleBlockUser = async () => {
    if (!decodedId) {
      throw new Error('Unable to identify this conversation.');
    }
    await GraphQLClient.executeAuthenticated(toggleBlockMutation, {
      input: {
        conversationId: decodedId,
        action: 'BLOCK',
      },
    });
    // Update local block state immediately
    setIsBlocked(true);
    setHasBlockedOther(true);
    // Refresh conversations — the blocked conversation should disappear from the list
    await loadConversations();
  };

  const handleUnblockUser = () => {
    showAlert({
      title: 'Unblock User',
      message: `Unblock ${conversation?.otherPartyName || 'this user'}? You'll be able to message each other again.`,
      icon: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await GraphQLClient.executeAuthenticated(toggleBlockMutation, {
                input: {
                  conversationId: decodedId,
                  action: 'UNBLOCK',
                },
              });
              setIsBlocked(false);
              setHasBlockedOther(false);
            } catch (err: any) {
              showAlert({ title: 'Error', message: err?.message || 'Something went wrong. Please try again.', icon: 'error' });
            }
          },
        },
      ],
    });
  };

  const handleShowModerationMenu = () => {
    showAlert({
      title: conversation?.otherPartyName || 'User',
      message: 'What would you like to do?',
      icon: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block User', style: 'destructive', onPress: () => setShowBlockModal(true) },
        { text: 'Report User', onPress: () => setShowReportModal(true) },
      ],
    });
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    if (text.trim() && decodedId) {
      sendTypingIndicator(decodedId);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !decodedId) return;

    const text = messageText.trim();
    const replyToMessageId = replyingTo?.id;
    setMessageText('');
    setReplyingTo(null);

    try {
      await sendMessage(decodedId, text, replyToMessageId);
    } catch (error: any) {
      console.error('Error sending message:', error);
      showAlert({ title: 'Error', message: error?.message || 'Something went wrong. Please try again.', icon: 'error' });
      setMessageText(text); // Restore message on error
    }
  };

  const handleDeleteSelectedMessages = () => {
    const count = selectedMessages.size;
    showAlert({
      title: 'Delete Messages',
      message: `Are you sure you want to delete ${count} message${count > 1 ? 's' : ''}?`,
      icon: 'delete',
      buttons: [
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
      ],
    });
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

  const scrollToMessage = (messageId: string) => {
    const index = messageIndexById.get(messageId);
    if (index === undefined) return;
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
    } catch {
      // Item not measured yet — ignore, best-effort feature
    }
  };

  const openActionSheet = (message: ChatMessage) => {
    if (selectionMode) return;
    setActionSheetFor(message);
  };

  /**
   * Render message content with clickable links.
   * URLs matching ndotonistays.com/property/* navigate in-app; others open externally.
   */
  const renderMessageContent = (content: string, isMyMessage: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    if (parts.length === 1) return content;

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Reset lastIndex since we reuse the regex
        urlRegex.lastIndex = 0;
        return (
          <Text
            key={index}
            style={{ textDecorationLine: 'underline', color: isMyMessage ? '#fff' : tintColor }}
            onPress={() => {
              // In-app navigation for ndotoni property links
              const propertyMatch = part.match(/ndotonistays\.com\/property\/([^\s?#]+)/);
              if (propertyMatch) {
                router.push(`/short-property/${propertyMatch[1]}` as any);
              } else {
                Linking.openURL(part);
              }
            }}
          >
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderReplyPreview = (item: ChatMessage, isMyMessage: boolean) => {
    if (!item.replyToContent) return null;
    return (
      <TouchableOpacity
        onPress={() => item.replyToMessageId && scrollToMessage(item.replyToMessageId)}
        activeOpacity={0.7}
        style={[
          styles.replyPreview,
          { borderLeftColor: isMyMessage ? 'rgba(255,255,255,0.7)' : tintColor },
          { backgroundColor: isMyMessage ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)' },
        ]}
      >
        <Text
          style={[styles.replyPreviewSender, { color: isMyMessage ? 'rgba(255,255,255,0.9)' : tintColor }]}
          numberOfLines={1}
        >
          {item.replyToSenderName}
        </Text>
        <Text
          style={[styles.replyPreviewContent, { color: isMyMessage ? 'rgba(255,255,255,0.75)' : secondaryText }]}
          numberOfLines={1}
        >
          {item.replyToContent}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReactions = (item: ChatMessage) => {
    if (!item.reactions || item.reactions.length === 0) return null;
    return (
      <View style={styles.reactionsRow}>
        {item.reactions.map(r => (
          <TouchableOpacity
            key={r.emoji}
            onPress={() => toggleReaction(item.id, r.emoji)}
            style={[styles.reactionPill, { backgroundColor: cardBg, borderColor }]}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{r.emoji}</Text>
            {r.userIds.length > 1 && (
              <Text style={[styles.reactionCount, { color: secondaryText }]}>{r.userIds.length}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMessage = (item: ChatMessage, showSender: boolean) => {
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
          onLongPress={() => openActionSheet(item)}
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

            <View style={{ maxWidth: '100%' }}>
              {showSender && !isMyMessage && (
                <Text style={[styles.senderNameAbove, { color: secondaryText }]}>
                  {item.senderName}
                </Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  { backgroundColor: isMyMessage ? myMessageBg : theirMessageBg },
                  isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
                ]}
              >
                {renderReplyPreview(item, isMyMessage)}
                <Text
                  style={[
                    styles.messageText,
                    { color: isMyMessage ? '#fff' : textColor },
                  ]}
                >
                  {renderMessageContent(item.content, isMyMessage)}
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
                      color={item.readAt ? '#7dd3fc' : 'rgba(255,255,255,0.8)'}
                      style={styles.readIcon}
                    />
                  )}
                </View>
              </View>
              {renderReactions(item)}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparatorRow}>
          <View style={[styles.dateSeparatorPill, { backgroundColor: cardBg }]}>
            <Text style={[styles.dateSeparatorText, { color: secondaryText }]}>{item.label}</Text>
          </View>
        </View>
      );
    }
    return renderMessage(item.message, item.showSender);
  };

  const isMyMessageInActionSheet = actionSheetFor?.isMine;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
                {conversation?.otherPartyName || 'Chat'}
              </Text>
              <Text style={[styles.headerSubtitle, { color: secondaryText }]} numberOfLines={1}>
                {typingUser ? 'typing…' : conversation?.propertyTitle || ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleShowModerationMenu}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Ionicons name="ellipsis-vertical" size={22} color={textColor} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
      >
      {loadingMessages ? (
        <View style={[styles.loadingContainer, { backgroundColor: chatAreaBg }]}>
          <BrandLoader />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={{ backgroundColor: chatAreaBg }}
          data={listItems}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          stickyHeaderIndices={stickyDateIndices}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
            }, 50);
          }}
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
        {isBlocked ? (
          <View style={[styles.blockedBanner, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
            <Ionicons name="ban-outline" size={20} color="#ef4444" />
            <Text style={[styles.blockedText, { color: secondaryText }]}>
              {hasBlockedOther
                ? 'You blocked this user.'
                : 'You cannot message this user.'}
            </Text>
            {hasBlockedOther && (
              <TouchableOpacity
                onPress={handleUnblockUser}
                style={[styles.unblockButton, { borderColor: tintColor }]}
              >
                <Text style={[styles.unblockButtonText, { color: tintColor }]}>Unblock</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
        <View>
          {replyingTo && (
            <View style={[styles.replyBar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
              <View style={[styles.replyBarAccent, { backgroundColor: tintColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.replyBarSender, { color: tintColor }]} numberOfLines={1}>
                  Replying to {replyingTo.isMine ? 'yourself' : replyingTo.senderName}
                </Text>
                <Text style={[styles.replyBarContent, { color: secondaryText }]} numberOfLines={1}>
                  {replyingTo.content}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={secondaryText} />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.inputContainer, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
            <View style={[styles.inputWrapper, { backgroundColor: theirMessageBg }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={messageText}
                onChangeText={handleTextChange}
                placeholder="Message"
                placeholderTextColor={secondaryText}
                multiline
                maxLength={1000}
              />
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
                <Ionicons name="arrow-up" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        )}
      </KeyboardAvoidingView>

      {/* Message action sheet — long-press on a bubble */}
      <Modal
        visible={!!actionSheetFor}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheetFor(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActionSheetFor(null)}
        >
          <View style={[styles.actionSheet, { backgroundColor: cardBg }]}>
            <View style={styles.quickReactionsRow}>
              {QUICK_REACTIONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.quickReactionButton}
                  onPress={() => {
                    if (actionSheetFor) toggleReaction(actionSheetFor.id, emoji);
                    setActionSheetFor(null);
                  }}
                >
                  <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.quickReactionButton}
                onPress={() => {
                  setReactionPickerFor(actionSheetFor);
                  setActionSheetFor(null);
                }}
              >
                <Ionicons name="add-circle-outline" size={26} color={secondaryText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={() => {
                setReplyingTo(actionSheetFor);
                setActionSheetFor(null);
              }}
            >
              <Ionicons name="arrow-undo-outline" size={20} color={textColor} />
              <Text style={[styles.actionSheetItemText, { color: textColor }]}>Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={() => {
                setSelectionMode(true);
                if (actionSheetFor) setSelectedMessages(new Set([actionSheetFor.id]));
                setActionSheetFor(null);
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={textColor} />
              <Text style={[styles.actionSheetItemText, { color: textColor }]}>Select</Text>
            </TouchableOpacity>

            {isMyMessageInActionSheet && (
              <TouchableOpacity
                style={styles.actionSheetItem}
                onPress={() => {
                  const target = actionSheetFor;
                  setActionSheetFor(null);
                  if (target) {
                    setSelectedMessages(new Set([target.id]));
                    handleDeleteSelectedMessages();
                  }
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={[styles.actionSheetItemText, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full emoji picker — "+" from the quick reactions row */}
      <Modal
        visible={!!reactionPickerFor}
        transparent
        animationType="fade"
        onRequestClose={() => setReactionPickerFor(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setReactionPickerFor(null)}
        >
          <View style={[styles.emojiPickerSheet, { backgroundColor: cardBg }]}>
            <Text style={[styles.emojiPickerTitle, { color: textColor }]}>React with</Text>
            <View style={styles.emojiGrid}>
              {['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😍', '😢', '😡'].map((emoji, index) => (
                <TouchableOpacity
                  key={`${emoji}-${index}`}
                  style={styles.emojiGridButton}
                  onPress={() => {
                    if (reactionPickerFor) toggleReaction(reactionPickerFor.id, emoji);
                    setReactionPickerFor(null);
                  }}
                >
                  <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report User Modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="user"
        targetId={decodedId}
        targetName={conversation?.otherPartyName}
        onSubmit={handleReportUser}
      />

      {/* Block User Modal */}
      <BlockUserModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={conversation?.otherPartyName || 'this user'}
        onBlock={handleBlockUser}
      />
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
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageWrapper: {
    marginBottom: 6,
    maxWidth: '80%',
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
    alignItems: 'flex-end',
    gap: 10,
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
  senderNameAbove: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
    marginLeft: 14,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  myMessageBubble: {
    borderBottomRightRadius: 5,
  },
  theirMessageBubble: {
    borderBottomLeftRadius: 5,
  },
  replyPreview: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  replyPreviewSender: {
    fontSize: 12,
    fontWeight: '700',
  },
  replyPreviewContent: {
    fontSize: 12,
    marginTop: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 2,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
    paddingHorizontal: 4,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '600',
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
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  replyBarAccent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  replyBarSender: {
    fontSize: 13,
    fontWeight: '700',
  },
  replyBarContent: {
    fontSize: 13,
    marginTop: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  input: {
    fontSize: 16,
    lineHeight: 21,
    padding: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  blockedText: {
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  quickReactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  quickReactionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickReactionEmoji: {
    fontSize: 26,
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  actionSheetItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emojiPickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emojiPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiGridButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
});
