import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function FavoritesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // TODO: Fetch favorites from backend
  const favorites: any[] = [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Favorites</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            {favorites.length} saved properties
          </Text>
        </View>

        {/* Favorites List */}
        {favorites.length > 0 ? (
          <View style={styles.listContainer}>
            {favorites.map((property) => (
              <TouchableOpacity key={property.id} style={styles.propertyCard}>
                <View style={styles.propertyImage}>
                  <Ionicons name="image" size={40} color="#ccc" />
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart" size={24} color={tintColor} />
                  </TouchableOpacity>
                </View>
                <View style={styles.propertyInfo}>
                  <Text style={[styles.propertyTitle, { color: textColor }]}>
                    {property.title}
                  </Text>
                  <Text style={styles.propertyLocation}>
                    <Ionicons name="location" size={14} color="#666" /> {property.location}
                  </Text>
                  <Text style={[styles.propertyPrice, { color: tintColor }]}>
                    {property.price}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No favorites yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Start saving properties you love
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContainer: {
    paddingVertical: 12,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
  },
});
