import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { PaymentModal, TripCard } from '@/components/trips';
import { Booking, TripColors, TripTab } from '@/components/trips/types';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyBookings } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
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

const TABS: { key: TripTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function TripsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TripTab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const colors: TripColors = { text, tint, card, border, subtle, bg };

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (activeTab === 'upcoming') {
        // Fetch both CONFIRMED and PENDING — show all future bookings together
        const [confirmedRes, pendingRes] = await Promise.all([
          GraphQLClient.executeAuthenticated<any>(listMyBookings, { status: 'CONFIRMED', limit: 50 }),
          GraphQLClient.executeAuthenticated<any>(listMyBookings, { status: 'PENDING', limit: 50 }),
        ]);
        const confirmed = Array.isArray(confirmedRes?.listMyBookings?.bookings) ? confirmedRes.listMyBookings.bookings : [];
        const pending = Array.isArray(pendingRes?.listMyBookings?.bookings) ? pendingRes.listMyBookings.bookings : [];
        // Combine and sort: awaiting payment first, then by check-in date
        const all = [...confirmed, ...pending].sort((a: any, b: any) => {
          const aNeeds = a.paymentStatus !== 'CAPTURED' && a.paymentStatus !== 'AUTHORIZED';
          const bNeeds = b.paymentStatus !== 'CAPTURED' && b.paymentStatus !== 'AUTHORIZED';
          if (aNeeds && !bNeeds) return -1;
          if (!aNeeds && bNeeds) return 1;
          return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
        });
        setBookings(all);
      } else {
        const status = activeTab === 'past' ? 'COMPLETED' : 'CANCELLED';
        const res = await GraphQLClient.executeAuthenticated<any>(listMyBookings, { status, limit: 50 });
        setBookings(Array.isArray(res?.listMyBookings?.bookings) ? res.listMyBookings.bookings : []);
      }
    } catch {
      setBookings([]);
    } finally { setLoading(false); }
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchBookings(); setRefreshing(false); };

  // ─── Not authenticated ───
  if (authLoading) return <View style={[s.fill, { backgroundColor: bg }]}><ActivityIndicator style={{ flex: 1 }} color={tint} /></View>;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={s.centerWrap}>
          <Ionicons name="airplane-outline" size={44} color={subtle} />
          <Text style={[s.emptyTitle, { color: text }]}>My Trips</Text>
          <Text style={[s.emptySub, { color: subtle }]}>Sign in to see your upcoming and past stays</Text>
          <TouchableOpacity style={[s.btn, { backgroundColor: tint }]} onPress={() => setShowSignIn(true)}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    );
  }

  // ─── Trips list ───
  return (
    <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: text }]}>My Trips</Text>
      </View>

      {/* Tabs */}
      <View style={[s.tabBar, { borderBottomColor: border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, activeTab === t.key && { borderBottomColor: tint, borderBottomWidth: 2 }]} onPress={() => setActiveTab(t.key)}>
            <Text style={[s.tabLabel, { color: activeTab === t.key ? tint : subtle }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.centerWrap}><ActivityIndicator size="large" color={tint} /></View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.bookingId}
          renderItem={({ item }) => {
            const needsPayment = item.status === 'CONFIRMED' && item.paymentStatus !== 'CAPTURED' && item.paymentStatus !== 'AUTHORIZED';
            return (
              <TripCard
                booking={item}
                colors={colors}
                showPayButton={needsPayment}
                onPress={() => {
                  if (needsPayment) {
                    setPayingBooking(item);
                  } else {
                    router.push(`/short-property/${item.property?.propertyId}` as any);
                  }
                }}
                onPayPress={() => setPayingBooking(item)}
              />
            );
          }}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}
          ListEmptyComponent={
            <View style={s.centerWrap}>
              <Ionicons name={activeTab === 'upcoming' ? 'airplane-outline' : activeTab === 'past' ? 'checkmark-circle-outline' : 'close-circle-outline'} size={40} color={subtle} />
              <Text style={[s.emptyTitle, { color: text }]}>
                {activeTab === 'upcoming' ? 'No upcoming trips' : activeTab === 'past' ? 'No past trips' : 'No cancellations'}
              </Text>
              <Text style={[s.emptySub, { color: subtle }]}>
                {activeTab === 'upcoming' ? 'When you book a stay, it will show up here' : 'Your travel history will appear here'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity style={[s.btn, { backgroundColor: tint }]} onPress={() => router.push('/(tabs)/' as any)}>
                  <Text style={s.btnText}>Explore stays</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Payment modal */}
      <PaymentModal
        visible={!!payingBooking}
        booking={payingBooking}
        onClose={() => { setPayingBooking(null); fetchBookings(); }}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 20 },
  tab: { marginRight: 24, paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  list: { padding: 16 },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  btn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
