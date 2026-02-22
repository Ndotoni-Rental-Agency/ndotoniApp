import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import VerifyEmailModal from '@/components/auth/VerifyEmailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createBooking } from '@/lib/graphql/mutations';
import { getBlockedDates } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CalendarDatePicker from './CalendarDatePicker';

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  pricePerNight: number;
  currency?: string;
  minimumStay?: number;
  propertyImage?: string;
}

export default function ReservationModal({
  visible,
  onClose,
  propertyId,
  propertyTitle,
  pricePerNight,
  currency = 'TZS',
  minimumStay = 1,
  propertyImage,
}: ReservationModalProps) {
  const { isAuthenticated } = useAuth();
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  useEffect(() => {
    if (visible) {
      fetchBlockedDates();
    }
  }, [visible, propertyId, isAuthenticated]);

  const fetchBlockedDates = async () => {
    // Only fetch blocked dates if user is authenticated
    // Guests can still select dates and will be prompted to sign in when reserving
    if (!isAuthenticated) {
      setIsLoadingDates(false);
      return;
    }

    setIsLoadingDates(true);
    try {
      const today = new Date();
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      const response = await GraphQLClient.executeAuthenticated<any>(getBlockedDates, {
        propertyId,
        startDate: today.toISOString().split('T')[0],
        endDate: sixMonthsLater.toISOString().split('T')[0],
      });

      const dates = response.getBlockedDates?.dates || [];
      setBlockedDates(dates);
    } catch (error) {
      console.error('[ReservationModal] Error fetching blocked dates:', error);
      // Don't show error to user, just continue without blocked dates info
    } finally {
      setIsLoadingDates(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Add date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    return nights * pricePerNight;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US');
  };

  const isDateBlocked = (dateString: string) => {
    return blockedDates.includes(dateString);
  };

  const isDateRangeBlocked = () => {
    if (!checkInDate || !checkOutDate) return false;
    
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (isDateBlocked(dateStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return false;
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      setShowSignInModal(true);
      return;
    }

    if (!checkInDate || !checkOutDate) {
      Alert.alert('Select Dates', 'Please select check-in and check-out dates.');
      return;
    }

    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    
    if (checkIn < today) {
      Alert.alert('Invalid Date', 'Check-in date cannot be in the past.');
      return;
    }

    // Check if checkout is after checkin
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date.');
      return;
    }

    // Check if any dates in range are blocked
    if (isDateRangeBlocked()) {
      Alert.alert('Dates Unavailable', 'Some dates in your selected range are already booked. Please choose different dates.');
      return;
    }

    const nights = calculateNights();
    if (nights < minimumStay) {
      Alert.alert('Minimum Stay', `This property requires a minimum stay of ${minimumStay} night${minimumStay > 1 ? 's' : ''}.`);
      return;
    }

    setIsBooking(true);
    try {
      const response = await GraphQLClient.executeAuthenticated<any>(createBooking, {
        input: {
          propertyId,
          checkInDate,
          checkOutDate,
          numberOfGuests: 1, // You might want to add a guest selector
          totalPrice: calculateTotalPrice(),
        },
      });

      if (response.createBooking?.success) {
        Alert.alert('Success', 'Your reservation has been submitted!', [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              // Navigate to bookings page or show confirmation
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.createBooking?.message || 'Failed to create reservation.');
      }
    } catch (error) {
      console.error('[ReservationModal] Error creating booking:', error);
      Alert.alert('Error', 'Failed to create reservation. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Reserve</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Property Info */}
          <View style={[styles.propertyInfo, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.propertyContent}>
              {propertyImage && (
                <Image
                  source={{ uri: propertyImage }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.propertyTextContent}>
                <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={2}>
                  {propertyTitle}
                </Text>
                <Text style={[styles.priceText, { color: textColor }]}>
                  {currency === 'TZS' ? 'Tshs' : currency} {formatCurrency(pricePerNight)} per night
                </Text>
              </View>
            </View>
          </View>

          {/* Calendar Date Picker */}
          <View style={styles.dateSelectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Select dates</Text>
            
            {isLoadingDates && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={tintColor} />
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.dateSelector, { backgroundColor: cardBg, borderColor }]}
              onPress={() => setShowCalendar(true)}
            >
              <View style={styles.dateSelectorContent}>
                <View style={styles.dateColumn}>
                  <Text style={[styles.dateLabel, { color: secondaryText }]}>Check-in</Text>
                  <Text style={[styles.dateValue, { color: checkInDate ? textColor : '#999' }]}>
                    {formatDateDisplay(checkInDate)}
                  </Text>
                </View>
                
                <Ionicons name="arrow-forward" size={20} color={secondaryText} />
                
                <View style={styles.dateColumn}>
                  <Text style={[styles.dateLabel, { color: secondaryText }]}>Check-out</Text>
                  <Text style={[styles.dateValue, { color: checkOutDate ? textColor : '#999' }]}>
                    {formatDateDisplay(checkOutDate)}
                  </Text>
                </View>
              </View>
              
              <Ionicons name="calendar-outline" size={24} color={tintColor} />
            </TouchableOpacity>
            
            {!isAuthenticated && (
              <View style={[styles.infoBox, { backgroundColor: `${tintColor}15`, borderColor: `${tintColor}40` }]}>
                <Ionicons name="information-circle-outline" size={18} color={tintColor} />
                <Text style={[styles.infoText, { color: textColor }]}>
                  Sign in to see real-time availability
                </Text>
              </View>
            )}
          </View>

          {/* Price Summary */}
          {checkInDate && checkOutDate && nights > 0 && (
            <View style={[styles.priceSummary, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.summaryTitle, { color: textColor }]}>Price details</Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textColor }]}>
                  {currency === 'TZS' ? 'Tshs' : currency} {formatCurrency(pricePerNight)} x {nights} night{nights > 1 ? 's' : ''}
                </Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>
                  {currency === 'TZS' ? 'Tshs' : currency} {formatCurrency(totalPrice)}
                </Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: textColor }]}>Total</Text>
                <Text style={[styles.totalValue, { color: textColor }]}>
                  {currency === 'TZS' ? 'Tshs' : currency} {formatCurrency(totalPrice)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Reserve Button */}
        <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
          <TouchableOpacity
            style={[
              styles.reserveButton,
              { backgroundColor: tintColor },
              (!checkInDate || !checkOutDate || isBooking) && styles.reserveButtonDisabled,
            ]}
            onPress={handleReserve}
            disabled={!checkInDate || !checkOutDate || isBooking}
          >
            {isBooking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reserveButtonText}>
                {!isAuthenticated ? 'Sign in to reserve' : 'Reserve'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign In Modal */}
      <SignInModal
        visible={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSwitchToSignUp={() => {
          setShowSignInModal(false);
          setShowSignUpModal(true);
        }}
        onForgotPassword={() => {
          setShowSignInModal(false);
          setShowForgotPasswordModal(true);
        }}
        onNeedsVerification={(email) => {
          setShowSignInModal(false);
          setVerificationEmail(email);
          setShowVerifyEmailModal(true);
        }}
      />

      <SignUpModal
        visible={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToSignIn={() => {
          setShowSignUpModal(false);
          setShowSignInModal(true);
        }}
        onNeedsVerification={(email) => {
          setShowSignUpModal(false);
          setVerificationEmail(email);
          setShowVerifyEmailModal(true);
        }}
      />

      <VerifyEmailModal
        visible={showVerifyEmailModal}
        onClose={() => setShowVerifyEmailModal(false)}
        email={verificationEmail}
        onVerified={() => {
          setShowVerifyEmailModal(false);
          setShowSignInModal(true);
        }}
      />

      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onCodeSent={(email) => {
          setShowForgotPasswordModal(false);
          setVerificationEmail(email);
          setShowResetPasswordModal(true);
        }}
      />

      <ResetPasswordModal
        visible={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        email={verificationEmail}
        onReset={() => {
          setShowResetPasswordModal(false);
          setShowSignInModal(true);
        }}
      />

      {/* Calendar Modal */}
      <CalendarDatePicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onCheckInChange={setCheckInDate}
        onCheckOutChange={setCheckOutDate}
        blockedDates={blockedDates}
        textColor={textColor}
        tintColor={tintColor}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        secondaryText={secondaryText}
      />
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
  content: {
    flex: 1,
  },
  propertyInfo: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  propertyContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  propertyImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  propertyTextContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dateSelectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  priceSummary: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 15,
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  reserveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
