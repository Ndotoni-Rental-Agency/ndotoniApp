import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Added semantic colors
  const cardColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1C1C1E' },
    'background'
  );

  const inputColor = useThemeColor(
    { light: '#F2F2F7', dark: '#2C2C2E' },
    'background'
  );

  const secondaryText = useThemeColor(
    { light: '#6B7280', dark: '#9CA3AF' },
    'text'
  );

  const regions = [
    'Dar es Salaam',
    'Arusha',
    'Mwanza',
    'Dodoma',
    'Mbeya',
    'Morogoro',
  ];

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment', icon: 'business' },
    { id: 'house', label: 'House', icon: 'home' },
    { id: 'studio', label: 'Studio', icon: 'cube' },
    { id: 'villa', label: 'Villa', icon: 'home-sharp' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Explore</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Find your next home in Tanzania
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: inputColor }]}>
            <Ionicons
              name="search"
              size={20}
              color={secondaryText}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search location or property..."
              placeholderTextColor={secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={secondaryText}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Popular Regions
          </Text>

          <View style={styles.grid}>
            {regions.map((region) => {
              const selected = selectedRegion === region;

              return (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionCard,
                    {
                      backgroundColor: selected ? tintColor : cardColor,
                    },
                  ]}
                  onPress={() =>
                    setSelectedRegion(selected ? null : region)
                  }
                >
                  <Ionicons
                    name="location"
                    size={20}
                    color={selected ? '#fff' : tintColor}
                  />
                  <Text
                    style={[
                      styles.regionText,
                      {
                        color: selected ? '#fff' : textColor,
                      },
                    ]}
                  >
                    {region}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Property Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Property Types
          </Text>

          <View style={styles.grid}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, { backgroundColor: cardColor }]}
              >
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: tintColor + '20' },
                  ]}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={28}
                    color={tintColor}
                  />
                </View>
                <Text style={[styles.typeText, { color: textColor }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Apply Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: tintColor }]}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },

  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  section: {
    paddingVertical: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },

  regionCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    margin: 6,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },

  regionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  typeCard: {
    width: '47%',
    alignItems: 'center',
    borderRadius: 20,
    padding: 22,
    margin: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },

  typeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  typeText: {
    fontSize: 15,
    fontWeight: '600',
  },

  applyButton: {
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },

  applyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
