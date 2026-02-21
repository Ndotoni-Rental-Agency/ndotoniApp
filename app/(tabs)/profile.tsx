import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import VerifyEmailModal from '@/components/auth/VerifyEmailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { GraphQLClient } from '@/lib/graphql-client';
import { getMediaUploadUrl } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');
  
  const { user, isAuthenticated, isLoading, signOut, refreshUser } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { updateUserProfile, isUpdating } = useUpdateUser();
  
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'sw' : 'en';
    await setLanguage(newLanguage);
  };

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

  const handleProfilePictureUpload = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permissions to upload a profile picture.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      setUploadingPhoto(true);

      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Get upload URL
      const urlData = await GraphQLClient.executeAuthenticated<{ getMediaUploadUrl: any }>(
        getMediaUploadUrl,
        { fileName: filename, contentType: type }
      );

      if (!urlData.getMediaUploadUrl?.uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = urlData.getMediaUploadUrl;

      // Upload to S3
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': type },
      });

      // Update user profile
      const updateResult = await updateUserProfile({ profileImage: fileUrl });

      if (updateResult.success) {
        Alert.alert('Success', 'Profile picture updated successfully');
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        throw new Error(updateResult.message);
      }
    } catch (error) {
      console.error('[Profile] Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
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
        <ScrollView 
          style={styles.unauthScrollView}
          contentContainerStyle={styles.unauthContainer}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Preferences Section - Available without sign in */}
          <View style={styles.unauthPreferencesSection}>
            <Text style={[styles.sectionTitle, { color: secondaryText }]}>PREFERENCES</Text>
            
            {/* Theme Toggle */}
            <View style={[styles.preferenceItem, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.preferenceIcon, { backgroundColor: `${tintColor}20` }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={tintColor} />
                </View>
                <View style={styles.preferenceText}>
                  <Text style={[styles.preferenceLabel, { color: textColor }]}>Dark Mode</Text>
                  <Text style={[styles.preferenceDescription, { color: secondaryText }]}>
                    {isDark ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d1d5db', true: tintColor }}
                thumbColor="#fff"
                ios_backgroundColor="#d1d5db"
              />
            </View>

            {/* Language Toggle */}
            <View style={[styles.preferenceItem, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.preferenceIcon, { backgroundColor: `${tintColor}20` }]}>
                  <Ionicons name="language" size={24} color={tintColor} />
                </View>
                <View style={styles.preferenceText}>
                  <Text style={[styles.preferenceLabel, { color: textColor }]}>Language</Text>
                  <Text style={[styles.preferenceDescription, { color: secondaryText }]}>
                    {language === 'en' ? 'English' : 'Kiswahili'}
                  </Text>
                </View>
              </View>
              <Switch
                value={language === 'sw'}
                onValueChange={toggleLanguage}
                trackColor={{ false: '#d1d5db', true: tintColor }}
                thumbColor="#fff"
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </ScrollView>

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
    { id: 'properties', label: 'My Properties', icon: 'home', route: '/(tabs)/explore' },
    { id: 'favorites', label: 'Favorites', icon: 'heart' },
    { id: 'bookings', label: 'My Bookings', icon: 'calendar' },
    { id: 'messages', label: 'Messages', icon: 'chatbubbles', route: '/(tabs)/messages' },
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
          <TouchableOpacity 
            style={[styles.avatarContainer]}
            onPress={handleProfilePictureUpload}
            disabled={uploadingPhoto}
          >
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: tintColor }]}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
            <View style={[styles.cameraButton, { backgroundColor: tintColor }]}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: textColor }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: secondaryText }]}>{user?.email}</Text>
          <TouchableOpacity 
            style={[styles.editButton, { borderColor: tintColor }]}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={[styles.editButtonText, { color: tintColor }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { backgroundColor: cardBg, borderColor }]}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${tintColor}20` }]}>
                  <Ionicons name={item.icon as any} size={24} color={tintColor} />
                </View>
                <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>PREFERENCES</Text>
          
          {/* Theme Toggle */}
          <View style={[styles.preferenceItem, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.preferenceLeft}>
              <View style={[styles.preferenceIcon, { backgroundColor: `${tintColor}20` }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={tintColor} />
              </View>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceLabel, { color: textColor }]}>Dark Mode</Text>
                <Text style={[styles.preferenceDescription, { color: secondaryText }]}>
                  {isDark ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: tintColor }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d5db"
            />
          </View>

          {/* Language Toggle */}
          <View style={[styles.preferenceItem, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.preferenceLeft}>
              <View style={[styles.preferenceIcon, { backgroundColor: `${tintColor}20` }]}>
                <Ionicons name="language" size={24} color={tintColor} />
              </View>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceLabel, { color: textColor }]}>Language</Text>
                <Text style={[styles.preferenceDescription, { color: secondaryText }]}>
                  {language === 'en' ? 'English' : 'Kiswahili'}
                </Text>
              </View>
            </View>
            <Switch
              value={language === 'sw'}
              onValueChange={toggleLanguage}
              trackColor={{ false: '#d1d5db', true: tintColor }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d5db"
            />
          </View>
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
  unauthScrollView: {
    flex: 1,
  },
  unauthContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
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
    marginBottom: 32,
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
  unauthPreferencesSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
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
  preferencesSection: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
  },
});
