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
  // Main details (guests and times)
  const mainDetails = [
    { icon: 'people', label: 'Max Guests', value: maxGuests },
    { icon: 'person', label: 'Adults', value: maxAdults },
    { icon: 'happy', label: 'Children', value: maxChildren },
    { icon: 'heart', label: 'Infants', value: maxInfants },
    { icon: 'log-in', label: 'Check-in', value: checkInTime },
    { icon: 'log-out', label: 'Check-out', value: checkOutTime },
  ].filter(detail => detail.value);

  // Stay duration info
  const stayInfo = [];
  if (minimumStay) stayInfo.push(`${minimumStay} night minimum`);
  if (maximumStay) stayInfo.push(`${maximumStay} night maximum`);

  if (mainDetails.length === 0 && stayInfo.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>Property Details</Text>
      </View>
      
      {/* Main Details Grid */}
      {mainDetails.length > 0 && (
        <View style={styles.grid}>
          {mainDetails.map((detail, index) => (
            <View key={index} style={styles.detailCard}>
              <View style={[styles.iconCircle, { backgroundColor: `${tintColor}15` }]}>
                <Ionicons name={detail.icon as any} size={26} color={tintColor} />
              </View>
              <Text style={[styles.label, { color: secondaryText }]}>{detail.label}</Text>
              <Text style={[styles.value, { color: textColor }]}>{detail.value}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Stay Duration at Bottom */}
      {stayInfo.length > 0 && (
        <View style={[styles.stayDurationCard, { backgroundColor: `${tintColor}10`, borderColor: `${tintColor}30` }]}>
          <Ionicons name="calendar" size={20} color={tintColor} />
          <View style={styles.stayDurationContent}>
            <Text style={[styles.stayDurationLabel, { color: secondaryText }]}>Stay Duration</Text>
            <Text style={[styles.stayDurationValue, { color: textColor }]}>{stayInfo.join(' • ')}</Text>
          </View>
        </View>
      )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  stayDurationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  stayDurationContent: {
    flex: 1,
    gap: 4,
  },
  stayDurationLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stayDurationValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
