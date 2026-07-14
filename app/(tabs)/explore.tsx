import HostBookings from '@/components/host/HostBookings';
import HostReviews from '@/components/host/HostReviews';
import HostPayouts from '@/components/host/HostPayouts';
import HostWhatsApp from '@/components/host/HostWhatsApp';
import HostStats from '@/components/host/HostStats';
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
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
  Alert,
  Linking,
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
  const card = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const { properties, loading: propsLoading, refetch } = useLandlordShortTermProperties(isAuthenticated && !authLoading);
  const { deletePropertyById } = useDeleteProperty();

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
            if (b.paymentStatus === 'CAPTURED' || b.paymentStatus === 'AUTHORIZED') earned += (b.pricing?.total || b.totalPrice || 0);
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
    Alert.alert('Delete', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePropertyById(id); await refetch(); } },
    ]);
  };
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : n.toString();
  const firstName = user?.firstName || 'Host';

  // ─── NOT AUTHENTICATED ───
  if (authLoading) return <View style={[styles.fill, { backgroundColor: bg }]}><ActivityIndicator style={{ flex: 1 }} color={tint} /></View>;
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={styles.authWrap}>
          <View style={[styles.authIcon, { backgroundColor: `${tint}12` }]}><Ionicons name="home-outline" size={40} color={tint} /></View>
          <Text style={[styles.authTitle, { color: text }]}>Become a Host</Text>
          <Text style={[styles.authSub, { color: subtle }]}>List your space and start earning from short-term stays</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: tint }]} onPress={() => setShowSignIn(true)}><Text style={styles.primaryBtnText}>Sign In</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSignUp(true)}><Text style={[styles.linkText, { color: tint }]}>Create account</Text></TouchableOpacity>
        </View>
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    );
  }

  // ─── SUBPAGES ───
  if (page !== 'home') {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={[styles.subHeader, { borderBottomColor: border }]}>
          <TouchableOpacity onPress={() => setPage('home')}><Ionicons name="arrow-back" size={22} color={text} /></TouchableOpacity>
          <Text style={[styles.subTitle, { color: text }]}>
            {page === 'bookings' ? 'Bookings' : page === 'reviews' ? 'Reviews' : page === 'payouts' ? 'Payouts' : page === 'stats' ? 'Earnings & Stats' : 'WhatsApp'}
          </Text>
          <View style={{ width: 22 }} />
        </View>
        <ScrollView contentContainerStyle={styles.subContent} showsVerticalScrollIndicator={false}>
          {page === 'bookings' && <HostBookings propertyIds={properties.map(p => p.propertyId)} onRefresh={handleRefresh} />}
          {page === 'reviews' && <HostReviews propertyIds={properties.map(p => p.propertyId)} propertyNames={Object.fromEntries(properties.map(p => [p.propertyId, p.title]))} />}
          {page === 'payouts' && <HostPayouts />}
          {page === 'whatsapp' && <HostWhatsApp />}
          {page === 'stats' && <HostStats propertyIds={properties.map(p => p.propertyId)} />}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── MAIN HOST PAGE (Airbnb "Today" style) ───
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}>

        {/* Greeting */}
        <View style={styles.greetSection}>
          <Text style={[styles.greeting, { color: text }]}>Welcome, {firstName} 👋</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: tint }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Summary cards */}
        {(pendingCount > 0 || upcomingCount > 0 || totalEarned > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
            {pendingCount > 0 && (
              <TouchableOpacity style={[styles.summaryCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]} onPress={() => setPage('bookings')}>
                <Text style={styles.summaryNum}>{pendingCount}</Text>
                <Text style={styles.summaryLabel}>Pending{'\n'}requests</Text>
                <Ionicons name="chevron-forward" size={16} color="#92400e" />
              </TouchableOpacity>
            )}
            <View style={[styles.summaryCard, { backgroundColor: `${tint}08`, borderColor: `${tint}20` }]}>
              <Text style={[styles.summaryNum, { color: tint }]}>{upcomingCount}</Text>
              <Text style={[styles.summaryLabel, { color: tint }]}>Upcoming{'\n'}guests</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.summaryNum, { color: text }]}>Tshs {fmt(totalEarned)}</Text>
              <Text style={[styles.summaryLabel, { color: subtle }]}>Total{'\n'}earned</Text>
            </View>
          </ScrollView>
        )}

        {/* Your listings */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: text }]}>Your listings</Text>
            <Text style={[styles.sectionCount, { color: subtle }]}>{properties.length}</Text>
          </View>

          {propsLoading ? <ActivityIndicator color={tint} style={{ paddingVertical: 30 }} /> : properties.length === 0 ? (
            <TouchableOpacity style={[styles.emptyCard, { borderColor: border }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
              <Ionicons name="add-circle-outline" size={32} color={tint} />
              <Text style={[styles.emptyText, { color: text }]}>Add your first property</Text>
            </TouchableOpacity>
          ) : (
            <>
              {properties.slice(0, 2).map(p => {
                const st = String(p.status || 'DRAFT');
                const live = st === 'AVAILABLE' || st === 'ACTIVE' || st === 'PUBLISHED';
                return (
                  <View key={p.propertyId} style={[styles.propCard, { backgroundColor: card, borderColor: border }]}>
                    <TouchableOpacity style={styles.propRow} onPress={() => router.push(`/short-property/${p.propertyId}` as any)}>
                      <View style={styles.propImgWrap}>
                        {(p.thumbnail || p.images?.[0]) ? (
                          <Image source={{ uri: p.thumbnail || p.images?.[0] }} style={styles.propImg} contentFit="cover" />
                        ) : (
                          <View style={[styles.propImgPlaceholder, { backgroundColor: `${tint}08` }]}><Ionicons name="image-outline" size={18} color={tint} /></View>
                        )}
                      </View>
                      <View style={styles.propInfo}>
                        <Text style={[styles.propTitle, { color: text }]} numberOfLines={1}>{p.title}</Text>
                        <Text style={[styles.propLoc, { color: subtle }]}>{p.district}, {p.region}</Text>
                        <View style={styles.propBottom}>
                          <Text style={[styles.propPrice, { color: text }]}>{p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()}/n</Text>
                          <View style={[styles.statusPill, { backgroundColor: live ? `${tint}12` : '#fef3c7' }]}>
                            <Text style={[styles.statusPillText, { color: live ? tint : '#92400e' }]}>{live ? 'Live' : 'Draft'}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={[styles.propActions, { borderTopColor: border }]}>
                      <TouchableOpacity style={styles.actBtn} onPress={() => router.push(`/landlord/short-property/${p.propertyId}` as any)}>
                        <Ionicons name="create-outline" size={15} color={text} /><Text style={[styles.actText, { color: text }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actBtn} onPress={() => router.push(`/landlord/calendar/${p.propertyId}?type=short-term` as any)}>
                        <Ionicons name="calendar-outline" size={15} color={text} /><Text style={[styles.actText, { color: text }]}>Calendar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actBtn} onPress={() => handleDelete(p.propertyId, p.title)}>
                        <Ionicons name="trash-outline" size={15} color="#ef4444" /><Text style={[styles.actText, { color: '#ef4444' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              {properties.length > 2 && (
                <TouchableOpacity style={[styles.viewMoreBtn, { borderColor: border }]} onPress={() => router.push('/landlord/properties' as any)}>
                  <Text style={[styles.viewMoreText, { color: tint }]}>View all {properties.length} listings</Text>
                  <Ionicons name="arrow-forward" size={16} color={tint} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Menu items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>Manage</Text>
          {[
            { key: 'stats' as Subpage, icon: 'bar-chart-outline', label: 'Earnings & Stats', desc: 'Revenue charts & analytics' },
            { key: 'bookings' as Subpage, icon: 'calendar-outline', label: 'Bookings', desc: 'Approve requests & manage stays', badge: pendingCount },
            { key: 'reviews' as Subpage, icon: 'star-outline', label: 'Reviews', desc: 'See what guests say' },
            { key: 'payouts' as Subpage, icon: 'card-outline', label: 'Payouts', desc: 'M-Pesa & bank setup' },
            { key: 'whatsapp' as Subpage, icon: 'logo-whatsapp', label: 'WhatsApp', desc: 'Notification number' },
          ].map(item => (
            <TouchableOpacity key={item.key} style={[styles.menuItem, { borderColor: border }]} onPress={() => setPage(item.key)}>
              <Ionicons name={item.icon as any} size={22} color={item.key === 'whatsapp' ? '#25d366' : tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: text }]}>{item.label}</Text>
                <Text style={[styles.menuDesc, { color: subtle }]}>{item.desc}</Text>
              </View>
              {item.badge ? (
                <View style={[styles.badge, { backgroundColor: '#ef4444' }]}><Text style={styles.badgeText}>{item.badge}</Text></View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={border} />
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  // Greeting
  greetSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 24, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Summary cards
  summaryScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  summaryCard: { width: 130, padding: 14, borderRadius: 14, borderWidth: 1, justifyContent: 'space-between', gap: 6 },
  summaryNum: { fontSize: 20, fontWeight: '800', color: '#92400e' },
  summaryLabel: { fontSize: 12, fontWeight: '500', color: '#92400e', lineHeight: 16 },

  // Sections
  mainContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionCount: { fontSize: 14, fontWeight: '600' },

  // Property cards
  propCard: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  propRow: { flexDirection: 'row', padding: 12, gap: 12 },
  propImgWrap: { width: 60, height: 60, borderRadius: 10, overflow: 'hidden' },
  propImg: { width: '100%', height: '100%' },
  propImgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  propInfo: { flex: 1, justifyContent: 'center' },
  propTitle: { fontSize: 14, fontWeight: '600' },
  propLoc: { fontSize: 12, marginTop: 2 },
  propBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  propPrice: { fontSize: 13, fontWeight: '600' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  propActions: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 12 },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 4 },
  actText: { fontSize: 12, fontWeight: '600' },

  // Empty
  emptyCard: { borderWidth: 1.5, borderStyle: 'dashed' as any, borderRadius: 14, paddingVertical: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '600' },
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  viewMoreText: { fontSize: 14, fontWeight: '600' },

  // Menu
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuDesc: { fontSize: 12, marginTop: 1 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Sub-pages
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  subTitle: { fontSize: 17, fontWeight: '600' },
  subContent: { padding: 20, paddingBottom: 40 },

  // Auth
  authWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  authIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  authTitle: { fontSize: 22, fontWeight: '700' },
  authSub: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  primaryBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { fontSize: 15, fontWeight: '600', marginTop: 14 },
});
