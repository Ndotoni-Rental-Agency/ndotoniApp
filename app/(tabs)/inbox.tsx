import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import VerifyEmailModal from '@/components/auth/VerifyEmailModal';
import { SwipeableConversationCard } from '@/components/inbox';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useChatDeletion } from '@/hooks/useChatDeletion';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
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
