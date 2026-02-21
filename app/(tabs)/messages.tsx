import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import VerifyEmailModal from '@/components/auth/VerifyEmailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useChatDeletion } from '@/hooks/useChatDeletion';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, PanResponder, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SwipeableConversationCardProps {
  conversation: any;
  onPress: () => void;
  onDelete: () => void;
  backgroundColor: string;
  textColor: string;
  secondaryText: string;
  tintColor: string;
  formatTime: (timestamp: string) => string;
}

function SwipeableConversationCard({
  conversation,
  onPress,
  onDelete,
  backgroundColor,
  textColor,
  secondaryText,
  tintColor,
  formatTime,
}: SwipeableConversationCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(lastOffset.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping left (negative values)
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        
        // If swiped more than 80px, show delete button
        if (gestureState.dx < -80) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
          lastOffset.current = -80;
        } else {
          // Otherwise, snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
          lastOffset.current = 0;
        }
      },
    })
  ).current;

  const handleDelete = () => {
    // Animate out before deleting
    Animated.timing(translateX, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
      // Reset position after delete
      lastOffset.current = 0;
      translateX.setValue(0);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Button Background */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteActionButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Card */}
      <Animated.View
        style={{
          transform: [{ translateX }],
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.messageCard, { backgroundColor }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            {conversation.otherPartyImage ? (
              <Text style={styles.avatarText}>
                {conversation.otherPartyName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={28} color="#fff" />
            )}
          </View>
          <View style={styles.messageInfo}>
            <View style={styles.messageHeader}>
              <Text style={[styles.senderName, { color: textColor }]} numberOfLines={1}>
                {conversation.otherPartyName}
              </Text>
              <Text style={[styles.messageTime, { color: secondaryText }]}>
                {formatTime(conversation.lastMessageTime)}
              </Text>
            </View>
            {conversation.propertyTitle && (
              <View style={styles.propertyTitleRow}>
                <Ionicons name="home-outline" size={14} color={tintColor} />
                <Text style={[styles.propertyTitle, { color: secondaryText }]} numberOfLines={1}>
                  {conversation.propertyTitle}
                </Text>
              </View>
            )}
            <Text style={[styles.messagePreview, { color: secondaryText }]} numberOfLines={2}>
              {conversation.lastMessage}
            </Text>
            {conversation.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { conversations, loadConversations, loadingConversations } = useChat();
  const { deleteConversation, isDeletingConversation } = useChatDeletion();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Use conversation search hook
  const { filteredConversations } = useConversationSearch({
    conversations,
    searchQuery,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleDeleteConversation = (conversationId: string, conversationName: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete this conversation with ${conversationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteConversation(conversationId);
            if (success) {
              // Reload conversations after deletion
              await loadConversations();
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.unauthContainer}>
          {/* Header */}
          <View style={styles.unauthHeader}>
            <View style={[styles.logoCircle, { backgroundColor: `${tintColor}20` }]}>
              <Ionicons name="chatbubbles" size={48} color={tintColor} />
            </View>
            <Text style={[styles.unauthTitle, { color: textColor }]}>
              Your Messages
            </Text>
            <Text style={[styles.unauthSubtitle, { color: secondaryText }]}>
              Sign in to view and send messages
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={() => setShowSignInModal(true)}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: tintColor }]}
              onPress={() => setShowSignUpModal(true)}
            >
              <Text style={[styles.secondaryButtonText, { color: tintColor }]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubble-ellipses" size={24} color={tintColor} />
              <Text style={[styles.featureText, { color: textColor }]}>
                Chat with property owners
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications" size={24} color={tintColor} />
              <Text style={[styles.featureText, { color: textColor }]}>
                Get instant notifications
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={24} color={tintColor} />
              <Text style={[styles.featureText, { color: textColor }]}>
                View message history
              </Text>
            </View>
          </View>
        </View>

        {/* Modals */}
        <SignInModal
          visible={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSwitchToSignUp={() => {
            setShowSignInModal(false);
            setShowSignUpModal(true);
          }}
          onForgotPassword={() => {
            setShowSignInModal(false);
            setShowForgotPasswordModal(true);
          }}
          onNeedsVerification={(email) => {
            setPendingEmail(email);
            setShowSignInModal(false);
            setShowVerifyEmailModal(true);
          }}
        />
        <SignUpModal
          visible={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSwitchToSignIn={() => {
            setShowSignUpModal(false);
            setShowSignInModal(true);
          }}
          onNeedsVerification={(email) => {
            setPendingEmail(email);
            setShowSignUpModal(false);
            setShowVerifyEmailModal(true);
          }}
        />
        <ForgotPasswordModal
          visible={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          onCodeSent={(email) => {
            setPendingEmail(email);
            setShowForgotPasswordModal(false);
            setShowResetPasswordModal(true);
          }}
        />
        <VerifyEmailModal
          visible={showVerifyEmailModal}
          onClose={() => setShowVerifyEmailModal(false)}
          email={pendingEmail}
          onVerified={() => {
            setShowVerifyEmailModal(false);
            setShowSignInModal(true);
          }}
        />
        <ResetPasswordModal
          visible={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          email={pendingEmail}
          onReset={() => {
            setShowResetPasswordModal(false);
            setShowSignInModal(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Messages</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Search Bar */}
        {conversations.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor }]}>
              <Ionicons name="search" size={20} color={secondaryText} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search by name or property..."
                placeholderTextColor={secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={secondaryText} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Error State - Removed since ChatContext handles errors internally */}

        {/* Loading State */}
        {loadingConversations && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <Text style={[styles.loadingText, { color: secondaryText }]}>
              Loading conversations...
            </Text>
          </View>
        )}

        {/* Messages List */}
        {!loadingConversations && filteredConversations.length > 0 && (
          <View style={styles.listContainer}>
            {filteredConversations.map((conversation) => (
              <SwipeableConversationCard
                key={conversation.id}
                conversation={conversation}
                onPress={() => {
                  console.log('[Messages] Opening conversation:', {
                    id: conversation.id,
                    hasHash: conversation.id.includes('#'),
                    propertyTitle: conversation.propertyTitle
                  });
                  const encodedId = encodeURIComponent(conversation.id);
                  router.push(`/conversation/${encodedId}`);
                }}
                onDelete={() => handleDeleteConversation(conversation.id, conversation.otherPartyName)}
                backgroundColor={cardBg}
                textColor={textColor}
                secondaryText={secondaryText}
                tintColor={tintColor}
                formatTime={formatTime}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loadingConversations && conversations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={secondaryText} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No messages yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
              Start a conversation with property owners
            </Text>
          </View>
        )}

        {/* No Search Results */}
        {!loadingConversations && conversations.length > 0 && filteredConversations.length === 0 && searchQuery.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={secondaryText} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No results found
            </Text>
            <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
              Try searching with a different name or property
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  unauthHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  unauthTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  unauthSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  authButtons: {
    gap: 16,
    marginBottom: 48,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContainer: {
    paddingVertical: 8,
  },
  swipeableContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  deleteActionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  messageCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  messageInfo: {
    flex: 1,
    position: 'relative',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  propertyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  propertyTitle: {
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },
  messagePreview: {
    fontSize: 15,
    lineHeight: 21,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});
