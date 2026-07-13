import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyBookings } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TripTab = 'going' | 'awaiting_payment' | 'past' | 'cancelled';

interface Booking {
  bookingId: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests: number;
  property: {
    propertyId: string;
    title: string;
    thumbnail?: string;
    images?: string[];
    currency?: string;
    district?: string;
    region?: string;
  };
}

export default function TripsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TripTab>('going');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // "going" = confirmed AND paid, "awaiting_payment" = confirmed but not paid
      // Both are CONFIRMED status from backend — we separate by paymentStatus
      const statusMap: Record<TripTab, string> = {
        going: 'CONFIRMED',
        awaiting_payment: 'CONFIRMED',
        past: 'COMPLETED',
        cancelled: 'CANCELLED',
      };
      const res = await GraphQLClient.executeAuthenticated<any>(listMyBookings, { status: statusMap[activeTab], limit: 50 });
      let list = res?.listMyBookings?.bookings;
      list = Array.isArray(list) ? list : [];

      // Separate paid vs unpaid for confirmed bookings
      if (activeTab === 'going') {
        list = list.filter((b: any) => b.paymentStatus === 'CAPTURED' || b.paymentStatus === 'AUTHORIZED');
      } else if (activeTab === 'awaiting_payment') {
        list = list.filter((b: any) => b.paymentStatus !== 'CAPTURED' && b.paymentStatus !== 'AUTHORIZED');
      }

      setBookings(list);
    } catch (err) {
      console.error('[Trips] Error:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchBookings(); setRefreshing(false); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const getNights = (ci: string, co: string) => Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / 86400000);

  const getStatusColor = (s: string) => {
    if (s === 'CONFIRMED') return tint;
    if (s === 'PENDING') return '#f59e0b';
    if (s === 'CANCELLED') return '#ef4444';
    return subtle;
  };

  // ─── NOT AUTH ───
  if (authLoading) return <View style={[styles.fill, { backgroundColor: bg }]}><ActivityIndicator style={{ flex: 1 }} color={tint} /></View>;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={styles.centerWrap}>
          <Ionicons name="airplane-outline" size={44} color={subtle} />
          <Text style={[styles.emptyTitle, { color: text }]}>My Trips</Text>
          <Text style={[styles.emptySub, { color: subtle }]}>Sign in to see your upcoming and past stays</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]} onPress={() => setShowSignIn(true)}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    );
  }

  // ─── TRIPS ───
  const renderTrip = ({ item: b }: { item: Booking }) => {
    const img = b.property?.thumbnail || b.property?.images?.[0];
    const nights = getNights(b.checkInDate, b.checkOutDate);
    const cur = (b.property?.currency || 'TZS') === 'TZS' ? 'Tshs' : b.property?.currency;

    return (
      <TouchableOpacity style={[styles.tripCard, { backgroundColor: card, borderColor: border }]} activeOpacity={0.9} onPress={() => router.push(`/bookings/${b.bookingId}` as any)}>
        {img && <Image source={{ uri: img }} style={styles.tripImg} contentFit="cover" transition={200} />}
        <View style={styles.tripBody}>
          <View style={styles.tripRow}>
            <Text style={[styles.tripTitle, { color: text }]} numberOfLines={1}>{b.property?.title || 'Property'}</Text>
            <View style={[styles.statusPill, { backgroundColor: `${getStatusColor(b.status)}15` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(b.status) }]}>{b.status}</Text>
            </View>
          </View>
          {b.property?.district && (
            <Text style={[styles.tripLoc, { color: subtle }]}>{b.property.district}, {b.property.region}</Text>
          )}
          <View style={styles.tripDetails}>
            <Text style={[styles.tripDate, { color: text }]}>
              {formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}
            </Text>
            <Text style={[styles.tripMeta, { color: subtle }]}>
              {nights} night{nights !== 1 ? 's' : ''} · {b.numberOfGuests || 1} guest{(b.numberOfGuests || 1) !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.tripPrice, { color: text }]}>
            {cur} {(b.totalPrice || 0).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const TABS: { key: TripTab; label: string }[] = [
    { key: 'going', label: 'Going' },
    { key: 'awaiting_payment', label: 'Awaiting Pay' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: text }]}>My Trips</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && { borderBottomColor: tint, borderBottomWidth: 2 }]} onPress={() => setActiveTab(t.key)}>
            <Text style={[styles.tabLabel, { color: activeTab === t.key ? tint : subtle }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerWrap}><ActivityIndicator size="large" color={tint} /></View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.bookingId}
          renderItem={renderTrip}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <Ionicons name={activeTab === 'going' ? 'airplane-outline' : activeTab === 'awaiting_payment' ? 'card-outline' : activeTab === 'past' ? 'checkmark-circle-outline' : 'close-circle-outline'} size={40} color={subtle} />
              <Text style={[styles.emptyTitle, { color: text }]}>
                {activeTab === 'going' ? 'No confirmed trips' : activeTab === 'awaiting_payment' ? 'No pending payments' : activeTab === 'past' ? 'No past trips' : 'No cancellations'}
              </Text>
              <Text style={[styles.emptySub, { color: subtle }]}>
                {activeTab === 'going' ? 'Trips you\'ve paid for will appear here' : activeTab === 'awaiting_payment' ? 'Confirmed bookings awaiting your payment' : 'Your travel history will appear here'}
              </Text>
              {activeTab === 'going' && (
                <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]} onPress={() => router.push('/(tabs)/' as any)}>
                  <Text style={styles.btnText}>Explore stays</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800' },

  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 20 },
  tab: { marginRight: 24, paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '600' },

  // List
  list: { padding: 16 },
  tripCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  tripImg: { width: '100%', height: 160 },
  tripBody: { padding: 14 },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tripLoc: { fontSize: 13, marginTop: 3 },
  tripDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  tripDate: { fontSize: 14, fontWeight: '500' },
  tripMeta: { fontSize: 13 },
  tripPrice: { fontSize: 16, fontWeight: '700', marginTop: 8 },

  // States
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  btn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
