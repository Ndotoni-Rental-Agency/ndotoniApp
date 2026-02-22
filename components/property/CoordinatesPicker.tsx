import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface CoordinatesPickerProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
}

export default function CoordinatesPicker({ value, onChange }: CoordinatesPickerProps) {
  const [latitude, setLatitude] = useState(value?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(value?.longitude?.toString() || '');
  const [expanded, setExpanded] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const handleSave = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90.');
      return;
    }

    if (lng < -180 || lng > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180.');
      return;
    }

    onChange({ latitude: lat, longitude: lng });
    setExpanded(false);
  };

  const handleClear = () => {
    setLatitude('');
    setLongitude('');
    onChange(null);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.header, { backgroundColor: cardBg, borderColor }]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons name="location" size={20} color={tintColor} />
          <Text style={[styles.headerText, { color: textColor }]}>
            {value ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}` : 'Add coordinates (optional)'}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={textColor}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.content, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.helperText, { color: placeholderColor }]}>
            Enter the exact location coordinates for better map accuracy
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Latitude</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                placeholder="-6.7924"
                placeholderTextColor={placeholderColor}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Longitude</Text>
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor }]}
                placeholder="39.2083"
                placeholderTextColor={placeholderColor}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton, { borderColor }]}
              onPress={handleClear}
            >
              <Text style={[styles.clearButtonText, { color: textColor }]}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: tintColor }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerText: {
    fontSize: 15,
  },
  content: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
