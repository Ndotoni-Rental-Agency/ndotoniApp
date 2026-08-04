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
      <Text style={[styles.title, { color: textColor }]}>Meet your Host</Text>
      <View style={styles.hostRow}>
        {showImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.avatar}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            <Text style={styles.initials}>
              {firstName[0]}
            </Text>
          </View>
        )}
        <View style={styles.hostInfo}>
          <Text style={[styles.hostName, { color: textColor }]}>
            {firstName}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 17,
    fontWeight: '600',
  },
});
