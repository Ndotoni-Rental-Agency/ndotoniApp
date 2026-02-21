import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyAvailabilityProps {
  available: boolean;
  availableFrom?: string | null;
  minimumLeaseTerm?: number | null;
  maximumLeaseTerm?: number | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
  backgroundColor: string;
  borderColor: string;
}

export default function PropertyAvailability({
  available,
  availableFrom,
  minimumLeaseTerm,
  maximumLeaseTerm,
  textColor,
  tintColor,
  secondaryText,
  backgroundColor,
  borderColor,
}: PropertyAvailabilityProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Availability</Text>
      </View>
      
      <View style={styles.content}>
        {/* Status */}
        <View style={styles.infoRow}>
          <View style={[styles.statusDot, { backgroundColor: available ? '#10b981' : '#ef4444' }]} />
          <Text style={[styles.statusText, { color: available ? '#10b981' : '#ef4444' }]}>
            {available ? 'Available Now' : 'Not Available'}
          </Text>
        </View>
        
        {/* Available From */}
        {availableFrom && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={secondaryText} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: secondaryText }]}>Available From</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>{formatDate(availableFrom)}</Text>
            </View>
          </View>
        )}
        
        {/* Lease Terms */}
        {(minimumLeaseTerm || maximumLeaseTerm) && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={secondaryText} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: secondaryText }]}>Lease Term</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {minimumLeaseTerm && maximumLeaseTerm 
                  ? `${minimumLeaseTerm} - ${maximumLeaseTerm} months`
                  : minimumLeaseTerm 
                    ? `Minimum ${minimumLeaseTerm} months`
                    : `Maximum ${maximumLeaseTerm} months`
                }
              </Text>
            </View>
          </View>
        )}
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
  content: {
    gap: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
