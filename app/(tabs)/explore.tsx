import HostBookings from '@/components/host/HostBookings';
import HostReviews from '@/components/host/HostReviews';
import HostPayouts from '@/components/host/HostPayouts';
import HostWhatsApp from '@/components/host/HostWhatsApp';
import HostStats from '@/components/host/HostStats';
import { ListingCard, QuickActions, StatsRow } from '@/components/host/dashboard';
import { DashboardColors, Subpage } from '@/components/host/dashboard/types';
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
  const colors: DashboardColors = { bg, text, tint, card, border, subtle };

  const { properties, loading: propsLoading, refetch } = useLandlordShortTermProperties(isAuthenticated && !authLoading);
  const { deletePropertyById } = useDeleteProperty();
  const { showAlert } = useAlert();
  const firstName = user?.firstName || 'Host';

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

  // ─── Auth gate ───
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

  // ─── Subpages ───
  if (page !== 'home') {
    return (
      <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={s.subHeader}>
          <TouchableOpacity onPress={() => setPage('home')}><Ionicons name="arrow-back" size={22} color={text} /></TouchableOpacity>
          <Text style={[s.subTitle, { color: text }]}>
            {page === 'bookings' ? 'Bookings' : page === 'reviews' ? 'Reviews' : page === 'payouts' ? 'Payouts' : page === 'stats' ? 'Earnings' : 'WhatsApp'}
          </Text>
          <View style={{ width: 22 }} />
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

  // ─── Main dashboard ───
  return (
    <SafeAreaView style={[s.fill, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}>

        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headerTitle, { color: text }]}>Today</Text>
        </View>
        <Text style={[s.headerGreet, { color: subtle }]}>Welcome back, {firstName}</Text>

        {/* Alert for pending requests */}
        {pendingCount > 0 && (
          <TouchableOpacity style={s.alertCard} onPress={() => setPage('bookings')} activeOpacity={0.8}>
            <View style={s.alertDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{pendingCount} booking request{pendingCount > 1 ? 's' : ''}</Text>
              <Text style={s.alertSub}>Tap to review and approve</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#92400e" />
          </TouchableOpacity>
        )}

        {/* Stats */}
        <StatsRow colors={colors} totalEarned={totalEarned} upcomingCount={upcomingCount} listingsCount={properties.length} onStatPress={setPage} />

        {/* Listings */}
        <View style={s.listingsSection}>
          <View style={s.listingsHeader}>
            <Text style={[s.sectionTitle, { color: text }]}>Your listings</Text>
            <TouchableOpacity onPress={() => router.push('/landlord/short-property/create' as any)} style={[s.newBtn, { backgroundColor: tint }]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={s.newBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {propsLoading ? <ActivityIndicator color={tint} style={{ paddingVertical: 40 }} /> : properties.length === 0 ? (
            <TouchableOpacity style={[s.emptyCard, { borderColor: border }]} onPress={() => router.push('/landlord/short-property/create' as any)} activeOpacity={0.8}>
              <View style={[s.emptyIcon, { backgroundColor: `${tint}08` }]}><Ionicons name="add-circle-outline" size={36} color={tint} /></View>
              <Text style={[s.emptyTitle, { color: text }]}>Add your first place</Text>
              <Text style={[s.emptySub, { color: subtle }]}>It only takes a few minutes</Text>
            </TouchableOpacity>
          ) : (
            <>
              {properties.slice(0, 2).map(p => (
                <ListingCard
                  key={p.propertyId}
                  property={p as any}
                  colors={colors}
                  onPress={() => router.push(`/short-property/${p.propertyId}` as any)}
                  onEdit={() => router.push(`/landlord/short-property/${p.propertyId}` as any)}
                  onCalendar={() => router.push(`/landlord/calendar/${p.propertyId}?type=short-term` as any)}
                  onDelete={() => handleDelete(p.propertyId, p.title)}
                />
              ))}
              {properties.length > 2 && (
                <TouchableOpacity style={[s.seeMoreBtn, { borderColor: border }]} onPress={() => router.push('/landlord/properties' as any)} activeOpacity={0.7}>
                  <Text style={[s.seeMoreText, { color: tint }]}>See all {properties.length} listings</Text>
                  <Ionicons name="arrow-forward" size={16} color={tint} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Quick actions */}
        {properties.length > 0 && <QuickActions colors={colors} onAction={setPage} />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 20 },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerGreet: { paddingHorizontal: 20, fontSize: 15, marginTop: 4, marginBottom: 16 },

  // Alert
  alertCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, borderRadius: 14, backgroundColor: '#fef3c7', gap: 12, marginBottom: 16 },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#92400e' },
  alertSub: { fontSize: 12, color: '#92400e', marginTop: 1 },

  // Listings section
  listingsSection: { paddingHorizontal: 20 },
  listingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16 },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Empty
  emptyCard: { borderWidth: 1.5, borderStyle: 'dashed' as any, borderRadius: 14, padding: 32, alignItems: 'center' },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, marginTop: 4 },
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  seeMoreText: { fontSize: 14, fontWeight: '600' },

  // Subpages
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
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
