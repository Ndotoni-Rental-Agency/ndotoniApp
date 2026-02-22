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
import { ActivityIndicator, Alert, Animated, FlatList, PanResponder, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
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
  onSwipeStart,
  onSwipeEnd,
}: SwipeableConversationCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal swipes, let vertical scrolling pass through
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificant = Math.abs(gestureState.dx) > 5; // Lower threshold for faster response
        return isHorizontal && isSignificant;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Aggressively capture horizontal swipes to prevent scroll
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isSignificant = Math.abs(gestureState.dx) > 5; // Lower threshold
        
        if (isHorizontal && isSignificant) {
          // Immediately disable scroll when horizontal swipe detected
          onSwipeStart?.();
          return true;
        }
        return false;
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping left
        if (gestureState.dx < 0) {
          // Cap at -80
          const newValue = Math.max(gestureState.dx, -80);
          translateX.setValue(newValue);
        } else if (isOpen) {
          // Allow closing by swiping right
          const newValue = Math.min(gestureState.dx - 80, 0);
          translateX.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Re-enable scroll immediately
        onSwipeEnd?.();
        
        // Determine if we should open or close
        if (gestureState.dx < -40 || (isOpen && gestureState.dx < 20)) {
          // Open
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start();
          setIsOpen(true);
        } else {
          // Close
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 20,
          }).start();
          setIsOpen(false);
        }
      },
      onPanResponderTerminate: () => {
        // Re-enable scroll if gesture is terminated
        onSwipeEnd?.();
      },
    })
  ).current;

  const handleDelete = () => {
    // Close first, then delete
    Animated.timing(translateX, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
      translateX.setValue(0);
      setIsOpen(false);
    });
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Button - Always visible behind */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.9}
        >
          <Ionicons name="trash" size={21} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Swipeable Card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.messageCard, { backgroundColor }]}
          onPress={onPress}
          activeOpacity={0.95}
        >
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            {conversation.otherPartyImage ? (
              <Text style={styles.avatarText}>
                {conversation.otherPartyName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={26} color="#fff" />
            )}
          </View>

          {/* Message Content */}
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[styles.senderName, { color: textColor }]} numberOfLines={1}>
                {conversation.otherPartyName}
              </Text>
              <Text style={[styles.messageTime, { color: secondaryText }]}>
                {formatTime(conversation.lastMessageTime)}
              </Text>
            </View>

            {conversation.propertyTitle && (
              <View style={styles.propertyRow}>
                <Ionicons name="home" size={13} color={secondaryText} />
                <Text style={[styles.propertyTitle, { color: secondaryText }]} numberOfLines={1}>
                  {conversation.propertyTitle}
                </Text>
              </View>
            )}

            <View style={styles.previewRow}>
              <Text style={[styles.messagePreview, { color: secondaryText }]} numberOfLines={2}>
                {conversation.lastMessage}
              </Text>
              {conversation.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                  <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={20} color={secondaryText} style={styles.chevron} />
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
  const [scrollEnabled, setScrollEnabled] = useState(true);

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
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableConversationCard
            conversation={item}
            onPress={() => {
              console.log('[Messages] Opening conversation:', {
                id: item.id,
                hasHash: item.id.includes('#'),
                propertyTitle: item.propertyTitle
              });
              const encodedId = encodeURIComponent(item.id);
              router.push(`/conversation/${encodedId}`);
            }}
            onDelete={() => handleDeleteConversation(item.id, item.otherPartyName)}
            onSwipeStart={() => setScrollEnabled(false)}
            onSwipeEnd={() => setScrollEnabled(true)}
            backgroundColor={cardBg}
            textColor={textColor}
            secondaryText={secondaryText}
            tintColor={tintColor}
            formatTime={formatTime}
          />
        )}
        scrollEnabled={scrollEnabled}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: textColor }]}>Messages</Text>
            </View>

            {/* Search Bar */}
            {conversations.length > 0 && (
              <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: useThemeColor({ light: '#f3f4f6', dark: cardBg }, 'background') }]}>
                  <Ionicons name="search" size={18} color={secondaryText} />
                  <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Search"
                    placeholderTextColor={secondaryText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color={secondaryText} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loadingConversations ? (
            conversations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color={secondaryText} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  No Messages
                </Text>
                <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
                  Start a conversation with property owners
                </Text>
              </View>
            ) : searchQuery.length > 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={secondaryText} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  No Results
                </Text>
                <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
                  Try a different search term
                </Text>
              </View>
            ) : null
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: borderColor }]} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    padding: 0,
  },
  separator: {
    height: 0.5,
    marginLeft: 90,
  },
  swipeableContainer: {
    position: 'relative',
    height: 88,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    flex: 1,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 88,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 15,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  propertyTitle: {
    fontSize: 14,
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messagePreview: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 8,
    opacity: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 22,
  },
});
