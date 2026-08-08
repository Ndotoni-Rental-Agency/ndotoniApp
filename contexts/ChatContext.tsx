import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GraphQLClient } from '@/lib/graphql-client';
import HybridAuthService from '@/lib/auth/hybrid-auth-service';
import { useAuth } from './AuthContext';
import { Conversation, ChatMessage } from '@/lib/API';
import { 
  getUserConversations, 
  getConversationMessages, 
  getUnreadCount 
} from '@/lib/graphql/queries';
import {
  sendMessage as sendMessageMutation,
  markAsRead,
  initializePropertyChat,
  toggleMessageReaction as toggleMessageReactionMutation,
  sendTypingIndicator as sendTypingIndicatorMutation,
} from '@/lib/graphql/mutations';
import { TypingIndicatorEvent, ConversationReadEvent } from '@/lib/API';

// Lazy-load expo-notifications to avoid bundler crash in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log(e);
  // Not available (e.g. Expo Go)
}

interface LandlordInfo {
  firstName: string;
  lastName: string;
  businessName?: string | null;
  profileImage?: string | null;
}

interface ChatInitializationData {
  conversationId: string;
  landlordInfo: LandlordInfo;
  propertyTitle: string;
  propertyId: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatContextType {
  // State
  conversations: Conversation[];
  messages: ChatMessage[];
  selectedConversation: Conversation | null;
  unreadCount: number;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  typingUser: TypingUser | null;

  // Actions
  loadConversations: () => Promise<Conversation[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, replyToMessageId?: string) => Promise<void>;
  initializeChat: (propertyId: string) => Promise<ChatInitializationData>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  clearMessages: () => void;
  selectConversation: (conversation: Conversation | null) => void;
  addMessageFromSubscription: (message: ChatMessage) => void;
  applyMessageUpdate: (message: ChatMessage) => void;
  applyConversationRead: (event: ConversationReadEvent) => void;
  setTypingUser: (event: TypingIndicatorEvent | null) => void;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUser, setTypingUserState] = useState<TypingUser | null>(null);

  const sendingRef = useRef(false);
  const typingClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSendThrottleRef = useRef(0);

