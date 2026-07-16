import AppSwitch from '@/components/ui/AppSwitch';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, signOut, user } = useAuth();
  const { setThemeMode, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'sw' : 'en';
    await setLanguage(newLanguage);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data, bookings, and saved properties will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion API call
            Alert.alert('Contact Support', 'Please contact support to complete account deletion.');
          },
        },
      ]
    );
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unavailable', 'This page is not available yet.');
      }
    } catch {
      Alert.alert('Error', 'Could not open the link.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>APPEARANCE</Text>

          <View style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={tint} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: secondaryText }]}>
                  {isDark ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <AppSwitch value={isDark} onValueChange={toggleTheme} />
          </View>

          <View style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                <Ionicons name="language" size={22} color={tint} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: text }]}>Language</Text>
                <Text style={[styles.settingDescription, { color: secondaryText }]}>
                  {language === 'en' ? 'English' : 'Kiswahili'}
                </Text>
              </View>
            </View>
            <AppSwitch value={language === 'sw'} onValueChange={toggleLanguage} />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>NOTIFICATIONS</Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}
            onPress={() => Linking.openSettings()}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                <Ionicons name="notifications-outline" size={22} color={tint} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: text }]}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: secondaryText }]}>
                  Manage in system settings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={secondaryText} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>ABOUT</Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}
            onPress={() => openExternalLink('https://ndotoni.com/privacy')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={tint} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: text }]}>Privacy Policy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}
            onPress={() => openExternalLink('https://ndotoni.com/terms')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                <Ionicons name="document-text-outline" size={22} color={tint} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: text }]}>Terms of Service</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={secondaryText} />
          </TouchableOpacity>

          <View style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                <Ionicons name="information-circle-outline" size={22} color={tint} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: text }]}>Version</Text>
                <Text style={[styles.settingDescription, { color: secondaryText }]}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: secondaryText }]}>ACCOUNT</Text>

            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#ef444420' }]}>
                  <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                </View>
                <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: cardBg, borderColor }]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#ef444420' }]}>
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </View>
                <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Delete Account</Text>
              </View>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
