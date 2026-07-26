import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 16;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - CALENDAR_PADDING * 2) / 7);

interface CalendarDatePickerProps {
  visible: boolean;
  onClose: () => void;
  checkInDate: string;
  checkOutDate: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  blockedDates?: string[];
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
  secondaryText: string;
  mode?: 'range' | 'single';
  singleDateLabel?: string;
}

export default function CalendarDatePicker({
  visible,
  onClose,
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
  blockedDates = [],
  textColor,
  tintColor,
  backgroundColor,
  borderColor,
  secondaryText,
  mode = 'range',
  singleDateLabel = 'Date',
}: CalendarDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Add date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today || blockedDates.includes(dateStr)) {
      return;
    }

    const createISOString = (dateString: string) => {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0, 0);
      return date.toISOString();
    };

    if (mode === 'single') {
      onCheckInChange(createISOString(dateStr));
      setTimeout(() => onClose(), 300);
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onCheckInChange(createISOString(dateStr));
      onCheckOutChange('');
    } else {
      const checkInStr = new Date(checkInDate).toISOString().split('T')[0];
      const [cy, cm, cd] = checkInStr.split('-').map(Number);
      const checkIn = new Date(cy, cm - 1, cd);

      if (selectedDate <= checkIn) {
        onCheckInChange(createISOString(dateStr));
        onCheckOutChange('');
      } else {
        const isRangeBlocked = isDateRangeBlocked(checkIn, selectedDate);
        if (isRangeBlocked) {
          onCheckInChange(createISOString(dateStr));
          onCheckOutChange('');
        } else {
          onCheckOutChange(createISOString(dateStr));
          setTimeout(() => onClose(), 300);
        }
      }
    }
  };

  const isDateRangeBlocked = (start: Date, end: Date) => {
    const current = new Date(start);
    current.setDate(current.getDate() + 1);

    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      if (blockedDates.includes(dateStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const getCheckInStr = () => {
    if (!checkInDate) return '';
    return new Date(checkInDate).toISOString().split('T')[0];
  };

  const getCheckOutStr = () => {
    if (!checkOutDate) return '';
    return new Date(checkOutDate).toISOString().split('T')[0];
  };

  const isDateInRange = (dateStr: string) => {
    if (!checkInDate || !checkOutDate) return false;

    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    const checkInStr = getCheckInStr();
    const [cy, cm, cd] = checkInStr.split('-').map(Number);
    const start = new Date(cy, cm - 1, cd);

    const checkOutStr = getCheckOutStr();
    const [oy, om, od] = checkOutStr.split('-').map(Number);
    const end = new Date(oy, om - 1, od);

    return date > start && date < end;
  };

  const isDateSelected = (dateStr: string) => {
    if (!checkInDate) return false;
    const checkInStr = getCheckInStr();
    const checkOutStr = getCheckOutStr();
    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const isCheckIn = (dateStr: string) => {
    if (!checkInDate) return false;
    return dateStr === getCheckInStr();
  };

  const isCheckOut = (dateStr: string) => {
    if (!checkOutDate) return false;
    return dateStr === getCheckOutStr();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = new Date(year, month, 1).getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = date < today;
      const isBlocked = blockedDates.includes(dateStr);
      const isSelected = isDateSelected(dateStr);
      const inRange = isDateInRange(dateStr);
      const isStart = isCheckIn(dateStr);
      const isEnd = isCheckOut(dateStr);
      const isDisabled = isPast || isBlocked;
      const hasRange = !!checkInDate && !!checkOutDate;

      // Background highlight for range continuity
      const showRangeBg = (inRange || (isStart && hasRange) || (isEnd && hasRange));

      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell]}
          onPress={() => !isDisabled && handleDateSelect(dateStr)}
          disabled={isDisabled}
          activeOpacity={0.6}
        >
          {/* Range background strip — spans full cell width for visual continuity */}
          {showRangeBg && (
            <View
              style={[
                styles.rangeBg,
                { backgroundColor: `${tintColor}15` },
                isStart && styles.rangeBgStart,
                isEnd && styles.rangeBgEnd,
              ]}
            />
          )}
          {/* Day circle */}
          <View
            style={[
              styles.dayInner,
              isSelected && [styles.selectedDayInner, { backgroundColor: tintColor }],
              isBlocked && styles.blockedDayInner,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                { color: textColor },
                isPast && styles.disabledText,
                isBlocked && styles.blockedText,
                isSelected && styles.selectedText,
                inRange && { color: textColor, fontWeight: '500' as const },
              ]}
            >
              {day}
            </Text>
          </View>
          {isBlocked && !isSelected && <View style={[styles.blockedDot, { backgroundColor: '#ef4444' }]} />}
        </TouchableOpacity>
      );
    }

    return <View style={styles.daysGrid}>{days}</View>;
  };

  const canGoPrevious = () => {
    const today = new Date();
    return (
      currentMonth.getMonth() !== today.getMonth() ||
      currentMonth.getFullYear() !== today.getFullYear()
    );
  };

  const nightsCount = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    return Math.round((end.getTime() - start.getTime()) / 86400000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close calendar">
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Select dates</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Selected Dates Display */}
          {mode === 'range' ? (
            <View style={styles.selectedDatesContainer}>
              <View
                style={[
                  styles.dateBox,
                  { borderColor: checkInDate ? tintColor : borderColor, backgroundColor: checkInDate ? `${tintColor}08` : 'transparent' },
                ]}
              >
                <Text style={[styles.dateLabel, { color: secondaryText }]}>CHECK-IN</Text>
                <Text style={[styles.dateValue, { color: checkInDate ? textColor : secondaryText }]} numberOfLines={1}>
                  {formatDateDisplay(checkInDate)}
                </Text>
              </View>

              <View style={[styles.dateArrow, { backgroundColor: borderColor }]}>
                <Ionicons name="arrow-forward" size={12} color={secondaryText} />
              </View>

              <View
                style={[
                  styles.dateBox,
                  { borderColor: checkOutDate ? tintColor : borderColor, backgroundColor: checkOutDate ? `${tintColor}08` : 'transparent' },
                ]}
              >
                <Text style={[styles.dateLabel, { color: secondaryText }]}>CHECK-OUT</Text>
                <Text style={[styles.dateValue, { color: checkOutDate ? textColor : secondaryText }]} numberOfLines={1}>
                  {formatDateDisplay(checkOutDate)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.selectedDatesContainer}>
              <View style={[styles.singleDateBox, { borderColor }]}>
                <Text style={[styles.dateLabel, { color: secondaryText }]}>{singleDateLabel}</Text>
                <Text style={[styles.dateValue, { color: textColor }]} numberOfLines={1}>
                  {formatDateDisplay(checkInDate)}
                </Text>
              </View>
            </View>
          )}

          {/* Nights indicator */}
          {mode === 'range' && nightsCount() > 0 && (
            <View style={styles.nightsBadge}>
              <Ionicons name="moon-outline" size={13} color={tintColor} />
              <Text style={[styles.nightsText, { color: tintColor }]}>
                {nightsCount()} night{nightsCount() !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={handlePreviousMonth}
              style={styles.navButton}
              disabled={!canGoPrevious()}
              accessibilityLabel="Previous month"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={canGoPrevious() ? textColor : `${secondaryText}40`}
              />
            </TouchableOpacity>

            <Text style={[styles.monthTitle, { color: textColor }]}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.weekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <View key={index} style={styles.weekDayCell}>
                <Text style={[styles.weekDayText, { color: secondaryText }]}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            {renderCalendar()}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: tintColor }]} />
              <Text style={[styles.legendText, { color: secondaryText }]}>Selected</Text>
            </View>
            {blockedDates.length > 0 && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={[styles.legendText, { color: secondaryText }]}>Unavailable</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Done Button — pinned to bottom */}
        <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
          <TouchableOpacity
            style={[
              styles.doneButton,
              { backgroundColor: tintColor },
              (mode === 'range' ? !checkInDate || !checkOutDate : !checkInDate) && styles.doneButtonDisabled,
            ]}
            onPress={onClose}
            disabled={mode === 'range' ? !checkInDate || !checkOutDate : !checkInDate}
            accessibilityLabel="Confirm dates"
          >
            <Text style={styles.doneButtonText}>
              {mode === 'range' && checkInDate && checkOutDate
                ? `Done · ${nightsCount()} night${nightsCount() !== 1 ? 's' : ''}`
                : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 16,
  },
  selectedDatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  dateBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  singleDateBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  dateArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  nightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  nightsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    padding: 6,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: CALENDAR_PADDING,
    marginBottom: 4,
  },
  weekDayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: CALENDAR_PADDING,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Range background — stretches full cell width to connect days visually
  rangeBg: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
  },
  rangeBgStart: {
    left: '50%',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  rangeBgEnd: {
    right: '50%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  dayInner: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: (DAY_SIZE - 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  selectedDayInner: {
    // backgroundColor set inline via tintColor
  },
  blockedDayInner: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
  },
  disabledText: {
    opacity: 0.3,
  },
  blockedText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  blockedDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    opacity: 0.4,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
