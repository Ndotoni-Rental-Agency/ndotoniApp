import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface PropertyHostProps {
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
}

export default function PropertyHost({
  firstName,
  lastName,
  profileImage,
  textColor,
  tintColor,
  backgroundColor,
  borderColor,
}: PropertyHostProps) {
  const [imageError, setImageError] = useState(false);

  if (!firstName) return null;

  const showImage = profileImage && !imageError;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Hosted by</Text>
      </View>
      <View style={[styles.card, { backgroundColor, borderColor }]}>
        {showImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.avatar}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.avatar, styles.initialsAvatar, { backgroundColor: tintColor }]}>
            <Text style={styles.initials}>
              {firstName[0]}{lastName ? lastName[0] : ''}
            </Text>
          </View>
        )}
        <View style={styles.details}>
          <Text style={[styles.name, { color: textColor }]}>
            {firstName}{lastName ? ` ${lastName}` : ''}
          </Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            <Text style={styles.role}>Verified Host</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  initialsAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  role: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
});
