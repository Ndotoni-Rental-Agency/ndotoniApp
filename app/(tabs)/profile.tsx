import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import VerifyEmailModal from '@/components/auth/VerifyEmailModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');
  
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.unauthContainer}>
          {/* Header */}
          <View style={styles.unauthHeader}>
            <View style={[styles.logoCircle, { backgroundColor: `${tintColor}20` }]}>
              <Ionicons name="person" size={48} color={tintColor} />
            </View>
            <Text style={[styles.unauthTitle, { color: textColor }]}>
              Welcome to Ndotoni
            </Text>
            <Text style={[styles.unauthSubtitle, { color: secondaryText }]}>
              Sign in or create an account to access your profile, bookings, and more
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
              <Ionicons name="home" size={24} color={tintColor} />
              <Text style={[styles.featureText, { color: textColor }]}>
                Save your favorite properties
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={24} color={tintColor} />
              <Text style={[styles.featureText, { color: textColor }]}>
                Manage your bookings
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={24} color={tintColor} />
              <Text style={[styles.featureText, { color: textColor }]}>
                Message property owners
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

  // Show profile UI if authenticated
  const menuItems = [
    { id: 'properties', label: 'My Properties', icon: 'home', badge: '3' },
    { id: 'bookings', label: 'My Bookings', icon: 'calendar' },
    { id: 'messages', label: 'Messages', icon: 'chatbubbles', badge: '2' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'help', label: 'Help & Support', icon: 'help-circle' },
  ];

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={[styles.name, { color: textColor }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: secondaryText }]}>{user?.email}</Text>
          <TouchableOpacity style={[styles.editButton, { borderColor: tintColor }]}>
            <Text style={[styles.editButtonText, { color: tintColor }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { backgroundColor: cardBg, borderColor }]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${tintColor}20` }]}>
                  <Ionicons name={item.icon as any} size={24} color={tintColor} />
                </View>
                <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: tintColor }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={secondaryText} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity 
            style={[styles.signOutButton, { backgroundColor: cardBg, borderColor }]} 
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: secondaryText }]}>Version 1.0.0</Text>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signOutSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
  },
});
