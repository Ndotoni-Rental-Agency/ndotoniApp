import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface CoordinatesInputProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
}

export default function CoordinatesInput({ value, onChange }: CoordinatesInputProps) {
  const [latitude, setLatitude] = useState(value?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(value?.longitude?.toString() || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');

  const handleLatitudeChange = (text: string) => {
    setLatitude(text);
    const lat = parseFloat(text);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      onChange({ latitude: lat, longitude: lng });
    } else if (text === '' && longitude === '') {
      onChange(null);
    }
  };

  const handleLongitudeChange = (text: string) => {
    setLongitude(text);
    const lat = parseFloat(latitude);
    const lng = parseFloat(text);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      onChange({ latitude: lat, longitude: lng });
    } else if (text === '' && latitude === '') {
      onChange(null);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use your current location.'
        );
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude.toFixed(6);
      const lng = location.coords.longitude.toFixed(6);

      setLatitude(lat);
      setLongitude(lng);
      onChange({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });

      setIsGettingLocation(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      setIsGettingLocation(false);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or enter coordinates manually.'
      );
    }
  };

  const handleClear = () => {
    setLatitude('');
    setLongitude('');
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: placeholderColor }]}>Latitude</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
            value={latitude}
            onChangeText={handleLatitudeChange}
            placeholder="-6.7924"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            editable={!isGettingLocation}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: placeholderColor }]}>Longitude</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
            value={longitude}
            onChangeText={handleLongitudeChange}
            placeholder="39.2083"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            editable={!isGettingLocation}
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor }]}
          onPress={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : (
            <>
              <Ionicons name="navigate" size={18} color={tintColor} />
              <Text style={[styles.buttonText, { color: tintColor }]}>Use Current Location</Text>
            </>
          )}
        </TouchableOpacity>

        {(latitude || longitude) && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor }]}
            onPress={handleClear}
            disabled={isGettingLocation}
          >
            <Ionicons name="close" size={18} color={textColor} />
            <Text style={[styles.buttonText, { color: textColor }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {value && (
        <View style={[styles.infoCard, { backgroundColor: inputBg, borderColor }]}>
          <Ionicons name="information-circle" size={16} color={tintColor} />
          <Text style={[styles.infoText, { color: placeholderColor }]}>
            Coordinates will help users find your property on the map
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
});
