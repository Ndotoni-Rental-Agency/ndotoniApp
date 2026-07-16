import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { respondToReview } from '@/lib/graphql/mutations';
import { getPropertyReviews } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Toggle for local demo data (set true to preview, keep false for production) ───
const USE_DEMO_DATA = false;

import { DEMO_REVIEWS } from './__demo__/reviewsDemoData';

interface Review {
  reviewId: string;
  guestName: string;
  overallRating: number;
  accuracy: number;
  cleanliness: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  createdAt: string;
  propertyId: string;
  hostResponse?: string;
  verifiedStay: boolean;
  photos: string[];
}

interface Props {
  propertyIds: string[];
  propertyNames: Record<string, string>;
}

const CATEGORY_LABELS: { key: keyof Pick<Review, 'cleanliness' | 'accuracy' | 'communication' | 'location' | 'value'>; label: string; icon: string }[] = [
  { key: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' },
  { key: 'accuracy', label: 'Accuracy', icon: 'checkmark-circle' },
  { key: 'communication', label: 'Communication', icon: 'chatbubbles' },
  { key: 'location', label: 'Location', icon: 'location' },
  { key: 'value', label: 'Value', icon: 'pricetag' },
];

export default function HostReviews({ propertyIds, propertyNames }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'responded'>('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');
  const inputBg = useThemeColor({ light: '#f5f5f5', dark: '#2c2c2e' }, 'background');

  useEffect(() => {
    if (USE_DEMO_DATA) {
      setReviews(DEMO_REVIEWS);
      setLoading(false);
      return;
    }
    if (propertyIds.length > 0) fetchReviews();
    else setLoading(false);
  }, [propertyIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      const all: Review[] = [];
      const results = await Promise.allSettled(
        propertyIds.slice(0, 10).map(pid =>
          GraphQLClient.executeAuthenticated<any>(getPropertyReviews, { propertyId: pid, limit: 20 })
        )
      );
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'fulfilled') {
          const items = (r.value.getPropertyReviews?.reviews || []).map((rev: any) => ({
            reviewId: rev.reviewId,
            guestName: rev.guest?.firstName ? `${rev.guest.firstName} ${rev.guest.lastName?.[0] || ''}.` : 'Guest',
            overallRating: rev.overallRating || 0,
            accuracy: rev.accuracy || 0,
            cleanliness: rev.cleanliness || 0,
            communication: rev.communication || 0,
            location: rev.location || 0,
            value: rev.value || 0,
            comment: rev.comment || '',
            createdAt: rev.createdAt,
            propertyId: propertyIds[i],
            hostResponse: rev.hostResponse,
            verifiedStay: rev.verifiedStay || false,
            photos: rev.photos || [],
          }));
          all.push(...items);
        }
      }
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(all);
    } catch {} finally { setLoading(false); }
  };

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (selectedProperty) result = result.filter(r => r.propertyId === selectedProperty);
    if (filterTab === 'pending') result = result.filter(r => !r.hostResponse);
    else if (filterTab === 'responded') result = result.filter(r => !!r.hostResponse);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.guestName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (propertyNames[r.propertyId] || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [reviews, selectedProperty, filterTab, searchQuery, propertyNames]);

  // Category averages across all reviews
  const categoryAverages = useMemo(() => {
    if (reviews.length === 0) return null;
    const sums = { cleanliness: 0, accuracy: 0, communication: 0, location: 0, value: 0 };
    reviews.forEach(r => {
      sums.cleanliness += r.cleanliness;
      sums.accuracy += r.accuracy;
      sums.communication += r.communication;
      sums.location += r.location;
      sums.value += r.value;
    });
    const count = reviews.length;
    return {
      cleanliness: sums.cleanliness / count,
      accuracy: sums.accuracy / count,
      communication: sums.communication / count,
      location: sums.location / count,
      value: sums.value / count,
    };
  }, [reviews]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length)
    : 0;
  const pendingCount = reviews.filter(r => !r.hostResponse).length;

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      if (!USE_DEMO_DATA) {
        await GraphQLClient.executeAuthenticated(respondToReview, {
          input: { reviewId, response: responseText.trim() },
        });
      }
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

  if (loading) return <ActivityIndicator color={tint} style={{ paddingVertical: 40 }} />;

  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={[styles.emptyIcon, { backgroundColor: `${tint}12` }]}>
          <Ionicons name="star-outline" size={36} color={tint} />
        </View>
        <Text style={[styles.emptyTitle, { color: text }]}>No reviews yet</Text>
        <Text style={[styles.emptySub, { color: subtle }]}>
          When guests leave reviews, they'll show up here.{'\n'}You can respond to build trust with future guests.
        </Text>
      </View>
    );
  }

  const propertyFilterOptions = propertyIds.filter(id => reviews.some(r => r.propertyId === id));

  const RatingBar = ({ score, maxWidth = 80 }: { score: number; maxWidth?: number }) => (
    <View style={[styles.ratingBarBg, { width: maxWidth, backgroundColor: `${border}` }]}>
      <View style={[styles.ratingBarFill, { width: (score / 5) * maxWidth, backgroundColor: tint }]} />
    </View>
  );

  const renderReview = ({ item: r }: { item: Review }) => {
    const isExpanded = expandedReview === r.reviewId;

    return (
      <View style={[styles.reviewCard, { backgroundColor: card, borderColor: border }]}>
        {/* Header */}
        <View style={styles.reviewHeader}>
          <View style={[styles.avatar, { backgroundColor: `${tint}15` }]}>
            <Text style={[styles.avatarText, { color: tint }]}>{(r.guestName || 'G').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.guestName, { color: text }]}>{r.guestName || 'Guest'}</Text>
              {r.verifiedStay && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={11} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={[styles.propName, { color: subtle }]} numberOfLines={1}>
              {propertyNames[r.propertyId] || 'Property'}
            </Text>
          </View>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.ratingPillText}>{r.overallRating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Comment */}
        {r.comment ? (
          <Text style={[styles.comment, { color: text }]}>{r.comment}</Text>
        ) : null}

        {/* Category breakdown (expandable) */}
        <TouchableOpacity
          style={styles.breakdownToggle}
          onPress={() => setExpandedReview(isExpanded ? null : r.reviewId)}
        >
          <Text style={[styles.breakdownToggleText, { color: tint }]}>
            {isExpanded ? 'Hide breakdown' : 'See breakdown'}
          </Text>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={tint} />
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.breakdownGrid, { borderColor: border }]}>
            {CATEGORY_LABELS.map(({ key, label, icon }) => (
              <View key={key} style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <Ionicons name={icon as any} size={13} color={subtle} />
                  <Text style={[styles.breakdownLabelText, { color: text }]}>{label}</Text>
                </View>
                <View style={styles.breakdownRight}>
                  <RatingBar score={r[key]} />
                  <Text style={[styles.breakdownScore, { color: text }]}>{r[key].toFixed(1)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Date */}
        <Text style={[styles.date, { color: subtle }]}>
          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>

        {/* Host response or respond form */}
        {r.hostResponse ? (
          <View style={[styles.responseBox, { backgroundColor: `${tint}06`, borderColor: `${tint}20` }]}>
            <View style={styles.responseHeader}>
              <Ionicons name="chatbubble" size={11} color={tint} />
              <Text style={[styles.responseLabel, { color: tint }]}>Your response</Text>
            </View>
            <Text style={[styles.responseContent, { color: text }]}>{r.hostResponse}</Text>
          </View>
        ) : respondingTo === r.reviewId ? (
          <View style={styles.respondForm}>
            <TextInput
              style={[styles.respondInput, { color: text, borderColor: border, backgroundColor: inputBg }]}
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Write a thoughtful response..."
              placeholderTextColor={subtle}
              multiline
              maxLength={500}
              autoFocus
            />
            <View style={styles.respondActions}>
              <TouchableOpacity onPress={() => { setRespondingTo(null); setResponseText(''); }}>
                <Text style={[styles.cancelBtn, { color: subtle }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitResponseBtn, { backgroundColor: tint, opacity: responseText.trim() ? 1 : 0.4 }]}
                onPress={() => handleRespond(r.reviewId)}
                disabled={!responseText.trim() || submitting}
              >
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitResponseText}>Post</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.replyBtn, { borderColor: `${tint}35` }]}
            onPress={() => { setRespondingTo(r.reviewId); setResponseText(''); }}
          >
            <Ionicons name="chatbubble-outline" size={13} color={tint} />
            <Text style={[styles.replyBtnText, { color: tint }]}>Respond</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Overall stats hero */}
      <View style={[styles.heroCard, { backgroundColor: card, borderColor: border }]}>
        <View style={styles.heroLeft}>
          <Text style={[styles.heroRating, { color: text }]}>{avgRating.toFixed(1)}</Text>
          <View style={styles.heroStars}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons key={i} name="star" size={16} color={i <= Math.round(avgRating) ? '#f59e0b' : border} />
            ))}
          </View>
          <Text style={[styles.heroCount, { color: subtle }]}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
        </View>
        {categoryAverages && (
          <View style={styles.heroRight}>
            {CATEGORY_LABELS.map(({ key, label }) => (
              <View key={key} style={styles.heroCatRow}>
                <Text style={[styles.heroCatLabel, { color: subtle }]}>{label}</Text>
                <RatingBar score={categoryAverages[key]} maxWidth={70} />
                <Text style={[styles.heroCatScore, { color: text }]}>{categoryAverages[key].toFixed(1)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
        <Ionicons name="search" size={16} color={subtle} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          placeholder="Search reviews..."
          placeholderTextColor={subtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={subtle} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={[styles.tabRow, { borderBottomColor: border }]}>
        {(['all', 'pending', 'responded'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filterTab === tab && { borderBottomColor: tint, borderBottomWidth: 2 }]}
            onPress={() => setFilterTab(tab)}
          >
            <Text style={[styles.tabText, { color: filterTab === tab ? tint : subtle }]}>
              {tab === 'all' ? `All (${reviews.length})` : tab === 'pending' ? 'Needs reply' : 'Responded'}
            </Text>
            {tab === 'pending' && pendingCount > 0 && (
              <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Property filter chips */}
      {propertyFilterOptions.length > 1 && (
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedProperty && { backgroundColor: `${tint}12`, borderColor: tint }]}
            onPress={() => setSelectedProperty(null)}
          >
            <Text style={[styles.chipText, { color: !selectedProperty ? tint : subtle }]}>All</Text>
          </TouchableOpacity>
          {propertyFilterOptions.map(pid => (
            <TouchableOpacity
              key={pid}
              style={[styles.chip, { borderColor: selectedProperty === pid ? tint : border }, selectedProperty === pid && { backgroundColor: `${tint}12` }]}
              onPress={() => setSelectedProperty(selectedProperty === pid ? null : pid)}
            >
              <Text style={[styles.chipText, { color: selectedProperty === pid ? tint : subtle }]} numberOfLines={1}>
                {propertyNames[pid]?.slice(0, 18) || pid.slice(0, 8)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="search-outline" size={24} color={subtle} />
          <Text style={[styles.noResultsText, { color: subtle }]}>No reviews match your filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={r => r.reviewId}
          renderItem={renderReview}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },

  // Hero stats card
  heroCard: { borderRadius: 16, borderWidth: 1, padding: 22, marginBottom: 4, gap: 24 },
  heroLeft: { alignItems: 'center', justifyContent: 'center' },
  heroRating: { fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  heroStars: { flexDirection: 'row', gap: 3, marginTop: 6 },
  heroCount: { fontSize: 13, marginTop: 6 },
  heroRight: { flex: 1, justifyContent: 'center', gap: 10 },
  heroCatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCatLabel: { fontSize: 12, width: 90 },
  heroCatScore: { fontSize: 12, fontWeight: '600', width: 26, textAlign: 'right' },

  // Rating bar
  ratingBarBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  ratingBarFill: { height: 5, borderRadius: 3 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 15 },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 20, marginBottom: 4, borderBottomWidth: 1, paddingBottom: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e5e5' },
  chipText: { fontSize: 13, fontWeight: '500' },

  // Review card
  reviewCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  guestName: { fontSize: 15, fontWeight: '600' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 11, color: '#10b981', fontWeight: '600' },
  propName: { fontSize: 12, marginTop: 3 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  ratingPillText: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  comment: { fontSize: 15, lineHeight: 23, marginTop: 16 },

  // Breakdown
  breakdownToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 },
  breakdownToggleText: { fontSize: 13, fontWeight: '600' },
  breakdownGrid: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, gap: 10 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breakdownLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  breakdownLabelText: { fontSize: 13 },
  breakdownRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownScore: { fontSize: 13, fontWeight: '600', width: 26, textAlign: 'right' },

  // Date
  date: { fontSize: 12, marginTop: 14 },

  // Response
  responseBox: { marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1 },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  responseLabel: { fontSize: 12, fontWeight: '700' },
  responseContent: { fontSize: 14, lineHeight: 20 },

  // Reply
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  replyBtnText: { fontSize: 14, fontWeight: '600' },

  // Respond form
  respondForm: { marginTop: 16 },
  respondInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 80, lineHeight: 22 },
  respondActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 14, marginTop: 12 },
  cancelBtn: { fontSize: 14, fontWeight: '600' },
  submitResponseBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  submitResponseText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 },

  // No results
  noResults: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  noResultsText: { fontSize: 14 },

  // List
  listContent: { paddingTop: 8 },
});
