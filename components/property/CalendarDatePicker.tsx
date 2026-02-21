import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  mode?: 'range' | 'single'; // New prop to control selection mode
  singleDateLabel?: string; // Label for single date mode
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    // Parse date string as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow selecting past dates or blocked dates
    if (selectedDate < today || blockedDates.includes(dateStr)) {
      return;
    }

    // Create ISO string at noon to avoid timezone issues
    const createISOString = (dateString: string) => {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0, 0);
      return date.toISOString();
    };

    // Single date mode - just select one date and close
    if (mode === 'single') {
      onCheckInChange(createISOString(dateStr));
      // Auto-close after single date selection
      setTimeout(() => onClose(), 300);
      return;
    }

    // Range mode - select check-in and check-out
    // If no check-in or if we already have both dates, start fresh with check-in
    if (!checkInDate || (checkInDate && checkOutDate)) {
      onCheckInChange(createISOString(dateStr));
      onCheckOutChange('');
    } else {
      // We have check-in but no check-out
      const checkInStr = new Date(checkInDate).toISOString().split('T')[0];
      const [cy, cm, cd] = checkInStr.split('-').map(Number);
      const checkIn = new Date(cy, cm - 1, cd);
      
      if (selectedDate <= checkIn) {
        // Selected date is before or same as check-in, reset to new check-in
        onCheckInChange(createISOString(dateStr));
        onCheckOutChange('');
      } else {
        // Check if any dates in range are blocked
        const isRangeBlocked = isDateRangeBlocked(checkIn, selectedDate);
        if (isRangeBlocked) {
          // Reset and start with new check-in
          onCheckInChange(createISOString(dateStr));
          onCheckOutChange('');
        } else {
          // Valid check-out date - set it and auto-close
          onCheckOutChange(createISOString(dateStr));
          // Auto-close after checkout selection
          setTimeout(() => onClose(), 300);
        }
      }
    }
  };

  const isDateRangeBlocked = (start: Date, end: Date) => {
    const current = new Date(start);
    current.setDate(current.getDate() + 1); // Start checking from day after check-in
    
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      if (blockedDates.includes(dateStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const isDateInRange = (dateStr: string) => {
    if (!checkInDate || !checkOutDate) return false;
    
    // Parse all dates in local timezone
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    
    const checkInStr = new Date(checkInDate).toISOString().split('T')[0];
    const [cy, cm, cd] = checkInStr.split('-').map(Number);
    const start = new Date(cy, cm - 1, cd);
    
    const checkOutStr = new Date(checkOutDate).toISOString().split('T')[0];
    const [oy, om, od] = checkOutStr.split('-').map(Number);
    const end = new Date(oy, om - 1, od);
    
    return date > start && date < end;
  };

  const isDateSelected = (dateStr: string) => {
    if (!checkInDate) return false;
    
    // Extract date part from ISO strings for comparison
    const checkInStr = new Date(checkInDate).toISOString().split('T')[0];
    const checkOutStr = checkOutDate ? new Date(checkOutDate).toISOString().split('T')[0] : '';
    
    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = date < today;
      const isBlocked = blockedDates.includes(dateStr);
      const isSelected = isDateSelected(dateStr);
      const inRange = isDateInRange(dateStr);
      const isDisabled = isPast || isBlocked;

      let dayStyle = [styles.dayCell];
      let textStyle = [styles.dayText, { color: textColor }];

      if (isBlocked) {
        dayStyle.push([styles.blockedDay, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]);
        textStyle = [styles.blockedText, { color: '#ef4444' }];
      } else if (isPast) {
        dayStyle.push(styles.disabledDay);
        textStyle.push(styles.disabledText);
      } else if (isSelected) {
        dayStyle.push([styles.selectedDay, { backgroundColor: tintColor }]);
        textStyle = [styles.selectedText];
      } else if (inRange) {
        dayStyle.push([styles.rangeDay, { backgroundColor: `${tintColor}20` }]);
      }

      days.push(
        <TouchableOpacity
          key={day}
          style={dayStyle}
          onPress={() => !isDisabled && handleDateSelect(dateStr)}
          disabled={isDisabled}
        >
          <Text style={textStyle}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.daysGrid}>{days}</View>
      </View>
    );
  };

  const canGoPrevious = () => {
    const today = new Date();
    return currentMonth.getMonth() !== today.getMonth() || 
           currentMonth.getFullYear() !== today.getFullYear();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Select dates</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Selected Dates Display */}
        {mode === 'range' ? (
          <View style={styles.selectedDatesContainer}>
            <View style={[styles.dateBox, { borderColor }]}>
              <Text style={[styles.dateLabel, { color: secondaryText }]}>Check-in</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>
                {formatDateDisplay(checkInDate)}
              </Text>
            </View>
            
            <Ionicons name="arrow-forward" size={20} color={secondaryText} />
            
            <View style={[styles.dateBox, { borderColor }]}>
              <Text style={[styles.dateLabel, { color: secondaryText }]}>Check-out</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>
                {formatDateDisplay(checkOutDate)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.selectedDatesContainer}>
            <View style={[styles.singleDateBox, { borderColor }]}>
              <Text style={[styles.dateLabel, { color: secondaryText }]}>{singleDateLabel}</Text>
              <Text style={[styles.dateValue, { color: textColor }]}>
                {formatDateDisplay(checkInDate)}
              </Text>
            </View>
          </View>
        )}

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            onPress={handlePreviousMonth} 
            style={styles.navButton}
            disabled={!canGoPrevious()}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={canGoPrevious() ? textColor : secondaryText + '40'} 
            />
          </TouchableOpacity>
          
          <Text style={[styles.monthTitle, { color: textColor }]}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={28} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={[styles.weekDayText, { color: secondaryText }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        {renderCalendar()}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: tintColor }]} />
            <Text style={[styles.legendText, { color: secondaryText }]}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#ef4444' }]} />
            <Text style={[styles.legendText, { color: secondaryText }]}>Blocked</Text>
          </View>
        </View>

        {/* Done Button */}
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[
              styles.doneButton,
              { backgroundColor: tintColor },
              (mode === 'range' ? (!checkInDate || !checkOutDate) : !checkInDate) && styles.doneButtonDisabled,
            ]}
            onPress={onClose}
            disabled={mode === 'range' ? (!checkInDate || !checkOutDate) : !checkInDate}
          >
            <Text style={styles.doneButtonText}>Done</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  selectedDatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  dateBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  singleDateBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: 20,
    flex: 1,
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
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledText: {
    color: '#9ca3af',
  },
  blockedDay: {
    borderRadius: 8,
    borderWidth: 2,
  },
  blockedText: {
    fontWeight: '600',
  },
  selectedDay: {
    borderRadius: 8,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  rangeDay: {
    borderRadius: 0,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
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
  },
  legendText: {
    fontSize: 13,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
