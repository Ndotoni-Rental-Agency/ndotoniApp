import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onPress?: () => void;
}

export default function SearchBar({ onPress }: SearchBarProps) {
  return (
    <TouchableOpacity style={styles.searchBar} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="search" size={20} color="#222" />
      <View style={styles.searchContent}>
        <Text style={styles.searchTitle}>Where to?</Text>
        <Text style={styles.searchSubtitle}>Anywhere • Any week • Add guests</Text>
      </View>
      <View style={styles.filterButton}>
        <Ionicons name="options-outline" size={20} color="#222" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContent: {
    flex: 1,
    marginLeft: 12,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 12,
    color: '#717171',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
