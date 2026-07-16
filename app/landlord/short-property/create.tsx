import StepBasics from '@/components/create-listing/StepBasics';
import StepCategories from '@/components/create-listing/StepCategories';
import StepLocation from '@/components/create-listing/StepLocation';
import StepPhotos from '@/components/create-listing/StepPhotos';
import StepPricing from '@/components/create-listing/StepPricing';
import StepPropertyType from '@/components/create-listing/StepPropertyType';
import StepTitle from '@/components/create-listing/StepTitle';
import { CreateListingForm, TOTAL_STEPS } from '@/components/create-listing/types';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

  // Theme colors
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ddd', dark: '#333' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');
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
      case 6: return form.images.length > 0;
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
    if (!form.title || form.images.length === 0) {
      Alert.alert('Missing info', 'Please add a title and at least one photo.');
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
            guestPhoneNumber: user?.phoneNumber || undefined,
            guestWhatsappNumber:
              user?.whatsappNumber || user?.phoneNumber || undefined,
          },
        }
      );

      if (res.createShortTermPropertyDraft?.success) {
        Alert.alert(
          '🎉 Your place is listed!',
          'You can add more details anytime from your dashboard.',
          [{ text: 'Done', onPress: () => router.replace('/(tabs)/host') }]
        );
      } else {
        Alert.alert('Error', res.createShortTermPropertyDraft?.message || 'Failed');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong');
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
