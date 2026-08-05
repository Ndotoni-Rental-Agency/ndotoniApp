import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { getDistricts, getRegions, getWards } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import BrandLoader from '@/components/ui/BrandLoader';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface LocationValue {
  region: string;
  district: string;
  ward?: string;
  street?: string;
}

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (location: LocationValue) => void;
  required?: boolean;
}

interface Region {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  regionId: string;
}

interface Ward {
  id: string;
  name: string;
  districtId: string;
}

export default function LocationSelector({ value, onChange, required }: LocationSelectorProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const inputBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'textTertiary');

  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showWardPicker, setShowWardPicker] = useState(false);
  
  const [regionSearch, setRegionSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Fetch districts when region changes
  useEffect(() => {
    if (value.region) {
      const region = regions.find(r => r.name.toLowerCase() === value.region.toLowerCase());
      if (region) {
        fetchDistricts(region.id);
      }
    }
  }, [value.region, regions]);

  // Fetch wards when district changes
  useEffect(() => {
    if (value.district) {
      const district = districts.find(d => d.name.toLowerCase() === value.district.toLowerCase());
      if (district) {
        fetchWards(district.id);
      }
    }
  }, [value.district, districts]);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const data = await GraphQLClient.executePublic<{ getRegions: Region[] }>(
        getRegions
      );
      setRegions(data.getRegions || []);
    } catch (error) {
      console.error('[LocationSelector] Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (regionId: string) => {
    try {
      setLoading(true);
      const data = await GraphQLClient.executePublic<{ getDistricts: District[] }>(
        getDistricts,
        { regionId }
      );
      setDistricts(data.getDistricts || []);
    } catch (error) {
      console.error('[LocationSelector] Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async (districtId: string) => {
    try {
      setLoading(true);
      const data = await GraphQLClient.executePublic<{ getWards: Ward[] }>(
        getWards,
        { districtId }
      );
      setWards(data.getWards || []);
    } catch (error) {
      console.error('[LocationSelector] Error fetching wards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredWards = wards.filter(w =>
    w.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  return (
    <View style={styles.container}>
      {/* Region Selector - Always visible */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: textColor }]}>
          Region {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: inputBg, borderColor }]}
          onPress={() => setShowRegionPicker(true)}
        >
          <Text style={[styles.selectorText, { color: value.region ? textColor : placeholderColor }]}>
            {value.region ? toTitleCase(value.region) : 'Select Region'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={placeholderColor} />
        </TouchableOpacity>
      </View>

      {/* District Selector - Only show after region is selected */}
      {value.region && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>
            District {required && <Text style={styles.required}>*</Text>}
          </Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: inputBg, borderColor }]}
            onPress={() => setShowDistrictPicker(true)}
          >
            <Text style={[styles.selectorText, { color: value.district ? textColor : placeholderColor }]}>
              {value.district ? toTitleCase(value.district) : 'Select District'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={placeholderColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Ward Selector - Only show after district is selected */}
      {value.district && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>Ward (Optional)</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: inputBg, borderColor }]}
            onPress={() => setShowWardPicker(true)}
          >
            <Text style={[styles.selectorText, { color: value.ward ? textColor : placeholderColor }]}>
              {value.ward ? toTitleCase(value.ward) : 'Select Ward'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={placeholderColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Street Input - Only show after ward is selected or skipped */}
      {value.district && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: textColor }]}>Street Address (Optional)</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
            placeholder="e.g., Haile Selassie Road"
            placeholderTextColor={placeholderColor}
            value={value.street || ''}
            onChangeText={(text) => onChange({ ...value, street: text })}
          />
        </View>
      )}

      {/* Region Picker Modal */}
      <Modal visible={showRegionPicker} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Region</Text>
              <TouchableOpacity onPress={() => setShowRegionPicker(false)} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, { color: textColor, backgroundColor: inputBg, borderColor }]}
              placeholder="Search regions..."
              placeholderTextColor={placeholderColor}
              value={regionSearch}
              onChangeText={setRegionSearch}
            />

            {loading ? (
              <BrandLoader style={styles.loader} />
            ) : (
              <FlatList
                data={filteredRegions}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      { borderBottomColor: borderColor },
                      value.region.toLowerCase() === item.name.toLowerCase() && { backgroundColor: tintColor + '20' },
                    ]}
                    onPress={() => {
                      onChange({ region: item.name, district: '', ward: '', street: '' });
                      setShowRegionPicker(false);
                      setRegionSearch('');
                    }}
                  >
                    <Text style={[styles.listItemText, { color: textColor }]}>
                      {toTitleCase(item.name)}
                    </Text>
                    {value.region.toLowerCase() === item.name.toLowerCase() && (
                      <Ionicons name="checkmark" size={20} color={tintColor} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* District Picker Modal */}
      <Modal visible={showDistrictPicker} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select District</Text>
              <TouchableOpacity onPress={() => setShowDistrictPicker(false)} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, { color: textColor, backgroundColor: inputBg, borderColor }]}
              placeholder="Search districts..."
              placeholderTextColor={placeholderColor}
              value={districtSearch}
              onChangeText={setDistrictSearch}
            />

            {loading ? (
              <BrandLoader style={styles.loader} />
            ) : (
              <FlatList
                data={filteredDistricts}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      { borderBottomColor: borderColor },
                      value.district.toLowerCase() === item.name.toLowerCase() && { backgroundColor: tintColor + '20' },
                    ]}
                    onPress={() => {
                      onChange({ ...value, district: item.name, ward: '', street: '' });
                      setShowDistrictPicker(false);
                      setDistrictSearch('');
                    }}
                  >
                    <Text style={[styles.listItemText, { color: textColor }]}>
                      {toTitleCase(item.name)}
                    </Text>
                    {value.district.toLowerCase() === item.name.toLowerCase() && (
                      <Ionicons name="checkmark" size={20} color={tintColor} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Ward Picker Modal */}
      <Modal visible={showWardPicker} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Ward</Text>
              <TouchableOpacity onPress={() => setShowWardPicker(false)} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, { color: textColor, backgroundColor: inputBg, borderColor }]}
              placeholder="Search wards..."
              placeholderTextColor={placeholderColor}
              value={wardSearch}
              onChangeText={setWardSearch}
            />

            {loading ? (
              <BrandLoader style={styles.loader} />
            ) : (
              <FlatList
                data={filteredWards}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      { borderBottomColor: borderColor },
                      value.ward?.toLowerCase() === item.name.toLowerCase() && { backgroundColor: tintColor + '20' },
                    ]}
                    onPress={() => {
                      onChange({ ...value, ward: item.name, street: '' });
                      setShowWardPicker(false);
                      setWardSearch('');
                    }}
                  >
                    <Text style={[styles.listItemText, { color: textColor }]}>
                      {toTitleCase(item.name)}
                    </Text>
                    {value.ward?.toLowerCase() === item.name.toLowerCase() && (
                      <Ionicons name="checkmark" size={20} color={tintColor} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  required: {
    color: '#ef4444',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  selectorText: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchInput: {
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
});
