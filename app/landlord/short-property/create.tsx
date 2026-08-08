import StepBasics from '@/components/create-listing/StepBasics';
import StepCategories from '@/components/create-listing/StepCategories';
import StepLocation from '@/components/create-listing/StepLocation';
import StepPhotos from '@/components/create-listing/StepPhotos';
import StepPricing from '@/components/create-listing/StepPricing';
import StepPropertyType from '@/components/create-listing/StepPropertyType';
import StepTitle from '@/components/create-listing/StepTitle';
import { CreateListingForm, TOTAL_STEPS } from '@/components/create-listing/types';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft, submitContactInquiry } from '@/lib/graphql/mutations';
import { validateInternationalPhone } from '@/lib/utils/phoneValidation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreatePropertyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Theme colors
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const subtle = useThemeColor({}, 'textSecondary');
  const colors = { text, tint, card, border, subtle };

  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateListingForm>({
    propertyType: '',
    stayCategories: [],
    region: '',
    district: '',
    ward: '',
    street: '',
    googleMapsLink: '',
    title: '',
    nightlyRate: '',
    currency: 'TZS',
    maxGuests: '2',
    bedrooms: '1',
    bathrooms: '1',
    instantBookEnabled: false,
    images: [],
    videos: [],
  });

  // Animations
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Let the team know a host started a listing, so they can follow up if it's abandoned.
  // Fires the moment there's a real way to reach them — a valid phone on file — or, failing
  // that, when they leave the screen, so we still hear about a drop-off even without contact
  // info. Guarded so only one of the two ever actually sends. formRef exists because the exit
  // path fires from a cleanup function, whose closure would otherwise see stale (mount-time)
  // form values instead of what was on screen right before they left.
  const hasNotifiedStartRef = useRef(false);
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  function notifyListingStarted(reason: 'phone' | 'exit') {
    if (hasNotifiedStartRef.current) return;
    hasNotifiedStartRef.current = true;

    const f = formRef.current;
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Ndotoni host';
    const details = [
      f.propertyType ? `Type: ${f.propertyType}` : null,
      f.stayCategories.length ? `Categories: ${f.stayCategories.join(', ')}` : null,
      f.region ? `Location: ${[f.region, f.district].filter(Boolean).join(', ')}` : null,
      f.nightlyRate ? `Rate: ${f.nightlyRate} ${f.currency}/night` : null,
      `Guests: ${f.maxGuests} · Bedrooms: ${f.bedrooms} · Bathrooms: ${f.bathrooms}`,
      f.images.length ? `Photos:\n${f.images.join('\n')}` : null,
      f.videos.length ? `Videos:\n${f.videos.join('\n')}` : null,
    ].filter(Boolean).join('\n');
    const action = reason === 'phone' ? 'has a phone number on file while' : 'left the screen while';

    GraphQLClient.executePublic(submitContactInquiry, {
      input: {
        inquiryType: 'PROPERTY',
        subject: 'New listing started (App)',
        name,
        email: user?.email || 'unknown@ndotoni.app',
        phone: user?.phoneNumber || undefined,
        message: `${name} ${action} creating a new short-term listing from the ndotoniApp mobile app.\n\n${details}`,
      },
    }).catch(err => console.error('[CreateListing] Failed to notify listing started:', err));
  }

  // Fire immediately since the host's phone is already on file (they're authenticated to
  // reach this screen at all).
  useEffect(() => {
    if (user?.phoneNumber && validateInternationalPhone(user.phoneNumber)) {
      notifyListingStarted('phone');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phoneNumber]);

  // Otherwise (no valid phone on file — rare), fall back to firing on exit.
  useEffect(() => {
    return () => notifyListingStarted('exit');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key: string, val: any) => {
    setForm(f => ({ ...f, [key]: val }));
  };

  const animateToStep = (newStep: number) => {
    const direction = newStep > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 120, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20 * direction, duration: 120, useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(newStep);
      slideAnim.setValue(20 * direction);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 180, useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, duration: 180, useNativeDriver: true,
        }),
      ]).start();
    });
    Animated.timing(progressAnim, {
      toValue: newStep / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.propertyType;
      case 2: return form.stayCategories.length > 0;
      case 3: return !!form.region && !!form.district;
      case 4: return true;
      case 5: return !!form.nightlyRate && parseFloat(form.nightlyRate) > 0;
      case 6: return form.images.length > 0 || form.videos.length > 0;
      case 7: return !!form.title;
      default: return true;
    }
  };

  const goNext = () => {
    if (step < TOTAL_STEPS && canNext()) animateToStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) animateToStep(step - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (!form.title || (form.images.length === 0 && form.videos.length === 0)) {
      showAlert({ title: 'Missing info', message: 'Please add a title and at least one photo or video.', icon: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await GraphQLClient.executeAuthenticated<any>(
        createShortTermPropertyDraft,
        {
          input: {
            title: form.title,
            propertyType: form.propertyType,
            stayCategories: form.stayCategories,
            region: form.region,
            district: form.district || form.region,
            nightlyRate: parseFloat(form.nightlyRate),
            currency: form.currency,
            maxGuests: parseInt(form.maxGuests),
            bedrooms: parseInt(form.bedrooms) || 1,
            bathrooms: parseInt(form.bathrooms) || 1,
            instantBookEnabled: form.instantBookEnabled,
            images: form.images,
            videos: form.videos.length > 0 ? form.videos : undefined,
            googleMapsLink: form.googleMapsLink || undefined,
            guestPhoneNumber: user?.phoneNumber || undefined,
            guestWhatsappNumber:
              user?.whatsappNumber || user?.phoneNumber || undefined,
          },
        }
      );

      if (res.createShortTermPropertyDraft?.success) {
        showAlert({
          title: 'Your place is listed!',
          message: 'You can add more details anytime from your dashboard.',
          icon: 'success',
          buttons: [{ text: 'Done', onPress: () => router.replace('/(tabs)/host') }],
        });
      } else {
        showAlert({ title: 'Error', message: res.createShortTermPropertyDraft?.message || 'Failed', icon: 'error' });
      }
    } catch (err: any) {
      showAlert({ title: 'Error', message: err?.message || 'Something went wrong', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const props = { form, updateField, colors };
    switch (step) {
      case 1: return <StepPropertyType {...props} />;
      case 2: return <StepCategories {...props} />;
      case 3: return <StepLocation {...props} />;
      case 4: return <StepBasics {...props} />;
      case 5: return <StepPricing {...props} />;
      case 6: return <StepPhotos {...props} />;
      case 7: return <StepTitle {...props} />;
      default: return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      {/* ─── Progress bar ─── */}
      <View style={[styles.progressBar, { backgroundColor: border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: tint,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, { color: subtle }]}>
          {step} of {TOTAL_STEPS}
        </Text>
      </View>

      {/* ─── Content ─── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Bottom navigation ─── */}
      <View style={[styles.footer, { borderTopColor: border, backgroundColor: bg }]}>
        {step > 1 && (
          <TouchableOpacity onPress={goBack} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: text }]}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: tint, opacity: canNext() ? 1 : 0.4 },
          ]}
          onPress={isLastStep ? handleSubmit : goNext}
          disabled={!canNext() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.nextBtnText}>
              {isLastStep ? 'Publish listing' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  progressBar: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  backLink: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