  // The signed-in user's real Cognito sub, fetched once and cached here so incoming
  // subscription messages can compute "is this mine" locally — the chat subscription
  // connects with apiKey auth (see useChatSubscription.ts), which has no identity for
  // AppSync to compute isMine against, so the server-provided value can't be trusted
  // for that channel.
  const myUserIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!user) {
      myUserIdRef.current = undefined;
      return;
    }
    HybridAuthService.getUserId().then(id => { myUserIdRef.current = id; });
  }, [user]);

  // Load conversations
  const loadConversations = async (): Promise<Conversation[]> => {
    if (!user) return [];
    
    try {
      setLoadingConversations(true);
      const data = await GraphQLClient.executeAuthenticated<{ getUserConversations: Conversation[] }>(
        getUserConversations
      );
      const userConversations = data.getUserConversations;
      
      // Debug: Log conversation IDs in detail
      console.log('[ChatContext] ===== getUserConversations Response =====');
      console.log('[ChatContext] Total conversations:', userConversations.length);
      userConversations.forEach((conv, index) => {
        console.log(`[ChatContext] Conversation ${index + 1}:`, {
          id: conv.id,
          idLength: conv.id?.length,
          hasHash: conv.id?.includes('#'),
          idParts: conv.id?.split('#'),
          propertyTitle: conv.propertyTitle,
          otherPartyName: conv.otherPartyName,
          lastMessage: conv.lastMessage?.substring(0, 50),
          unreadCount: conv.unreadCount
        });
      });
      console.log('[ChatContext] ===== End Response =====');
      
      setConversations(userConversations);
      return userConversations;
    } catch (error) {
      console.error('[ChatContext] Error loading conversations:', error);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string): Promise<void> => {
    try {
      console.log('[ChatContext] Loading messages for conversation:', {
        conversationId,
        conversationIdLength: conversationId.length,
        hasHash: conversationId.includes('#'),
        parts: conversationId.split('#')
      });
      setLoadingMessages(true);
      const data = await GraphQLClient.executeAuthenticated<{ getConversationMessages: ChatMessage[] }>(
        getConversationMessages,
        { conversationId }
      );
      const conversationMessages = data.getConversationMessages;
      console.log('[ChatContext] Loaded messages count:', conversationMessages.length);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('[ChatContext] Error loading messages:', error);
      setMessages([]);
      // Don't throw - just set empty messages
      // This prevents crashes when trying to load unauthorized conversations
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string, replyToMessageId?: string): Promise<void> => {
    if (sendingRef.current) {
      return;
    }

    try {
      sendingRef.current = true;
      setSendingMessage(true);

      const data = await GraphQLClient.executeAuthenticated<{ sendMessage: ChatMessage }>(
        sendMessageMutation,
        {
          input: { conversationId, content, replyToMessageId }
        }
      );

      const newMessage = data.sendMessage;

      // Add message to local state — unless the subscription echo already beat us here
      setMessages(prev => prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage]);
      
      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { 
                ...conv, 
                lastMessage: content,
                lastMessageTime: newMessage.timestamp,
                updatedAt: newMessage.timestamp
              }
            : conv
        ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
      );

    } catch (error) {
      console.error('[ChatContext] Error sending message:', error);
      throw error;
    } finally {
      sendingRef.current = false;
      setSendingMessage(false);
    }
  };

  // Initialize chat for a property
  const initializeChat = async (propertyId: string): Promise<ChatInitializationData> => {
    try {
      console.log('[ChatContext] Initializing chat for property:', propertyId);
      const data = await GraphQLClient.executeAuthenticated<{ 
        initializePropertyChat: ChatInitializationData 
      }>(
        initializePropertyChat,
        { propertyId }
      );
      
      const chatData = data.initializePropertyChat;
      
      console.log('[ChatContext] Chat initialized:', {
        conversationId: chatData.conversationId,
        propertyId: chatData.propertyId,
        landlordName: `${chatData.landlordInfo.firstName} ${chatData.landlordInfo.lastName}`
      });
      
      if (!chatData) {
        throw new Error('Failed to initialize chat');
      }

      // Refresh conversations to include the new one
      await loadConversations();

      return chatData;
    } catch (error) {
      console.error('[ChatContext] Error initializing chat:', error);
      throw error;
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string): Promise<void> => {
    try {
      await GraphQLClient.executeAuthenticated<{ markAsRead: Conversation }>(
        markAsRead,
        { conversationId }
      );

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      // Refresh unread count
      refreshUnreadCount();
    } catch (error) {
      console.warn('[ChatContext] Error marking as read (non-critical):', error);
      // Don't throw - just log the error
      // This is non-critical and shouldn't block the user from viewing messages
      // We'll still update the local state optimistically
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  // Refresh unread count
  const refreshUnreadCount = async (): Promise<void> => {
    if (!user) return;

    try {
      const data = await GraphQLClient.executeAuthenticated<{ getUnreadCount: number }>(
        getUnreadCount
      );
      const count = data.getUnreadCount;
      setUnreadCount(count);
    } catch (error) {
      console.error('[ChatContext] Error fetching unread count:', error);
    }
  };

  // Clear messages
  const clearMessages = (): void => {
    setMessages([]);
  };

  // Select conversation
  const selectConversation = (conversation: Conversation | null): void => {
    setSelectedConversation(conversation);
  };

  // Add a message received from a real-time subscription
  const addMessageFromSubscription = (message: ChatMessage): void => {
    // The subscription connects with apiKey auth, so its server-computed isMine can't be
    // trusted (no identity to compute it against). Recompute from senderId against the
    // real signed-in user id when we have both; otherwise fall back to whatever the
    // server sent (e.g. the brief window before myUserIdRef has loaded).
    const resolvedIsMine =
      message.senderId && myUserIdRef.current
        ? message.senderId === myUserIdRef.current
        : message.isMine;
    const resolvedMessage = { ...message, isMine: resolvedIsMine };

    // Avoid duplicates (e.g. if the same message arrives via both subscription and the
    // sendMessage mutation response)
    setMessages(prev => {
      if (prev.some(m => m.id === resolvedMessage.id)) {
        return prev;
      }
      return [...prev, resolvedMessage];
    });

    // Update the conversation's last message in the list
    setConversations(prev =>
      prev.map(conv =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              updatedAt: message.timestamp,
            }
          : conv
      ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    );
  };

  // Apply an update to an existing message (currently: reactions) — find-and-replace
  // rather than append, since this is never a brand-new message.
  const applyMessageUpdate = (message: ChatMessage): void => {
    const resolvedIsMine =
      message.senderId && myUserIdRef.current
        ? message.senderId === myUserIdRef.current
        : message.isMine;
    const resolvedMessage = { ...message, isMine: resolvedIsMine };

    setMessages(prev => prev.map(m => (m.id === resolvedMessage.id ? resolvedMessage : m)));
  };

  // Apply a live read-receipt update: mark our own sent messages up to readAt as
  // read, but only when the read happened on the OTHER side — us marking our own
  // conversation as read doesn't affect our own sent messages' tick status.
  const applyConversationRead = (event: ConversationReadEvent): void => {
    if (event.readByUserId === myUserIdRef.current) return;

    setMessages(prev =>
      prev.map(m =>
        m.conversationId === event.conversationId && m.isMine && m.timestamp <= event.readAt
          ? { ...m, readAt: event.readAt }
          : m
      )
    );
  };

  // Show/clear the live typing indicator. Ignores our own echo and auto-clears
  // a few seconds after the last event, since there's no explicit "stopped typing"
  // signal — the sender just stops re-broadcasting.
  const setTypingUser = (event: TypingIndicatorEvent | null): void => {
    if (typingClearTimerRef.current) {
      clearTimeout(typingClearTimerRef.current);
      typingClearTimerRef.current = null;
    }

    if (!event || event.userId === myUserIdRef.current) {
      setTypingUserState(null);
      return;
    }

    setTypingUserState({ userId: event.userId, userName: event.userName });
    typingClearTimerRef.current = setTimeout(() => setTypingUserState(null), 4000);
  };

  // Toggle the current user's reaction on a message. Optimistic-ish: we don't
  // pre-apply locally, the onMessageUpdated echo (or the mutation response here)
  // updates state — simpler and avoids a second place that can drift from the
  // server's actual reaction list.
  const toggleReaction = async (messageId: string, emoji: string): Promise<void> => {
    try {
      const data = await GraphQLClient.executeAuthenticated<{ toggleMessageReaction: ChatMessage }>(
        toggleMessageReactionMutation,
        { messageId, emoji }
      );
      applyMessageUpdate(data.toggleMessageReaction);
    } catch (error) {
      console.error('[ChatContext] Error toggling reaction:', error);
    }
  };

  // Broadcast a typing event. Fire-and-forget, throttled so rapid keystrokes
  // don't spam a mutation call per character.
  const sendTypingIndicator = (conversationId: string): void => {
    const now = Date.now();
    if (now - typingSendThrottleRef.current < 3000) return;
    typingSendThrottleRef.current = now;

    GraphQLClient.executeAuthenticated(sendTypingIndicatorMutation, { conversationId }).catch(() => {
      // Non-critical — a missed typing event just means the other side doesn't see it this time
    });
  };

  // Keep the OS app icon badge in sync with the real unread count.
  // The backend sends a hardcoded badge value with every push, which iOS/Android
  // then applies verbatim and never clears on its own — so we own the source of
  // truth here and overwrite it any time unreadCount changes (poll, foreground,
  // mark-as-read, logout).
  useEffect(() => {
    Notifications?.setBadgeCountAsync(unreadCount).catch(() => {});
  }, [unreadCount]);

  // Set up initial load when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setConversations([]);
      setMessages([]);
      setSelectedConversation(null);
      return;
    }

    // Clear any previously selected conversation when user changes
    setSelectedConversation(null);
    setMessages([]);

    // Initial load
    loadConversations();
    refreshUnreadCount();
  }, [isAuthenticated]);

  // Poll conversations and unread count while app is in foreground
  useEffect(() => {
    if (!isAuthenticated) return;

    const POLL_INTERVAL = 30000; // 30 seconds
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let appStateRef = AppState.currentState;

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        loadConversations();
        refreshUnreadCount();
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Start polling when authenticated
    startPolling();

    // Pause when backgrounded, resume + refresh when foregrounded
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.match(/inactive|background/) && nextState === 'active') {
        // App came to foreground — refresh immediately and resume polling
        loadConversations();
        refreshUnreadCount();
        startPolling();
      } else if (nextState.match(/inactive|background/)) {
        stopPolling();
      }
      appStateRef = nextState;
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [isAuthenticated]);

  const value: ChatContextType = {
    // State
    conversations,
    messages,
    selectedConversation,
    unreadCount,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    typingUser,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    initializeChat,
    markConversationAsRead,
    refreshUnreadCount,
    clearMessages,
    selectConversation,
    addMessageFromSubscription,
    applyMessageUpdate,
    applyConversationRead,
    setTypingUser,
    toggleReaction,
    sendTypingIndicator,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
