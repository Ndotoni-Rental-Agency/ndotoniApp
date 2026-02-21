import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyDescriptionProps {
  description: string;
  textColor: string;
  tintColor: string;
}

export default function PropertyDescription({
  description,
  textColor,
  tintColor,
}: PropertyDescriptionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>About this place</Text>
      </View>
      <Text style={[styles.description, { color: textColor }]}>
        {description}
      </Text>
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
  description: {
    fontSize: 16,
    lineHeight: 26,
  },
});
