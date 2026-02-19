import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { RentalType } from '@/hooks/useRentalType';
import type { FlattenedLocation } from '@/lib/location/types';
import { toTitleCase, formatDateShort } from '@/lib/utils/common';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  rentalType: RentalType;
  onSearch: (params: SearchParams) => void;
  onRentalTypeChange?: (type: RentalType) => void;
}

export interface SearchParams {
  location?: FlattenedLocation;
  checkInDate?: string;
  checkOutDate?: string;
  moveInDate?: string;
}

export default function SearchModal({
  visible,
  onClose,
  rentalType,
  onSearch,
  onRentalTypeChange,
}: SearchModalProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'location' | 'dates'>('location');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<FlattenedLocation | null>(null);
  
  // Date states
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'checkIn' | 'checkOut' | 'moveIn' | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Dark mode colors
  const cardBg = useThemeColor({ light: '#fff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#374151' }, 'background');
  const pillBg = useThemeColor({ light: '#f7f7f7', dark: '#374151' }, 'background');
  const pillBorder = useThemeColor({ light: '#e0e0e0', dark: '#4b5563' }, 'background');
  const closeButtonBg = useThemeColor({ light: '#f7f7f7', dark: '#374151' }, 'background');
  const closeIconColor = useThemeColor({ light: '#222', dark: '#e5e7eb' }, 'text');
  const selectedBorder = useThemeColor({ light: '#222', dark: '#10b981' }, 'text');
  const footerBorder = useThemeColor({ light: '#f0f0f0', dark: '#374151' }, 'background');
  const datePickerBorder = useThemeColor({ light: '#f0f0f0', dark: '#374151' }, 'background');

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Use location search hook
  const { results: filteredLocations, isLoading: isLoadingLocations } = useLocationSearch(searchQuery);

  const isShortTerm = rentalType === RentalType.SHORT_TERM;

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLocationSelect = (location: FlattenedLocation) => {
    setSelectedLocation(location);
    setSearchQuery(location.displayName);
    setActiveSection('dates');
  };

  const handleSearch = () => {
    const params: SearchParams = {
      location: selectedLocation || undefined,
    };

    if (isShortTerm) {
      if (checkInDate) params.checkInDate = checkInDate.toISOString().split('T')[0];
      if (checkOutDate) params.checkOutDate = checkOutDate.toISOString().split('T')[0];
    } else {
      if (moveInDate) params.moveInDate = moveInDate.toISOString().split('T')[0];
    }

    // Call the onSearch callback
    onSearch(params);
    
    // Navigate to search results page
    const searchParams: any = {
      rentalType: isShortTerm ? 'short-term' : 'long-term',
    };

    if (selectedLocation) {
      searchParams.location = selectedLocation.displayName;
      if (selectedLocation.type === 'region') {
        searchParams.region = selectedLocation.name;
      } else {
        searchParams.region = selectedLocation.regionName;
        searchParams.district = selectedLocation.name;
      }
    }

    if (isShortTerm) {
      if (checkInDate) searchParams.checkInDate = checkInDate.toISOString().split('T')[0];
      if (checkOutDate) searchParams.checkOutDate = checkOutDate.toISOString().split('T')[0];
    } else {
      if (moveInDate) searchParams.moveInDate = moveInDate.toISOString().split('T')[0];
    }

    // Close modal and navigate
    onClose();
    router.push({
      pathname: '/search',
      params: searchParams,
    });
  };

  const getMinDate = () => new Date();

  const getMinCheckOutDate = () => {
    if (!checkInDate) return new Date();
    const minDate = new Date(checkInDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <View style={[styles.closeButtonCircle, { backgroundColor: closeButtonBg }]}>
                  <Ionicons name="close" size={20} color={closeIconColor} />
                </View>
              </TouchableOpacity>
              
              {/* Rental Type Tabs in Modal */}
              <View style={styles.headerTabs}>
                <TouchableOpacity 
                  style={styles.headerTab}
                  onPress={() => onRentalTypeChange?.(RentalType.LONG_TERM)}
                >
                  <Text style={[
                    styles.headerTabText,
                    { color: rentalType === RentalType.LONG_TERM ? textColor : '#717171' },
                    rentalType === RentalType.LONG_TERM && styles.headerTabTextActive
                  ]}>
                    Monthly
                  </Text>
                  {rentalType === RentalType.LONG_TERM && (
                    <View style={[styles.headerTabIndicator, { backgroundColor: textColor }]} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerTab}
                  onPress={() => onRentalTypeChange?.(RentalType.SHORT_TERM)}
                >
                  <Text style={[
                    styles.headerTabText,
                    { color: rentalType === RentalType.SHORT_TERM ? textColor : '#717171' },
                    rentalType === RentalType.SHORT_TERM && styles.headerTabTextActive
                  ]}>
                    Nightly
                  </Text>
                  {rentalType === RentalType.SHORT_TERM && (
                    <View style={[styles.headerTabIndicator, { backgroundColor: textColor }]} />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={{ width: 40 }} />
            </View>

            {/* Section Pills */}
            <View style={styles.pillsContainer}>
              <TouchableOpacity
                style={[
                  styles.pill,
                  { backgroundColor: pillBg, borderColor: pillBorder },
                  activeSection === 'location' && [styles.pillActive, { backgroundColor: tintColor }],
                ]}
                onPress={() => setActiveSection('location')}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: textColor },
                    activeSection === 'location' && styles.pillTextActive,
                  ]}
                >
                  Where
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pill,
                  { backgroundColor: pillBg, borderColor: pillBorder },
                  activeSection === 'dates' && [styles.pillActive, { backgroundColor: tintColor }],
                ]}
                onPress={() => setActiveSection('dates')}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: textColor },
                    activeSection === 'dates' && styles.pillTextActive,
                  ]}
                >
                  {isShortTerm ? 'When' : 'Move-in'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
              {activeSection === 'location' && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: textColor }]}>
                      Where to?
                    </Text>
                    {(searchQuery || selectedLocation) && (
                      <TouchableOpacity 
                        onPress={() => {
                          setSearchQuery('');
                          setSelectedLocation(null);
                        }}
                        style={styles.clearSectionButton}
                      >
                        <Text style={[styles.clearSectionText, { color: textColor }]}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={[styles.searchInputContainer, { backgroundColor: cardBg, borderColor }]}>
                    <Ionicons name="search" size={22} color="#717171" />
                    <TextInput
                      style={[styles.searchInput, { color: textColor }]}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search regions or districts"
                      placeholderTextColor="#999"
                      autoFocus
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={22} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {isLoadingLocations ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>Loading locations...</Text>
                    </View>
                  ) : filteredLocations.length > 0 ? (
                    <View style={styles.locationList}>
                      {filteredLocations.map((location, index) => (
                        <TouchableOpacity
                          key={`${location.type}-${location.name}-${index}`}
                          style={[
                            styles.locationItem,
                            { backgroundColor: cardBg, borderColor },
                            selectedLocation?.name === location.name && [styles.locationItemSelected, { borderColor: selectedBorder }],
                          ]}
                          onPress={() => handleLocationSelect(location)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.locationIcon, { backgroundColor: `${tintColor}15` }]}>
                            <Ionicons
                              name={location.type === 'region' ? 'location' : 'location-outline'}
                              size={20}
                              color={tintColor}
                            />
                          </View>
                          <View style={styles.locationInfo}>
                            <Text style={[styles.locationName, { color: textColor }]}>
                              {toTitleCase(location.displayName)}
                            </Text>
                            <Text style={styles.locationType}>
                              {location.type === 'region' ? 'Region' : 'District'}
                            </Text>
                          </View>
                          {selectedLocation?.name === location.name && (
                            <Ionicons name="checkmark-circle" size={24} color={tintColor} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={48} color="#ddd" />
                      <Text style={styles.emptyText}>
                        {searchQuery ? 'No locations found' : 'Start typing to search'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeSection === 'dates' && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: textColor }]}>
                      {isShortTerm ? 'When\'s your trip?' : 'When do you move in?'}
                    </Text>
                    {((isShortTerm && (checkInDate || checkOutDate)) || (!isShortTerm && moveInDate)) && (
                      <TouchableOpacity 
                        onPress={() => {
                          setCheckInDate(null);
                          setCheckOutDate(null);
                          setMoveInDate(null);
                        }}
                        style={styles.clearSectionButton}
                      >
                        <Text style={[styles.clearSectionText, { color: textColor }]}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isShortTerm ? (
                    <>
                      {/* Check-in Date */}
                      <View style={styles.dateSection}>
                        <Text style={[styles.dateLabel, { color: textColor }]}>
                          Check-in
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.dateButton,
                            { backgroundColor: cardBg, borderColor },
                            checkInDate && [styles.dateButtonSelected, { borderColor: selectedBorder }],
                          ]}
                          onPress={() => setShowDatePicker('checkIn')}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.dateIconContainer, { backgroundColor: `${tintColor}15` }]}>
                            <Ionicons name="calendar-outline" size={20} color={tintColor} />
                          </View>
                          <Text style={[styles.dateButtonText, { color: checkInDate ? textColor : '#999' }]}>
                            {checkInDate ? formatDateShort(checkInDate.toISOString()) : 'Add date'}
                          </Text>
                          {checkInDate && (
                            <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Check-out Date */}
                      <View style={styles.dateSection}>
                        <Text style={[styles.dateLabel, { color: textColor }]}>
                          Check-out
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.dateButton,
                            { backgroundColor: cardBg, borderColor },
                            !checkInDate && styles.dateButtonDisabled,
                            checkOutDate && [styles.dateButtonSelected, { borderColor: selectedBorder }],
                          ]}
                          onPress={() => checkInDate && setShowDatePicker('checkOut')}
                          disabled={!checkInDate}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.dateIconContainer, 
                            { backgroundColor: checkInDate ? `${tintColor}15` : '#f5f5f5' }
                          ]}>
                            <Ionicons 
                              name="calendar-outline" 
                              size={20} 
                              color={checkInDate ? tintColor : '#ccc'} 
                            />
                          </View>
                          <Text style={[styles.dateButtonText, { color: checkOutDate ? textColor : '#999' }]}>
                            {checkOutDate ? formatDateShort(checkOutDate.toISOString()) : 'Add date'}
                          </Text>
                          {checkOutDate && (
                            <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                          )}
                        </TouchableOpacity>
                        {!checkInDate && (
                          <Text style={styles.helperText}>Select check-in date first</Text>
                        )}
                      </View>

                      {/* Search Button - Show after checkout date selected */}
                        <TouchableOpacity
                          style={[styles.inlineSearchButton, { backgroundColor: tintColor }]}
                          onPress={handleSearch}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="search" size={18} color="#fff" />
                          <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {/* Move-in Date */}
                      <View style={styles.dateSection}>
                        <Text style={[styles.dateLabel, { color: textColor }]}>
                          Preferred date
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.dateButton,
                            { backgroundColor: cardBg, borderColor },
                            moveInDate && [styles.dateButtonSelected, { borderColor: selectedBorder }],
                          ]}
                          onPress={() => setShowDatePicker('moveIn')}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.dateIconContainer, { backgroundColor: `${tintColor}15` }]}>
                            <Ionicons name="calendar-outline" size={20} color={tintColor} />
                          </View>
                          <Text style={[styles.dateButtonText, { color: moveInDate ? textColor : '#999' }]}>
                            {moveInDate ? formatDateShort(moveInDate.toISOString()) : 'Add date (optional)'}
                          </Text>
                          {moveInDate && (
                            <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                          )}
                        </TouchableOpacity>
                        <Text style={styles.helperText}>
                          When would you like to move in?
                        </Text>
                      </View>

                      {/* Search Button - Show after move-in date selected or allow search without date */}
                      <TouchableOpacity
                        style={[styles.inlineSearchButton, { backgroundColor: tintColor }]}
                        onPress={handleSearch}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="search" size={18} color="#fff" />
                        <Text style={styles.searchButtonText}>Search</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && Platform.OS === 'ios' && (
              <Modal transparent animationType="slide">
                <View style={styles.datePickerModal}>
                  <TouchableOpacity 
                    style={styles.datePickerOverlay} 
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(null)}
                  />
                  <View style={[styles.datePickerContainer, { backgroundColor }]}>
                    <View style={[styles.datePickerHeader, { borderBottomColor: datePickerBorder }]}>
                      <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                        <Text style={[styles.datePickerButton, { color: tintColor }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={
                        showDatePicker === 'checkIn'
                          ? checkInDate || new Date()
                          : showDatePicker === 'checkOut'
                          ? checkOutDate || getMinCheckOutDate()
                          : moveInDate || new Date()
                      }
                      mode="date"
                      display="spinner"
                      minimumDate={
                        showDatePicker === 'checkOut' ? getMinCheckOutDate() : getMinDate()
                      }
                      onChange={(event, selectedDate) => {
                        if (event.type === 'set' && selectedDate) {
                          if (showDatePicker === 'checkIn') {
                            setCheckInDate(selectedDate);
                            if (checkOutDate && selectedDate >= checkOutDate) {
                              setCheckOutDate(null);
                            }
                          } else if (showDatePicker === 'checkOut') {
                            setCheckOutDate(selectedDate);
                          } else if (showDatePicker === 'moveIn') {
                            setMoveInDate(selectedDate);
                          }
                        }
                      }}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={
                  showDatePicker === 'checkIn'
                    ? checkInDate || new Date()
                    : showDatePicker === 'checkOut'
                    ? checkOutDate || getMinCheckOutDate()
                    : moveInDate || new Date()
                }
                mode="date"
                display="default"
                minimumDate={
                  showDatePicker === 'checkOut' ? getMinCheckOutDate() : getMinDate()
                }
                onChange={(event, selectedDate) => {
                  setShowDatePicker(null);
                  if (event.type === 'set' && selectedDate) {
                    if (showDatePicker === 'checkIn') {
                      setCheckInDate(selectedDate);
                      if (checkOutDate && selectedDate >= checkOutDate) {
                        setCheckOutDate(null);
                      }
                    } else if (showDatePicker === 'checkOut') {
                      setCheckOutDate(selectedDate);
                    } else if (showDatePicker === 'moveIn') {
                      setMoveInDate(selectedDate);
                    }
                  }
                }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.92,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#999',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTabs: {
    flexDirection: 'row',
    gap: 24,
  },
  headerTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  headerTabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTabTextActive: {
    fontWeight: '600',
  },
  headerTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  pillActive: {
    borderColor: 'transparent',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  clearSectionButton: {
    padding: 4,
  },
  clearSectionText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  locationList: {
    marginTop: 20,
    gap: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  locationItemSelected: {
    borderWidth: 2,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationType: {
    fontSize: 13,
    color: '#717171',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateButtonSelected: {
    borderWidth: 2,
  },
  dateButtonDisabled: {
    opacity: 0.4,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  helperText: {
    fontSize: 14,
    color: '#717171',
    marginTop: 10,
    marginLeft: 4,
  },
  inlineSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 32,
    marginBottom: 40,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderBottomWidth: 1,
  },
  datePickerButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});
