import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { respondToReview } from '@/lib/graphql/mutations';
import { getPropertyReviews } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Review {
  reviewId: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
  propertyId: string;
  hostResponse?: string;
}

interface Props {
  propertyIds: string[];
  propertyNames: Record<string, string>;
}

export default function HostReviews({ propertyIds, propertyNames }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    if (propertyIds.length > 0) fetchReviews();
    else setLoading(false);
  }, [propertyIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      const all: Review[] = [];
      const results = await Promise.allSettled(
        propertyIds.slice(0, 10).map(pid =>
          GraphQLClient.executeAuthenticated<any>(getPropertyReviews, { propertyId: pid, limit: 10 })
        )
      );
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'fulfilled') {
          const items = (r.value.getPropertyReviews?.reviews || []).map((rev: any) => ({ ...rev, propertyId: propertyIds[i] }));
          all.push(...items);
        }
      }
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(all);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <ActivityIndicator color={tint} style={{ paddingVertical: 40 }} />;

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await GraphQLClient.executeAuthenticated(respondToReview, {
        input: { reviewId, response: responseText.trim() },
      });
      // Update local state
      setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, hostResponse: responseText.trim() } : r));
      setRespondingTo(null);
      setResponseText('');
      Alert.alert('Done', 'Your response has been posted.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to post response.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="star-outline" size={36} color={subtle} />
        <Text style={[styles.emptyTitle, { color: text }]}>No reviews yet</Text>
        <Text style={[styles.emptySub, { color: subtle }]}>Reviews from guests will appear here</Text>
      </View>
    );
  }

  return (
    <View>
      {reviews.map(r => (
        <View key={r.reviewId || r.createdAt} style={[styles.reviewCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(r.guestName || 'G').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.guestName, { color: text }]}>{r.guestName || 'Guest'}</Text>
              <Text style={[styles.propName, { color: subtle }]}>{propertyNames[r.propertyId] || ''}</Text>
            </View>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons key={i} name="star" size={14} color={i <= (r.rating || 0) ? '#f59e0b' : border} />
              ))}
            </View>
          </View>
          {r.comment && <Text style={[styles.comment, { color: text }]}>{r.comment}</Text>}
          <Text style={[styles.date, { color: subtle }]}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>

          {/* Host response */}
          {r.hostResponse ? (
            <View style={[styles.responseBox, { backgroundColor: `${tint}08`, borderColor: `${tint}30` }]}>
              <Text style={[styles.responseLabel, { color: tint }]}>Your response</Text>
              <Text style={[styles.responseText, { color: text }]}>{r.hostResponse}</Text>
            </View>
          ) : respondingTo === r.reviewId ? (
            <View style={styles.respondForm}>
              <TextInput
                style={[styles.respondInput, { color: text, borderColor: border, backgroundColor: card }]}
                value={responseText}
                onChangeText={setResponseText}
                placeholder="Write a response..."
                placeholderTextColor={subtle}
                multiline
                maxLength={500}
              />
              <View style={styles.respondActions}>
                <TouchableOpacity onPress={() => { setRespondingTo(null); setResponseText(''); }}>
                  <Text style={[styles.cancelBtn, { color: subtle }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitResponseBtn, { backgroundColor: tint, opacity: responseText.trim() ? 1 : 0.5 }]}
                  onPress={() => handleRespond(r.reviewId)}
                  disabled={!responseText.trim() || submitting}
                >
                  {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitResponseText}>Post</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.replyBtn, { borderColor: border }]}
              onPress={() => { setRespondingTo(r.reviewId); setResponseText(''); }}
            >
              <Ionicons name="chatbubble-outline" size={14} color={tint} />
              <Text style={[styles.replyBtnText, { color: tint }]}>Respond</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySub: { fontSize: 13, marginTop: 4 },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  guestName: { fontSize: 14, fontWeight: '600' },
  propName: { fontSize: 11, marginTop: 1 },
  stars: { flexDirection: 'row', gap: 1 },
  comment: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  date: { fontSize: 11, marginTop: 8 },
  responseBox: { marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  responseLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  responseText: { fontSize: 13, lineHeight: 19 },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  replyBtnText: { fontSize: 13, fontWeight: '600' },
  respondForm: { marginTop: 10 },
  respondInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 60, lineHeight: 20 },
  respondActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 },
  cancelBtn: { fontSize: 13, fontWeight: '600' },
  submitResponseBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  submitResponseText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
