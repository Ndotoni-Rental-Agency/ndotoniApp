import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  mode?: 'date' | 'time';
  placeholder?: string;
  helperText?: string;
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
  placeholderColor: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabledDates?: string[]; // Array of date strings in YYYY-MM-DD format
}

export default function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder,
  helperText,
  textColor,
  tintColor,
  backgroundColor,
  borderColor,
  placeholderColor,
  minimumDate,
  maximumDate,
  disabledDates = [],
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() => {
    if (value) {
      if (mode === 'date') {
        // Parse ISO datetime string or YYYY-MM-DD format
        return new Date(value);
      } else {
        // Parse time string like "14:00"
        const [hours, minutes] = value.split(':').map(Number);
        const date = new Date();
        date.setHours(hours || 0, minutes || 0, 0, 0);
        return date;
      }
    }
    return new Date();
  });

  const formatDisplayValue = (dateString: string) => {
    if (!dateString) return '';
    
    if (mode === 'date') {
      // Display as YYYY-MM-DD for user readability
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      return dateString; // Time is already in HH:MM format
    }
  };

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      // Format as ISO 8601 datetime string for AWSDateTime
      return date.toISOString();
    } else {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  };

  const isDateDisabled = (date: Date) => {
    if (mode !== 'date' || disabledDates.length === 0) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return disabledDates.includes(dateStr);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      // Check if the selected date is disabled
      if (isDateDisabled(selectedDate)) {
        // Don't update if date is disabled
        return;
      }
      
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        onChange(formatDate(selectedDate));
      }
    }
  };

  const handleConfirm = () => {
    // Double-check the date isn't disabled before confirming
    if (isDateDisabled(tempDate)) {
      return;
    }
    onChange(formatDate(tempDate));
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const displayValue = value ? formatDisplayValue(value) : (placeholder || (mode === 'date' ? 'YYYY-MM-DD' : 'HH:MM'));
  const hasValue = !!value;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      
      <TouchableOpacity
        style={[styles.input, { backgroundColor, borderColor }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.inputText, { color: hasValue ? textColor : placeholderColor }]}>
          {displayValue}
        </Text>
        <Ionicons 
          name={mode === 'date' ? 'calendar-outline' : 'time-outline'} 
          size={20} 
          color={tintColor} 
        />
      </TouchableOpacity>

      {helperText && (
        <Text style={[styles.helperText, { color: placeholderColor }]}>{helperText}</Text>
      )}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCancel}>
            <Pressable style={[styles.modalContent, { backgroundColor }]} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.modalButton, { color: placeholderColor }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {mode === 'date' ? 'Select Date' : 'Select Time'}
                </Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.modalButton, { color: tintColor }]}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                textColor={textColor}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});
