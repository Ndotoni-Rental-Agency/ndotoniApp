import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface GenderPickerProps {
  label: string;
  value: string;
  onChange: (gender: string) => void;
  textColor: string;
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
  placeholderColor: string;
}

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function GenderPicker({
  label,
  value,
  onChange,
  textColor,
  tintColor,
  backgroundColor,
  borderColor,
  placeholderColor,
}: GenderPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedGender = GENDER_OPTIONS.find(
    (option) => option.id.toLowerCase() === value.toLowerCase()
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      <TouchableOpacity
        style={[styles.selector, { backgroundColor, borderColor }]}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            styles.selectorText,
            { color: value ? textColor : placeholderColor },
          ]}
        >
          {selectedGender?.label || 'Select Gender'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={placeholderColor} />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={GENDER_OPTIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    { borderBottomColor: borderColor },
                    value.toLowerCase() === item.id.toLowerCase() && {
                      backgroundColor: `${tintColor}20`,
                    },
                  ]}
                  onPress={() => {
                    onChange(item.id);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[styles.listItemText, { color: textColor }]}>
                    {item.label}
                  </Text>
                  {value.toLowerCase() === item.id.toLowerCase() && (
                    <Ionicons name="checkmark" size={20} color={tintColor} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
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
    maxHeight: '60%',
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
});
