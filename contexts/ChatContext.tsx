import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
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
  initializePropertyChat
} from '@/lib/graphql/mutations';

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

interface ChatContextType {
  // State
  conversations: Conversation[];
  messages: ChatMessage[];
  selectedConversation: Conversation | null;
  unreadCount: number;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;

  // Actions
  loadConversations: () => Promise<Conversation[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  initializeChat: (propertyId: string) => Promise<ChatInitializationData>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  clearMessages: () => void;
  selectConversation: (conversation: Conversation | null) => void;
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
  
  const sendingRef = useRef(false);

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
  const sendMessage = async (conversationId: string, content: string): Promise<void> => {
    if (sendingRef.current) {
      return;
    }

    try {
      sendingRef.current = true;
      setSendingMessage(true);

      const data = await GraphQLClient.executeAuthenticated<{ sendMessage: ChatMessage }>(
        sendMessageMutation,
        {
          input: { conversationId, content }
        }
      );

      const newMessage = data.sendMessage;
      
      // Add message to local state
      setMessages(prev => [...prev, newMessage]);
      
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
  }, [isAuthenticated, user?.userId]); // Add user?.userId to dependency array

  const value: ChatContextType = {
    // State
    conversations,
    messages,
    selectedConversation,
    unreadCount,
    loadingConversations,
    loadingMessages,
    sendingMessage,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    initializeChat,
    markConversationAsRead,
    refreshUnreadCount,
    clearMessages,
    selectConversation,
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
