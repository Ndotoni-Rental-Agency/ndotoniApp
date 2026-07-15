import HostBookings from '@/components/host/HostBookings';
import HostReviews from '@/components/host/HostReviews';
import HostPayouts from '@/components/host/HostPayouts';
import HostWhatsApp from '@/components/host/HostWhatsApp';
import HostStats from '@/components/host/HostStats';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLandlordShortTermProperties } from '@/hooks/useLandlordShortTermProperties';
import { useDeleteProperty } from '@/hooks/useProperty';
import { GraphQLClient } from '@/lib/graphql-client';
import { listPropertyBookings } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Subpage = 'home' | 'bookings' | 'reviews' | 'payouts' | 'whatsapp' | 'stats';

export default function HostDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState<Subpage>('home');
  const [refreshing, setRefreshing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const { properties, loading: propsLoading, refetch } = useLandlordShortTermProperties(isAuthenticated && !authLoading);
  const { deletePropertyById } = useDeleteProperty();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (properties.length > 0 && isAuthenticated) fetchStats();
  }, [properties, isAuthenticated]);

  const fetchStats = async () => {
    let earned = 0, pending = 0, upcoming = 0;
    try {
      for (const p of properties.slice(0, 10)) {
        try {
          const res = await GraphQLClient.executeAuthenticated<any>(listPropertyBookings, { propertyId: p.propertyId, limit: 20 });
          for (const b of (res.listPropertyBookings?.bookings || [])) {
            if (b.paymentStatus === 'CAPTURED' || b.paymentStatus === 'AUTHORIZED') earned += (b.pricing?.total || 0);
            if (b.status === 'PENDING') pending++;
            if (b.status === 'CONFIRMED' && new Date(b.checkInDate) > new Date()) upcoming++;
          }
        } catch {}
      }
    } catch {}
    setTotalEarned(earned); setPendingCount(pending); setUpcomingCount(upcoming);
  };

  const handleRefresh = async () => { setRefreshing(true); await refetch(); await fetchStats(); setRefreshing(false); };
  const handleDelete = (id: string, title: string) => {
    showAlert({
      title: 'Delete Property', message: `Remove "${title}"? This cannot be undone.`, icon: 'delete',
      buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deletePropertyById(id); await refetch(); } }],
    });
  };
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();
  const firstName = user?.firstName || 'Host';

  // ─── NOT AUTHENTICATED ───
  if (authLoading) return <View style={[s.fill, { backgroundColor: bg }]}><ActivityIndicator style={{ flex: 1 }} color={tint} /></View>;
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={s.authWrap}>
          <View style={[s.authIcon, { backgroundColor: `${tint}10` }]}><Ionicons name="home-outline" size={44} color={tint} /></View>
          <Text style={[s.authTitle, { color: text }]}>Become a Host</Text>
          <Text style={[s.authSub, { color: subtle }]}>List your space and start earning{'\n'}from short-term stays</Text>
          <TouchableOpacity style={[s.authBtn, { backgroundColor: tint }]} onPress={() => setShowSignIn(true)}><Text style={s.authBtnText}>Sign In</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSignUp(true)}><Text style={[s.authLink, { color: tint }]}>Create account</Text></TouchableOpacity>
        </View>
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    );
  }

  // ─── SUBPAGES ───
  if (page !== 'home') {
    return (
      <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={s.subHeader}>
          <TouchableOpacity onPress={() => setPage('home')} style={s.subBack}><Ionicons name="arrow-back" size={22} color={text} /></TouchableOpacity>
          <Text style={[s.subTitle, { color: text }]}>
            {page === 'bookings' ? 'Bookings' : page === 'reviews' ? 'Reviews' : page === 'payouts' ? 'Payouts' : page === 'stats' ? 'Earnings' : 'WhatsApp'}
          </Text>
          <View style={{ width: 30 }} />
        </View>
        <ScrollView contentContainerStyle={s.subContent} showsVerticalScrollIndicator={false}>
          {page === 'bookings' && <HostBookings propertyIds={properties.map(p => p.propertyId)} onRefresh={handleRefresh} />}
          {page === 'reviews' && <HostReviews propertyIds={properties.map(p => p.propertyId)} propertyNames={Object.fromEntries(properties.map(p => [p.propertyId, p.title]))} />}
          {page === 'payouts' && <HostPayouts />}
          {page === 'whatsapp' && <HostWhatsApp />}
          {page === 'stats' && <HostStats propertyIds={properties.map(p => p.propertyId)} />}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── MAIN HOST DASHBOARD ───
  return (
    <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}>

        {/* Header */}
        <View style={s.headerRow}>
          <Text style={[s.headerTitle, { color: text }]}>Today</Text>
        </View>
        <Text style={[s.headerGreet, { color: subtle }]}>Welcome back, {firstName}</Text>

        {/* Notification cards — action items */}
        {pendingCount > 0 && (
          <TouchableOpacity style={[s.alertCard, { backgroundColor: '#fef3c7' }]} onPress={() => setPage('bookings')} activeOpacity={0.8}>
            <View style={[s.alertDot, { backgroundColor: '#f59e0b' }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{pendingCount} booking request{pendingCount > 1 ? 's' : ''}</Text>
              <Text style={s.alertSub}>Tap to review and approve</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#92400e" />
          </TouchableOpacity>
        )}

        {/* Stats row */}
        {(upcomingCount > 0 || totalEarned > 0 || properties.length > 0) && (
          <View style={s.statsRow}>
            <TouchableOpacity style={[s.statCard, { backgroundColor: card }]} onPress={() => setPage('stats')} activeOpacity={0.7}>
              <Text style={[s.statValue, { color: text }]}>Tshs {fmt(totalEarned)}</Text>
              <Text style={[s.statLabel, { color: subtle }]}>Total earned</Text>
            </TouchableOpacity>
            <View style={[s.statCard, { backgroundColor: card }]}>
              <Text style={[s.statValue, { color: text }]}>{upcomingCount}</Text>
              <Text style={[s.statLabel, { color: subtle }]}>Upcoming</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: card }]}>
              <Text style={[s.statValue, { color: text }]}>{properties.length}</Text>
              <Text style={[s.statLabel, { color: subtle }]}>Listings</Text>
            </View>
          </View>
        )}

        {/* Listings */}
        <View style={s.listingsSection}>
          <View style={s.listingsHeader}>
            <Text style={[s.sectionTitle, { color: text }]}>Your listings</Text>
            <TouchableOpacity onPress={() => router.push('/landlord/short-property/create' as any)} style={[s.newListingBtn, { backgroundColor: tint }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={s.newListingText}>New</Text>
            </TouchableOpacity>
          </View>

          {propsLoading ? <ActivityIndicator color={tint} style={{ paddingVertical: 40 }} /> : properties.length === 0 ? (
            <TouchableOpacity style={[s.emptyCard, { borderColor: border }]} onPress={() => router.push('/landlord/short-property/create' as any)} activeOpacity={0.8}>
              <View style={[s.emptyIconWrap, { backgroundColor: `${tint}08` }]}>
                <Ionicons name="add-circle-outline" size={36} color={tint} />
              </View>
              <Text style={[s.emptyTitle, { color: text }]}>Add your first place</Text>
              <Text style={[s.emptySub, { color: subtle }]}>It only takes a few minutes</Text>
            </TouchableOpacity>
          ) : (
            properties.map(p => {
              const live = ['AVAILABLE', 'ACTIVE', 'PUBLISHED'].includes(String(p.status || ''));
              return (
                <TouchableOpacity key={p.propertyId} style={[s.listingCard, { backgroundColor: card }]} onPress={() => router.push(`/short-property/${p.propertyId}` as any)} activeOpacity={0.8}>
                  <View style={s.listingImgWrap}>
                    {(p.thumbnail || p.images?.[0]) ? (
                      <Image source={{ uri: p.thumbnail || p.images?.[0] }} style={s.listingImg} contentFit="cover" />
                    ) : (
                      <View style={[s.listingImgEmpty, { backgroundColor: `${tint}06` }]}><Ionicons name="image-outline" size={20} color={tint} /></View>
                    )}
                    <View style={[s.liveTag, { backgroundColor: live ? '#16a34a' : '#f59e0b' }]}>
                      <Text style={s.liveTagText}>{live ? 'Live' : 'Draft'}</Text>
                    </View>
                  </View>
                  <View style={s.listingBody}>
                    <Text style={[s.listingTitle, { color: text }]} numberOfLines={1}>{p.title}</Text>
                    <Text style={[s.listingLoc, { color: subtle }]}>{p.district}, {p.region}</Text>
                    <Text style={[s.listingPrice, { color: text }]}>{p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()} <Text style={{ color: subtle, fontWeight: '400' }}>/ night</Text></Text>
                  </View>
                  <View style={s.listingActions}>
                    <TouchableOpacity style={[s.listingActBtn, { backgroundColor: `${tint}08` }]} onPress={() => router.push(`/landlord/short-property/${p.propertyId}` as any)}>
                      <Ionicons name="create-outline" size={15} color={tint} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.listingActBtn, { backgroundColor: `${tint}08` }]} onPress={() => router.push(`/landlord/calendar/${p.propertyId}?type=short-term` as any)}>
                      <Ionicons name="calendar-outline" size={15} color={tint} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.listingActBtn, { backgroundColor: '#fef2f2' }]} onPress={() => handleDelete(p.propertyId, p.title)}>
                      <Ionicons name="trash-outline" size={15} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Quick actions grid */}
        {properties.length > 0 && (
          <View style={s.quickSection}>
            <Text style={[s.sectionTitle, { color: text }]}>Quick actions</Text>
            <View style={s.quickGrid}>
              {[
                { key: 'bookings' as Subpage, icon: 'calendar', label: 'Bookings', color: tint },
                { key: 'stats' as Subpage, icon: 'trending-up', label: 'Earnings', color: '#16a34a' },
                { key: 'reviews' as Subpage, icon: 'star', label: 'Reviews', color: '#f59e0b' },
                { key: 'payouts' as Subpage, icon: 'card', label: 'Payouts', color: '#8b5cf6' },
                { key: 'whatsapp' as Subpage, icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25d366' },
              ].map(item => (
                <TouchableOpacity key={item.key} style={[s.quickItem, { backgroundColor: card }]} onPress={() => setPage(item.key)} activeOpacity={0.7}>
                  <View style={[s.quickIcon, { backgroundColor: `${item.color}12` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[s.quickLabel, { color: text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 20 },

  // Header
  headerRow: { paddingHorizontal: 20, paddingTop: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerGreet: { paddingHorizontal: 20, fontSize: 15, marginTop: 4, marginBottom: 16 },

  // Alert card
  alertCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, borderRadius: 14, gap: 12, marginBottom: 16 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#92400e' },
  alertSub: { fontSize: 12, color: '#92400e', marginTop: 1 },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },

  // Listings
  listingsSection: { paddingHorizontal: 20 },
  listingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  newListingBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16 },
  newListingText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Listing card
  listingCard: { borderRadius: 14, marginBottom: 14, overflow: 'hidden' },
  listingImgWrap: { width: '100%', height: 140, position: 'relative' },
  listingImg: { width: '100%', height: '100%' },
  listingImgEmpty: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  liveTag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  listingBody: { padding: 14 },
  listingTitle: { fontSize: 16, fontWeight: '600' },
  listingLoc: { fontSize: 13, marginTop: 3 },
  listingPrice: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  listingActions: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
  listingActBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Empty listing
  emptyCard: { borderWidth: 1.5, borderStyle: 'dashed' as any, borderRadius: 14, padding: 32, alignItems: 'center' },
  emptyIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, marginTop: 4 },

  // Quick actions
  quickSection: { paddingHorizontal: 20, marginTop: 28 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  quickItem: { width: '31%', alignItems: 'center', paddingVertical: 18, borderRadius: 14 },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '600' },

  // Sub-pages
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  subBack: { width: 30 },
  subTitle: { fontSize: 17, fontWeight: '600' },
  subContent: { padding: 20, paddingBottom: 40 },

  // Auth
  authWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  authIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  authTitle: { fontSize: 24, fontWeight: '800' },
  authSub: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  authBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 12, marginTop: 28 },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  authLink: { fontSize: 15, fontWeight: '600', marginTop: 16 },
});
