import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropertyRulesProps {
  houseRules?: Array<string> | null;
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
    { label: 'Pets', allowed: allowsPets, icon: 'paw' },
    { label: 'Smoking', allowed: allowsSmoking, icon: 'ban' },
    { label: 'Children', allowed: allowsChildren, icon: 'happy' },
    { label: 'Infants', allowed: allowsInfants, icon: 'heart' },
  ].filter(policy => policy.allowed !== null);

  if (!houseRules?.length && policies.length === 0 && !cancellationPolicy) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={22} color={tintColor} />
        <Text style={[styles.title, { color: textColor }]}>House Rules & Policies</Text>
      </View>
      
      {/* Policies */}
      {policies.length > 0 && (
        <View style={styles.policiesGrid}>
          {policies.map((policy, index) => (
            <View key={index} style={styles.policyItem}>
              <Ionicons 
                name={policy.allowed ? 'checkmark-circle' : 'close-circle'} 
                size={20} 
                color={policy.allowed ? '#10b981' : '#ef4444'} 
              />
              <Text style={[styles.policyText, { color: textColor }]}>
                {policy.label} {policy.allowed ? 'Allowed' : 'Not Allowed'}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Cancellation Policy */}
      {cancellationPolicy && (
        <View style={styles.policyRow}>
          <Ionicons name="calendar-outline" size={20} color={secondaryText} />
          <View style={styles.policyContent}>
            <Text style={[styles.policyLabel, { color: secondaryText }]}>Cancellation Policy</Text>
            <Text style={[styles.policyValue, { color: textColor }]}>
              {cancellationPolicy.charAt(0) + cancellationPolicy.slice(1).toLowerCase()}
            </Text>
          </View>
        </View>
      )}
      
      {/* House Rules */}
      {houseRules && houseRules.length > 0 && (
        <View style={styles.rulesSection}>
          <Text style={[styles.rulesTitle, { color: textColor }]}>Additional Rules</Text>
          <View style={styles.rulesList}>
            {houseRules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Ionicons name="ellipse" size={6} color={secondaryText} />
                <Text style={[styles.ruleText, { color: textColor }]}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  policiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
  },
  policyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  policyContent: {
    flex: 1,
    gap: 4,
  },
  policyLabel: {
    fontSize: 13,
  },
  policyValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  rulesSection: {
    gap: 12,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rulesList: {
    gap: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingLeft: 4,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
});
