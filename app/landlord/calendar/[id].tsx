import DatePicker from '@/components/property/DatePicker';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BlockDatesMutationVariables, UnblockDatesMutationVariables } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { blockDates, unblockDates } from '@/lib/graphql/mutations';
import { getBlockedDates, getProperty, getShortTermProperty } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PropertyCalendarScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [property, setProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);

  // Fetch blocked dates for current month
  const fetchBlockedDates = async (month: Date) => {
    try {
      setIsLoading(true);

      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      console.log('[Calendar] Fetching blocked dates for:', {
        propertyId,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      });

      const response = await GraphQLClient.executeAuthenticated<{
        getBlockedDates: {
          propertyId: string;
          blockedRanges: Array<{
            startDate: string;
            endDate: string;
            reason?: string;
          }>;
        };
      }>(getBlockedDates, {
        propertyId,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      });

      console.log('[Calendar] Response:', response);

      if (response.getBlockedDates?.blockedRanges) {
        const newBlockedDates = new Set<string>();

        response.getBlockedDates.blockedRanges.forEach((range) => {
          console.log('[Calendar] Processing range:', range);
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            newBlockedDates.add(dateStr);
            console.log('[Calendar] Added blocked date:', dateStr);
          }
        });

        console.log('[Calendar] Total blocked dates:', newBlockedDates.size);
        setBlockedDates(newBlockedDates);
      }
    } catch (error) {
      console.error('[Calendar] Error fetching blocked dates:', error);
      Alert.alert('Error', 'Failed to load blocked dates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedDates(currentMonth);
  }, [propertyId, currentMonth]);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setPropertyLoading(true);
        
        // Try long-term property first
        try {
          const response = await GraphQLClient.executeAuthenticated<any>(getProperty, {
            propertyId,
          });
          
          if (response.getProperty) {
            setProperty({ ...response.getProperty, isLongTerm: true });
            return;
          }
        } catch (error) {
          console.log('[Calendar] Not a long-term property, trying short-term');
        }
        
        // Try short-term property
        const response = await GraphQLClient.executeAuthenticated<any>(getShortTermProperty, {
          propertyId,
        });
        
        if (response.getShortTermProperty) {
          setProperty({ ...response.getShortTermProperty, isLongTerm: false });
        }
      } catch (error) {
        console.error('[Calendar] Error fetching property:', error);
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleBlockDates = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    setIsBlocking(true);

    try {
      const response = await GraphQLClient.executeAuthenticated<{
        blockDates: { success: boolean; message?: string };
      }>(blockDates, {
        input: {
          propertyId,
          startDate: startDate.split('T')[0],
          endDate: endDate.split('T')[0],
        },
      } as BlockDatesMutationVariables);

      if (response.blockDates?.success) {
        Alert.alert('Success', 'Dates blocked successfully');
        setStartDate('');
        setEndDate('');
        await fetchBlockedDates(currentMonth);
      } else {
        Alert.alert('Error', response.blockDates?.message || 'Failed to block dates');
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
      Alert.alert('Error', 'Failed to block dates. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockDates = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates');
      return;
    }

    setIsUnblocking(true);

    try {
      const response = await GraphQLClient.executeAuthenticated<{
        unblockDates: { success: boolean; message?: string };
      }>(unblockDates, {
        input: {
          propertyId,
          startDate: startDate.split('T')[0],
          endDate: endDate.split('T')[0],
        },
      } as UnblockDatesMutationVariables);

      if (response.unblockDates?.success) {
        Alert.alert('Success', 'Dates unblocked successfully');
        setStartDate('');
        setEndDate('');
        await fetchBlockedDates(currentMonth);
      } else {
        Alert.alert('Error', response.unblockDates?.message || 'Failed to unblock dates');
      }
    } catch (error) {
      console.error('Error unblocking dates:', error);
      Alert.alert('Error', 'Failed to unblock dates. Please try again.');
    } finally {
      setIsUnblocking(false);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const today = new Date().toISOString().split('T')[0];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBlocked = blockedDates.has(dateStr);
      const isPast = dateStr < today;

      days.push(
        <View
          key={day}
          style={[
            styles.dayCell,
            isPast
              ? styles.pastDay
              : isBlocked
              ? [styles.blockedDay, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]
              : [styles.availableDay, { backgroundColor: '#10b98120', borderColor: '#10b981' }],
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: isPast ? placeholderColor : isBlocked ? '#ef4444' : '#10b981' },
            ]}
          >
            {day}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.calendarCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={[styles.weekDayText, { color: placeholderColor }]}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.daysGrid}>{days}</View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
      <View style={[styles.titleContainer, { backgroundColor: cardBg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Ionicons name="arrow-back" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: textColor }]}>Manage Calendar</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Info Card */}
        {propertyLoading ? (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ActivityIndicator size="small" color={tintColor} />
          </View>
        ) : property ? (
          <View style={[styles.propertyCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.propertyCardContent}>
              {/* Property Image */}
              {(property.media?.images?.[0] || property.thumbnail || property.images?.[0]) && (
                <Image
                  source={{ uri: property.media?.images?.[0] || property.thumbnail || property.images?.[0] }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              )}
              
              {/* Property Info */}
              <View style={styles.propertyDetails}>
                <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={2}>
                  {property.title}
                </Text>
                
                <View style={styles.propertyLocation}>
                  <Ionicons name="location-outline" size={14} color={secondaryText} />
                  <Text style={[styles.locationText, { color: secondaryText }]} numberOfLines={1}>
                    {property.address?.street || property.street || ''}{property.address?.street || property.street ? ', ' : ''}
                    {property.district || property.address?.district}, {property.region || property.address?.region}
                  </Text>
                </View>

                <Text style={[styles.propertyPrice, { color: tintColor }]}>
                  TZS {property.isLongTerm 
                    ? (property.pricing?.monthlyRent || 0).toLocaleString() 
                    : (property.nightlyRate || 0).toLocaleString()}
                  <Text style={[styles.priceUnit, { color: secondaryText }]}>
                    {property.isLongTerm ? '/month' : '/night'}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: `${tintColor}15`, borderColor: `${tintColor}30` }]}>
          <Ionicons name="information-circle" size={20} color={tintColor} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: tintColor }]}>How it works:</Text>
            <Text style={[styles.infoText, { color: textColor }]}>
              • Block dates to prevent bookings{'\n'}
              • Unblock dates to make them available{'\n'}
              • Blocked dates won't appear in search results
            </Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Select Date Range</Text>

          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            mode="date"
            placeholder="Select start date"
            textColor={textColor}
            tintColor={tintColor}
            backgroundColor={cardBg}
            borderColor={borderColor}
            placeholderColor={placeholderColor}
          />

          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            mode="date"
            placeholder="Select end date"
            textColor={textColor}
            tintColor={tintColor}
            backgroundColor={cardBg}
            borderColor={borderColor}
            placeholderColor={placeholderColor}
          />

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleBlockDates}
              disabled={isBlocking || isUnblocking || !startDate || !endDate}
              style={[
                styles.actionButton,
                styles.blockButton,
                { opacity: isBlocking || isUnblocking || !startDate || !endDate ? 0.5 : 1 },
              ]}
            >
              {isBlocking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Block Dates</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUnblockDates}
              disabled={isBlocking || isUnblocking || !startDate || !endDate}
              style={[
                styles.actionButton,
                styles.unblockButton,
                { opacity: isBlocking || isUnblocking || !startDate || !endDate ? 0.5 : 1 },
              ]}
            >
              {isUnblocking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Unblock Dates</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar View */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>

            <View style={styles.monthTitleContainer}>
              <Text style={[styles.monthTitle, { color: textColor }]}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              {blockedDates.size > 0 && (
                <Text style={[styles.blockedCount, { color: '#ef4444' }]}>
                  {blockedDates.size} blocked
                </Text>
              )}
            </View>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
              <Ionicons name="chevron-forward" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          ) : (
            <>
              {renderCalendar()}

              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#10b98120', borderColor: '#10b981' }]} />
                  <Text style={[styles.legendText, { color: textColor }]}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]} />
                  <Text style={[styles.legendText, { color: textColor }]}>Blocked</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backArrow: {
    padding: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  blockButton: {
    backgroundColor: '#ef4444',
  },
  unblockButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  blockedCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  calendarCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pastDay: {
    opacity: 0.3,
  },
  blockedDay: {
    borderRadius: 8,
    borderWidth: 2,
  },
  availableDay: {
    borderRadius: 8,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 13,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  propertyCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  propertyCardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  propertyImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '400',
  },
});
