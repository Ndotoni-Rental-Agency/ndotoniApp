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
      setLoadingMessages(true);
      const data = await GraphQLClient.executeAuthenticated<{ getConversationMessages: ChatMessage[] }>(
        getConversationMessages,
        { conversationId }
      );
      const conversationMessages = data.getConversationMessages;
      setMessages(conversationMessages);
    } catch (error) {
      console.error('[ChatContext] Error loading messages:', error);
      setMessages([]);
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
      const data = await GraphQLClient.executeAuthenticated<{ 
        initializePropertyChat: ChatInitializationData 
      }>(
        initializePropertyChat,
        { propertyId }
      );
      
      const chatData = data.initializePropertyChat;
      
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
      console.error('[ChatContext] Error marking as read:', error);
      throw error;
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

    // Initial load
    loadConversations();
    refreshUnreadCount();
  }, [isAuthenticated, user]);

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
