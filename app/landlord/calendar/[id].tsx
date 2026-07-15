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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function PropertyCalendarScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const propertyType = params.type as 'long-term' | 'short-term' | undefined;

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [property, setProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);

  // Selection state: tap first date = start, tap second = end
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);

  const fetchBlockedDates = async (month: Date) => {
    try {
      setIsLoading(true);
      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const response = await GraphQLClient.executeAuthenticated<{
        getBlockedDates: {
          propertyId: string;
          blockedRanges: { startDate: string; endDate: string; reason?: string }[];
        };
      }>(getBlockedDates, {
        propertyId,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      });
      if (response.getBlockedDates?.blockedRanges) {
        const dates = new Set<string>();
        response.getBlockedDates.blockedRanges.forEach((range) => {
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.add(d.toISOString().split('T')[0]);
          }
        });
        setBlockedDates(dates);
      }
    } catch (error) {
      console.error('[Calendar] Error:', error);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBlockedDates(currentMonth); }, [propertyId, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setPropertyLoading(true);
        if (propertyType === 'long-term') {
          const res = await GraphQLClient.executeAuthenticated<any>(getProperty, { propertyId });
          if (res.getProperty) setProperty({ ...res.getProperty, isLongTerm: true });
        } else {
          const res = await GraphQLClient.executeAuthenticated<any>(getShortTermProperty, { propertyId });
          if (res.getShortTermProperty) setProperty({ ...res.getShortTermProperty, isLongTerm: false });
        }
      } catch (error) { console.error('[Calendar] Error:', error); }
      finally { setPropertyLoading(false); }
    };
    fetchProperty();
  }, [propertyId, propertyType]);

  // Date selection logic — tap to select range directly on calendar
  const handleDayPress = (dateStr: string) => {
    if (!selectionStart || (selectionStart && selectionEnd)) {
      // First tap or reset: set start
      setSelectionStart(dateStr);
      setSelectionEnd(null);
    } else {
      // Second tap: set end (ensure order)
      if (dateStr < selectionStart) {
        setSelectionEnd(selectionStart);
        setSelectionStart(dateStr);
      } else {
        setSelectionEnd(dateStr);
      }
    }
  };

  const clearSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Check if a date is within the selected range
  const isInSelectedRange = (dateStr: string): boolean => {
    if (!selectionStart) return false;
    if (!selectionEnd) return dateStr === selectionStart;
    return dateStr >= selectionStart && dateStr <= selectionEnd;
  };

  // Check if all selected dates are currently blocked
  const selectionIsBlocked = (): boolean => {
    if (!selectionStart) return false;
    const end = selectionEnd || selectionStart;
    const start = new Date(selectionStart);
    const endDate = new Date(end);
    for (let d = new Date(start); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (!blockedDates.has(d.toISOString().split('T')[0])) return false;
    }
    return true;
  };

  const handleBlockDates = async () => {
    if (!selectionStart) return;
    const end = selectionEnd || selectionStart;
    setIsSaving(true);
    try {
      const res = await GraphQLClient.executeAuthenticated<{ blockDates: { success: boolean; message?: string } }>(
        blockDates, { input: { propertyId, startDate: selectionStart, endDate: end } } as BlockDatesMutationVariables
      );
      if (res.blockDates?.success) {
        clearSelection();
        await fetchBlockedDates(currentMonth);
      } else { Alert.alert('Error', res.blockDates?.message || 'Failed'); }
    } catch { Alert.alert('Error', 'Failed to block dates'); }
    finally { setIsSaving(false); }
  };

  const handleUnblockDates = async () => {
    if (!selectionStart) return;
    const end = selectionEnd || selectionStart;
    setIsSaving(true);
    try {
      const res = await GraphQLClient.executeAuthenticated<{ unblockDates: { success: boolean; message?: string } }>(
        unblockDates, { input: { propertyId, startDate: selectionStart, endDate: end } } as UnblockDatesMutationVariables
      );
      if (res.unblockDates?.success) {
        clearSelection();
        await fetchBlockedDates(currentMonth);
      } else { Alert.alert('Error', res.unblockDates?.message || 'Failed'); }
    } catch { Alert.alert('Error', 'Failed to unblock dates'); }
    finally { setIsSaving(false); }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = new Date(year, month, 1).getDay();
    const today = new Date().toISOString().split('T')[0];

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<View key={`e-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBlocked = blockedDates.has(dateStr);
      const isPast = dateStr < today;
      const isToday = dateStr === today;
      const isSelected = isInSelectedRange(dateStr);
      const isRangeStart = dateStr === selectionStart;
      const isRangeEnd = dateStr === (selectionEnd || selectionStart);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && [styles.selectedCell, { backgroundColor: `${tint}15` }],
            isRangeStart && isSelected && styles.rangeStartCell,
            isRangeEnd && isSelected && selectionEnd && styles.rangeEndCell,
          ]}
          onPress={() => !isPast && handleDayPress(dateStr)}
          disabled={isPast}
          activeOpacity={0.6}
        >
          <View style={[
            styles.dayInner,
            isToday && [styles.todayInner, { borderColor: tint }],
            isRangeStart && isSelected && [styles.selectedInner, { backgroundColor: tint }],
            isRangeEnd && isSelected && selectionEnd && [styles.selectedInner, { backgroundColor: tint }],
          ]}>
            <Text style={[
              styles.dayText,
              { color: isPast ? `${subtle}50` : isBlocked ? '#dc2626' : text },
              isToday && !isSelected && { color: tint, fontWeight: '700' },
              (isRangeStart || (isRangeEnd && selectionEnd)) && isSelected && { color: '#fff', fontWeight: '700' },
            ]}>
              {day}
            </Text>
          </View>
          {!isPast && isBlocked && !isSelected && <View style={styles.blockedDot} />}
        </TouchableOpacity>
      );
    }

    return <View style={styles.daysGrid}>{days}</View>;
  };

  const hasSelection = !!selectionStart;
  const selectedCount = (() => {
    if (!selectionStart) return 0;
    if (!selectionEnd) return 1;
    const start = new Date(selectionStart);
    const end = new Date(selectionEnd);
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Calendar</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Property strip */}
        {propertyLoading ? (
          <ActivityIndicator color={tint} style={{ paddingVertical: 16 }} />
        ) : property ? (
          <View style={[styles.propCard, { backgroundColor: card }]}>
            {(property.media?.images?.[0] || property.thumbnail || property.images?.[0]) && (
              <Image
                source={{ uri: property.media?.images?.[0] || property.thumbnail || property.images?.[0] }}
                style={styles.propImage}
                contentFit="cover"
              />
            )}
            <View style={styles.propInfo}>
              <Text style={[styles.propTitle, { color: text }]} numberOfLines={1}>{property.title}</Text>
              <Text style={[styles.propLocation, { color: subtle }]} numberOfLines={1}>
                {property.district || property.address?.district}, {property.region || property.address?.region}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Calendar */}
        <View style={[styles.calendarSection, { backgroundColor: card }]}>
          {/* Month nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={styles.monthBtn}>
              <Ionicons name="chevron-back" size={20} color={text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: text }]}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={styles.monthBtn}>
              <Ionicons name="chevron-forward" size={20} color={text} />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={[styles.weekLabel, { color: subtle }]}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          {isLoading ? (
            <ActivityIndicator color={tint} style={{ paddingVertical: 40 }} />
          ) : renderCalendar()}

          {/* Legend */}
          <View style={[styles.legend, { borderTopColor: border }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
              <Text style={[styles.legendText, { color: subtle }]}>Blocked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: tint }]} />
              <Text style={[styles.legendText, { color: subtle }]}>Selected</Text>
            </View>
          </View>

          {/* Instruction */}
          {!hasSelection && (
            <Text style={[styles.hint, { color: subtle }]}>
              Tap dates to select a range.{'\n'}Blocked dates won't appear in guest searches.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar — appears when dates are selected */}
      {hasSelection && (
        <View style={[styles.bottomBar, { backgroundColor: card, borderTopColor: border }]}>
          <View style={styles.bottomInfo}>
            <Text style={[styles.bottomLabel, { color: text }]}>
              {selectedCount} day{selectedCount !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity onPress={clearSelection}>
              <Text style={[styles.clearText, { color: tint }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomBtns}>
            {selectionIsBlocked() ? (
              <TouchableOpacity
                style={[styles.bottomBtn, styles.unblockBtn]}
                onPress={handleUnblockDates}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <Text style={styles.bottomBtnText}>Unblock dates</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.bottomBtn, styles.blockBtn]}
                onPress={handleBlockDates}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator size="small" color="#fff" /> : (
                  <Text style={styles.bottomBtnText}>Block dates</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: { width: 30 },
  headerTitle: { fontSize: 17, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 },

  // Property
  propCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  propImage: { width: 48, height: 48, borderRadius: 10 },
  propInfo: { flex: 1 },
  propTitle: { fontSize: 15, fontWeight: '600' },
  propLocation: { fontSize: 13, marginTop: 2 },

  // Calendar
  calendarSection: { borderRadius: 16, padding: 16, paddingBottom: 20 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthBtn: { padding: 8 },
  monthTitle: { fontSize: 17, fontWeight: '700' },

  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '600' },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 15 },
  todayInner: { borderWidth: 1.5 },
  selectedInner: {},
  selectedCell: { borderRadius: 0 },
  rangeStartCell: { borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  rangeEndCell: { borderTopRightRadius: 18, borderBottomRightRadius: 18 },
  blockedDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#dc2626',
    marginTop: 1,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13 },

  hint: { fontSize: 13, textAlign: 'center', marginTop: 12 },

  // Bottom action bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bottomLabel: { fontSize: 15, fontWeight: '600' },
  clearText: { fontSize: 14, fontWeight: '600' },
  bottomBtns: { flexDirection: 'row', gap: 12 },
  bottomBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  blockBtn: { backgroundColor: '#dc2626' },
  unblockBtn: { backgroundColor: '#16a34a' },
  bottomBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
