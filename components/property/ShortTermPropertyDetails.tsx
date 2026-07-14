import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShortTermPropertyDetailsProps {
  maxGuests?: number | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  maxInfants?: number | null;
  minimumStay?: number | null;
  maximumStay?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
}

export default function ShortTermPropertyDetails({
  maxGuests,
  maxAdults,
  maxChildren,
  maxInfants,
  minimumStay,
  maximumStay,
  checkInTime,
  checkOutTime,
  textColor,
  tintColor,
  secondaryText,
}: ShortTermPropertyDetailsProps) {
  const details = [
    { icon: 'people-outline', label: 'Max guests', value: maxGuests },
    { icon: 'person-outline', label: 'Adults', value: maxAdults },
    { icon: 'happy-outline', label: 'Children', value: maxChildren },
    { icon: 'heart-outline', label: 'Infants', value: maxInfants },
    { icon: 'log-in-outline', label: 'Check-in', value: checkInTime },
    { icon: 'log-out-outline', label: 'Check-out', value: checkOutTime },
  ].filter(d => d.value != null);

  const stayInfo = [];
  if (minimumStay && minimumStay > 1) stayInfo.push(`${minimumStay} night min`);
  if (maximumStay) stayInfo.push(`${maximumStay} night max`);

  if (details.length === 0 && stayInfo.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Property details</Text>

      {details.length > 0 && (
        <View style={styles.grid}>
          {details.map((detail, index) => (
            <View key={index} style={styles.gridItem}>
              <Ionicons name={detail.icon as any} size={20} color={tintColor} />
              <View>
                <Text style={[styles.gridValue, { color: textColor }]}>{detail.value}</Text>
                <Text style={[styles.gridLabel, { color: secondaryText }]}>{detail.label}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {stayInfo.length > 0 && (
        <View style={[styles.stayPill, { backgroundColor: `${tintColor}08` }]}>
          <Ionicons name="calendar-outline" size={16} color={tintColor} />
          <Text style={[styles.stayText, { color: textColor }]}>{stayInfo.join('  ·  ')}</Text>
        </View>
      )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '46%',
    paddingVertical: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  gridLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  stayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  stayText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
