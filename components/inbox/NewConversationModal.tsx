/**
 * New Conversation Modal — search for users and start a direct chat.
 * Ported from ndotoniStays NewConversationModal to React Native.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, StyleSheet, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { searchChatUsers } from '@/lib/graphql/queries';
import { initializeDirectChat } from '@/lib/graphql/mutations';
import { useRouter } from 'expo-router';
import { useChat } from '@/contexts/ChatContext';

interface ChatUser {
  userId: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  profileImage?: string | null;
  userType: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NewConversationModal({ visible, onClose }: Props) {
  const router = useRouter();
  const { loadConversations } = useChat();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');
  const searchBarBg = useThemeColor({ light: '#f3f4f6', dark: '#2c2c2e' }, 'background');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitializing, setIsInitializing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const data = await GraphQLClient.executeAuthenticated<{ searchChatUsers: ChatUser[] }>(
        searchChatUsers,
        { query: searchQuery.trim(), limit: 10 }
      );
      setResults(data.searchChatUsers || []);
    } catch (err) {
      console.error('Error searching chat users:', err);
      setError('Failed to search users. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  };

  const handleSelectUser = async (user: ChatUser) => {
    setIsInitializing(user.userId);
    setError(null);

    try {
      const data = await GraphQLClient.executeAuthenticated<{
        initializeDirectChat: { conversationId: string; targetUserInfo: ChatUser };
      }>(initializeDirectChat, { targetUserId: user.userId });

      const { conversationId } = data.initializeDirectChat;

      // Refresh conversations list
      await loadConversations();

      // Close modal and navigate to the conversation
      handleClose();
      const encodedId = encodeURIComponent(conversationId);
      router.push(`/conversation/${encodedId}`);
    } catch (err: any) {
      console.error('Error initializing direct chat:', err);
      setError(err?.message || 'Failed to start conversation.');
    } finally {
      setIsInitializing(null);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setError(null);
    onClose();
  };

  const getUserDisplayName = (user: ChatUser): string => {
    if (user.businessName) return user.businessName;
    return `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
  };

  const getUserTypeLabel = (userType: string): string => {
    switch (userType) {
      case 'LANDLORD': return 'Host';
      case 'ADMIN': return 'Admin';
      case 'TENANT': return 'Tenant';
      default: return userType;
    }
  };

  const getInitials = (user: ChatUser): string => {
    return `${(user.firstName || '?')[0]}${(user.lastName || '?')[0]}`.toUpperCase();
  };

  const renderUser = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity
      style={[styles.userRow, { backgroundColor: cardBg }]}
      onPress={() => handleSelectUser(item)}
      disabled={isInitializing !== null}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: `${tintColor}20` }]}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarText, { color: tintColor }]}>{getInitials(item)}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
          {getUserDisplayName(item)}
        </Text>
        <Text style={[styles.userType, { color: secondaryText }]}>
          {getUserTypeLabel(item.userType)}
        </Text>
      </View>
      {isInitializing === item.userId ? (
        <ActivityIndicator size="small" color={tintColor} />
      ) : (
        <Ionicons name="chatbubble-outline" size={20} color={secondaryText} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: `${secondaryText}30` }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>New Message</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: searchBarBg }]}>
            <Ionicons name="search" size={18} color={secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search by name..."
              placeholderTextColor={secondaryText}
              value={query}
              onChangeText={handleQueryChange}
              autoFocus
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                <Ionicons name="close-circle" size={18} color={secondaryText} />
              </TouchableOpacity>
            )}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.userId}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isSearching ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={tintColor} />
                <Text style={[styles.emptyText, { color: secondaryText }]}>Searching...</Text>
              </View>
            ) : query.length >= 2 ? (
              <View style={styles.emptyState}>
                <Ionicons name="person-outline" size={48} color={secondaryText} />
                <Text style={[styles.emptyText, { color: secondaryText }]}>
                  No users found for "{query}"
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color={secondaryText} />
                <Text style={[styles.emptyText, { color: secondaryText }]}>
                  Search for a host or admin to start a conversation
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userType: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
