import { AIService } from '@/lib/ai-service';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { StepProps } from './types';

export default function StepPricing({ form, updateField, colors }: StepProps) {
  const { text, tint, card, border, subtle } = colors;
  const [predictingPrice, setPredictingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);

  const suggestPrice = async () => {
    setPredictingPrice(true);
    try {
      const result = await AIService.predictPrice({
        propertyType: form.propertyType,
        district: form.district,
        region: form.region,
        maxGuests: parseInt(form.maxGuests) || 2,
      });
      setPriceSuggestion(result);
    } catch (err) {
      console.error('AI price error:', err);
    } finally {
      setPredictingPrice(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View>
        <Text style={[styles.heading, { color: text }]}>Now, set your price</Text>
        <Text style={[styles.subtitle, { color: subtle }]}>
          You can change it anytime.
        </Text>

        {/* Price input area */}
        <View style={[styles.priceCard, { backgroundColor: card, borderColor: border }]}>
          {/* Currency toggle */}
          <TouchableOpacity
            style={[styles.currencyToggle, { borderColor: border }]}
            onPress={() => updateField('currency', form.currency === 'TZS' ? 'USD' : 'TZS')}
            accessibilityLabel="Switch currency"
          >
            <Text style={[styles.currencyText, { color: text }]}>{form.currency}</Text>
            <Ionicons name="swap-horizontal" size={14} color={subtle} />
          </TouchableOpacity>

          {/* Big price input */}
          <TextInput
            style={[styles.priceInput, { color: text }]}
            value={form.nightlyRate}
            onChangeText={v => updateField('nightlyRate', v.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={`${subtle}40`}
            keyboardType="number-pad"
            textAlign="center"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            accessibilityLabel="Price per night"
          />

          <Text style={[styles.perNight, { color: subtle }]}>per night</Text>
        </View>

        {/* AI suggestion button */}
        <TouchableOpacity
          style={[styles.aiBtn, { backgroundColor: `${tint}10`, borderColor: `${tint}25` }]}
          onPress={() => { Keyboard.dismiss(); suggestPrice(); }}
          disabled={predictingPrice || !form.district}
          activeOpacity={0.7}
        >
          {predictingPrice ? (
            <ActivityIndicator size="small" color={tint} />
          ) : (
            <Ionicons name="sparkles" size={18} color={tint} />
          )}
          <Text style={[styles.aiBtnText, { color: tint }]}>
            {predictingPrice ? 'Analyzing market...' : 'Get AI price suggestion'}
          </Text>
        </TouchableOpacity>

        {/* Suggestion result */}
        {priceSuggestion && (
          <View style={[styles.suggBox, { backgroundColor: `${tint}06`, borderColor: `${tint}20` }]}>
            <View style={styles.suggHeader}>
              <Ionicons name="sparkles" size={16} color={tint} />
              <Text style={[styles.suggTitle, { color: text }]}>AI Suggestion</Text>
            </View>

            <Text style={[styles.suggPrice, { color: text }]}>
              TZS {priceSuggestion.suggestedPrice?.toLocaleString()}
              <Text style={[styles.suggPerNight, { color: subtle }]}> /night</Text>
            </Text>

            <View style={[styles.rangeBar, { backgroundColor: `${tint}12` }]}>
              <Text style={[styles.rangeText, { color: subtle }]}>
                Range: TZS {priceSuggestion.range?.min?.toLocaleString()} – {priceSuggestion.range?.max?.toLocaleString()}
              </Text>
            </View>

            {priceSuggestion.reasoning && (
              <Text style={[styles.suggReason, { color: subtle }]}>
                {priceSuggestion.reasoning}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.useBtn, { backgroundColor: tint }]}
              onPress={() => {
                updateField('nightlyRate', priceSuggestion.suggestedPrice.toString());
                setPriceSuggestion(null);
              }}
            >
              <Text style={styles.useBtnText}>Use this price</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  priceCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  currencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  currencyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceInput: {
    fontSize: 52,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
    minWidth: 180,
  },
  perNight: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  aiBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  suggBox: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  suggHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  suggPrice: {
    fontSize: 24,
    fontWeight: '800',
  },
  suggPerNight: {
    fontSize: 16,
    fontWeight: '500',
  },
  rangeBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  suggReason: {
    fontSize: 13,
    lineHeight: 18,
  },
  useBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  useBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
