import LocationSelector from '@/components/location/LocationSelector';
import DatePicker from '@/components/property/DatePicker';
import GenderPicker from '@/components/property/GenderPicker';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { UpdateUserInput } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SectionKey = 'personal' | 'contact' | 'address' | 'emergency' | 'identification';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { updateUserProfile, isUpdating } = useUpdateUser();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const inputBg = useThemeColor({ light: '#f9fafb', dark: '#1c1c1e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set(['personal']));
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    occupation: user?.occupation || '',
  });

  const [contactInfo, setContactInfo] = useState({
    phoneNumber: user?.phoneNumber || '',
    whatsappNumber: user?.whatsappNumber || '',
  });

  // Removed addressInfo state - using location state instead

  // Location state for LocationSelector
  const [location, setLocation] = useState({
    region: user?.region || '',
    district: user?.district || '',
    ward: user?.ward || '',
    street: user?.street || '',
  });

  const handleLocationChange = (newLocation: { region: string; district: string; ward?: string; street?: string }) => {
    setLocation({
      region: newLocation.region,
      district: newLocation.district,
      ward: newLocation.ward || '',
      street: newLocation.street || '',
    });
  };

  const [emergencyInfo, setEmergencyInfo] = useState({
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
  });

  const [identificationInfo, setIdentificationInfo] = useState({
    nationalId: user?.nationalIdLast4 || '',
  });

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => {
      const newSet = new Set<SectionKey>();
      // If the section is already expanded, collapse it (empty set)
      // Otherwise, expand only this section
      if (!prev.has(section)) {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleSaveSection = async (section: SectionKey) => {
    setSavingSection(section);

    let input: UpdateUserInput = {};

    switch (section) {
      case 'personal':
        input = {
          firstName: personalInfo.firstName || null,
          lastName: personalInfo.lastName || null,
          dateOfBirth: personalInfo.dateOfBirth || null,
          gender: personalInfo.gender || null,
          occupation: personalInfo.occupation || null,
        };
        break;
      case 'contact':
        input = {
          phoneNumber: contactInfo.phoneNumber || null,
          whatsappNumber: contactInfo.whatsappNumber || null,
        };
        break;
      case 'address':
        input = {
          street: location.street || null,
          ward: location.ward || null,
          district: location.district || null,
          region: location.region || null,
        };
        break;
      case 'emergency':
        input = {
          emergencyContactName: emergencyInfo.emergencyContactName || null,
          emergencyContactPhone: emergencyInfo.emergencyContactPhone || null,
        };
        break;
      case 'identification':
        input = {
          nationalId: identificationInfo.nationalId || null,
        };
        break;
    }

    try {
      const result = await updateUserProfile(input);
      if (result.success) {
        if (refreshUser) {
          await refreshUser();
        }
        // Show alert and collapse section after user dismisses it
        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => toggleSection(section),
          },
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSavingSection(null);
    }
  };

  const renderSection = (
    key: SectionKey,
    title: string,
    icon: string,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections.has(key);
    const isSaving = savingSection === key;

    return (
      <View style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(key)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIcon, { backgroundColor: `${tintColor}20` }]}>
              <Ionicons name={icon as any} size={20} color={tintColor} />
            </View>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={textColor}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {content}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: tintColor, opacity: isSaving ? 0.6 : 1 },
              ]}
              onPress={() => handleSaveSection(key)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        {renderSection(
          'personal',
          'Personal Information',
          'person',
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>First Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={personalInfo.firstName}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, firstName: text })}
                placeholder="Enter first name"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={personalInfo.lastName}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, lastName: text })}
                placeholder="Enter last name"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <DatePicker
              label="Date of Birth"
              value={personalInfo.dateOfBirth}
              onChange={(date) => setPersonalInfo({ ...personalInfo, dateOfBirth: date })}
              mode="date"
              placeholder="Select date of birth"
              textColor={textColor}
              tintColor={tintColor}
              backgroundColor={inputBg}
              borderColor={borderColor}
              placeholderColor={placeholderColor}
            />

            <GenderPicker
              label="Gender"
              value={personalInfo.gender}
              onChange={(gender) => setPersonalInfo({ ...personalInfo, gender })}
              textColor={textColor}
              tintColor={tintColor}
              backgroundColor={inputBg}
              borderColor={borderColor}
              placeholderColor={placeholderColor}
            />

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Occupation</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={personalInfo.occupation}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, occupation: text })}
                placeholder="Enter occupation"
                placeholderTextColor={placeholderColor}
              />
            </View>
          </>
        )}

        {/* Contact Information */}
        {renderSection(
          'contact',
          'Contact Information',
          'call',
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={contactInfo.phoneNumber}
                onChangeText={(text) => setContactInfo({ ...contactInfo, phoneNumber: text })}
                placeholder="+255 XXX XXX XXX"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>WhatsApp Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={contactInfo.whatsappNumber}
                onChangeText={(text) => setContactInfo({ ...contactInfo, whatsappNumber: text })}
                placeholder="+255 XXX XXX XXX"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}

        {/* Address Information */}
        {renderSection(
          'address',
          'Address',
          'location',
          <>
            <LocationSelector
              value={location}
              onChange={handleLocationChange}
            />
          </>
        )}

        {/* Emergency Contact */}
        {renderSection(
          'emergency',
          'Emergency Contact',
          'alert-circle',
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Contact Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={emergencyInfo.emergencyContactName}
                onChangeText={(text) =>
                  setEmergencyInfo({ ...emergencyInfo, emergencyContactName: text })
                }
                placeholder="Enter emergency contact name"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Contact Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={emergencyInfo.emergencyContactPhone}
                onChangeText={(text) =>
                  setEmergencyInfo({ ...emergencyInfo, emergencyContactPhone: text })
                }
                placeholder="+255 XXX XXX XXX"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}

        {/* Identification */}
        {renderSection(
          'identification',
          'Identification',
          'card',
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>National ID</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                value={identificationInfo.nationalId}
                onChangeText={(text) =>
                  setIdentificationInfo({ ...identificationInfo, nationalId: text })
                }
                placeholder="Enter national ID number"
                placeholderTextColor={placeholderColor}
                secureTextEntry
              />
              <Text style={[styles.helperText, { color: placeholderColor }]}>
                Your ID is encrypted and secure
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
