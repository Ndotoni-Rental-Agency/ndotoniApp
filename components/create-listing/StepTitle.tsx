import { AIService, AISuggestionResult } from '@/lib/ai-service';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PROPERTY_TYPES, StepProps } from './types';

export default function StepTitle({ form, updateField, colors }: StepProps) {
  const { text, tint, card, border, subtle } = colors;
  const [generating, setGenerating] = useState(false);
  const [marketContext, setMarketContext] = useState<AISuggestionResult | null>(null);

  const generateTitle = async () => {
    setGenerating(true);
    try {
      const result = await AIService.suggest({
        type: 'TITLE',
        propertyType: form.propertyType,
        region: form.region,
        district: form.district,
        maxGuests: form.maxGuests ? parseInt(form.maxGuests) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
        stayCategories: form.stayCategories,
        currency: form.currency,
        nightlyRate: form.nightlyRate ? parseFloat(form.nightlyRate) : undefined,
        images: form.images.slice(0, 3),
        userContext: form.title || undefined,
      });
      if (result.title) updateField('title', result.title);
      setMarketContext(result);
    } catch (err) {
      console.error('AI title error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Text style={[styles.heading, { color: text }]}>
        Now, let's give your{'\n'}place a title
      </Text>
      <Text style={[styles.subtitle, { color: subtle }]}>
        Short titles work best. Have fun with it — you can always change it.
      </Text>

      {/* Title input */}
      <View style={[styles.inputWrap, { borderColor: border, backgroundColor: card }]}>
        <TextInput
          style={[styles.input, { color: text }]}
          value={form.title}
          onChangeText={v => updateField('title', v)}
          placeholder="e.g. Cozy Beach Villa in Zanzibar"
          placeholderTextColor={`${subtle}80`}
          multiline
          maxLength={80}
          accessibilityLabel="Property title"
        />
        <Text style={[styles.charCount, { color: subtle }]}>{form.title.length}/80</Text>
      </View>

      {/* AI generate button */}
      <TouchableOpacity
        style={[styles.aiBtn, { backgroundColor: `${tint}08`, borderColor: `${tint}30` }]}
        onPress={generateTitle}
        disabled={generating || !form.district}
        activeOpacity={0.7}
      >
        {generating ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <Ionicons name="sparkles" size={18} color={tint} />
        )}
        <Text style={[styles.aiBtnText, { color: tint }]}>
          {generating ? 'Writing...' : 'Generate with AI'}
        </Text>
      </TouchableOpacity>

      {/* Market context info */}
      {marketContext?.marketStats && marketContext.marketStats.totalListingsInArea > 0 && (
        <Text style={[styles.marketInfo, { color: subtle }]}>
          {marketContext.marketStats.totalListingsInArea} listings in {form.district} · AI ensured yours is unique
        </Text>
      )}

      {/* Summary review */}
      <View style={[styles.reviewCard, { backgroundColor: card, borderColor: border }]}>
        <Text style={[styles.reviewHeading, { color: text }]}>Your listing summary</Text>
        {[
          {
            icon: 'home-outline' as const,
            value: PROPERTY_TYPES.find(p => p.value === form.propertyType)?.label || form.propertyType,
          },
          { icon: 'location-outline' as const, value: `${form.district}, ${form.region}` },
          {
            icon: 'cash-outline' as const,
            value: `${form.currency} ${parseInt(form.nightlyRate || '0').toLocaleString()}/night`,
          },
          {
            icon: 'people-outline' as const,
            value: `${form.maxGuests} guests · ${form.bedrooms} bed · ${form.bathrooms} bath`,
          },
          { icon: 'images-outline' as const, value: `${form.images.length} photos` },
        ].map((item, i) => (
          <View key={i} style={styles.reviewRow}>
            <Ionicons name={item.icon} size={16} color={subtle} />
            <Text style={[styles.reviewText, { color: subtle }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </>
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
  inputWrap: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    minHeight: 100,
  },
  input: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    flex: 1,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
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
    marginTop: 14,
  },
  aiBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  marketInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  reviewCard: {
    marginTop: 28,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  reviewHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewText: {
    fontSize: 14,
    flex: 1,
  },
});
