import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertyReviews } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Review {
  reviewId: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
  propertyId: string;
}

interface Props {
  propertyIds: string[];
  propertyNames: Record<string, string>;
}

export default function HostReviews({ propertyIds, propertyNames }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    if (propertyIds.length > 0) fetchReviews();
    else setLoading(false);
  }, [propertyIds]);

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
});
