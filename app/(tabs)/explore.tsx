import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

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
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location, property type..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Popular Regions</Text>
          <View style={styles.regionGrid}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionCard,
                  selectedRegion === region && { backgroundColor: tintColor }
                ]}
                onPress={() => setSelectedRegion(region === selectedRegion ? null : region)}
              >
                <Ionicons 
                  name="location" 
                  size={24} 
                  color={selectedRegion === region ? '#fff' : tintColor} 
                />
                <Text style={[
                  styles.regionText,
                  { color: selectedRegion === region ? '#fff' : textColor }
                ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Property Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Property Types</Text>
          <View style={styles.typeGrid}>
            {propertyTypes.map((type) => (
              <TouchableOpacity key={type.id} style={styles.typeCard}>
                <View style={[styles.typeIcon, { backgroundColor: tintColor }]}>
                  <Ionicons name={type.icon as any} size={32} color="#fff" />
                </View>
                <Text style={[styles.typeText, { color: textColor }]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Filters</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="pricetag" size={18} color={tintColor} />
              <Text style={[styles.filterText, { color: textColor }]}>Price Range</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="bed" size={18} color={tintColor} />
              <Text style={[styles.filterText, { color: textColor }]}>Bedrooms</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="water" size={18} color={tintColor} />
              <Text style={[styles.filterText, { color: textColor }]}>Bathrooms</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={18} color={tintColor} />
              <Text style={[styles.filterText, { color: textColor }]}>More Filters</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Apply Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.applyButton, { backgroundColor: tintColor }]}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  regionCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  regionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  typeCard: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  applyButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
