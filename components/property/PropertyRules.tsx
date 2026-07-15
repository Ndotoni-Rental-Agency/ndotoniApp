import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyRulesProps {
  houseRules?: string[] | null;
  allowsPets?: boolean | null;
  allowsSmoking?: boolean | null;
  allowsChildren?: boolean | null;
  allowsInfants?: boolean | null;
  cancellationPolicy?: string | null;
  textColor: string;
  tintColor: string;
  secondaryText: string;
}

export default function PropertyRules({
  houseRules,
  allowsPets,
  allowsSmoking,
  allowsChildren,
  allowsInfants,
  cancellationPolicy,
  textColor,
  tintColor,
  secondaryText,
}: PropertyRulesProps) {
  const policies = [
    { label: 'Pets', allowed: allowsPets, iconY: 'paw-outline', iconN: 'paw-outline' },
    { label: 'Smoking', allowed: allowsSmoking, iconY: 'flame-outline', iconN: 'flame-outline' },
    { label: 'Children', allowed: allowsChildren, iconY: 'happy-outline', iconN: 'happy-outline' },
    { label: 'Infants', allowed: allowsInfants, iconY: 'heart-outline', iconN: 'heart-outline' },
  ].filter(p => p.allowed !== null && p.allowed !== undefined);

  if (!houseRules?.length && policies.length === 0 && !cancellationPolicy) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>House rules</Text>

      {/* Policies grid */}
      {policies.length > 0 && (
        <View style={styles.policies}>
          {policies.map((policy, index) => (
            <View key={index} style={styles.policyRow}>
              <Ionicons
                name={policy.allowed ? (policy.iconY as any) : (policy.iconN as any)}
                size={20}
                color={policy.allowed ? '#10b981' : secondaryText}
              />
              <Text style={[styles.policyText, { color: textColor }]}>
                {policy.label}
              </Text>
              <Text style={[
                styles.policyStatus,
                { color: policy.allowed ? '#10b981' : '#ef4444' },
              ]}>
                {policy.allowed ? 'Allowed' : 'Not allowed'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Cancellation */}
      {cancellationPolicy && (
        <View style={styles.cancellation}>
          <Ionicons name="calendar-outline" size={20} color={textColor} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cancellationLabel, { color: secondaryText }]}>
              Cancellation policy
            </Text>
            <Text style={[styles.cancellationValue, { color: textColor }]}>
              {cancellationPolicy.charAt(0) + cancellationPolicy.slice(1).toLowerCase()}
            </Text>
          </View>
        </View>
      )}

      {/* House rules list */}
      {houseRules && houseRules.length > 0 && (
        <View style={styles.rulesList}>
          {houseRules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <Text style={[styles.ruleBullet, { color: secondaryText }]}>•</Text>
              <Text style={[styles.ruleText, { color: textColor }]}>{rule}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  policies: {
    gap: 14,
    marginBottom: 16,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  policyText: {
    fontSize: 15,
    flex: 1,
  },
  policyStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  cancellation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cancellationLabel: {
    fontSize: 12,
  },
  cancellationValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  rulesList: {
    gap: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleBullet: {
    fontSize: 18,
    lineHeight: 22,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
});
