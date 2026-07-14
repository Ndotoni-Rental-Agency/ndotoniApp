import HostBookings from '@/components/host/HostBookings';
import HostReviews from '@/components/host/HostReviews';
import HostPayouts from '@/components/host/HostPayouts';
import HostWhatsApp from '@/components/host/HostWhatsApp';
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
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HostSection = 'dashboard' | 'properties' | 'bookings' | 'reviews' | 'payouts' | 'whatsapp';

export default function HostDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [section, setSection] = useState<HostSection>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, upcoming: 0 });
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const { properties, loading: propsLoading, refetch } = useLandlordShortTermProperties(isAuthenticated && !authLoading);
  const { deletePropertyById } = useDeleteProperty();

  // Fetch bookings & earnings when properties load
  useEffect(() => {
    if (properties.length > 0 && isAuthenticated) {
      fetchHostData();
    }
  }, [properties, isAuthenticated]);

  const fetchHostData = async () => {
    setLoadingBookings(true);
    let totalEarnings = 0;
    let pendingEarnings = 0;
    let upcomingCount = 0;
    const allPending: any[] = [];

    try {
      for (const p of properties.slice(0, 10)) {
        try {
          const res = await GraphQLClient.executeAuthenticated<any>(listPropertyBookings, {
            propertyId: p.propertyId, limit: 20,
          });
          const bookings = res.listPropertyBookings?.bookings || [];
          for (const b of bookings) {
            const amount = b.pricing?.total || b.totalPrice || 0;
            if (b.paymentStatus === 'CAPTURED' || b.paymentStatus === 'AUTHORIZED') {
              totalEarnings += amount;
            }
            if (b.status === 'CONFIRMED' && new Date(b.checkInDate) > new Date()) {
              upcomingCount++;
              pendingEarnings += amount;
            }
            if (b.status === 'PENDING') {
              allPending.push({ ...b, propertyTitle: p.title });
            }
          }
        } catch {}
      }
    } catch {}

    setEarnings({ total: totalEarnings, pending: pendingEarnings, upcoming: upcomingCount });
    setPendingBookings(allPending);
    setLoadingBookings(false);
  };

  const handleRefresh = async () => { setRefreshing(true); await refetch(); await fetchHostData(); setRefreshing(false); };
  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePropertyById(id); await refetch(); } },
    ]);
  };

  // ─── NOT AUTHENTICATED ───
  if (authLoading) return <View style={[styles.fill, { backgroundColor: bg }]}><ActivityIndicator style={{ flex: 1 }} color={tint} /></View>;
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={styles.authWrap}>
          <View style={[styles.authIcon, { backgroundColor: `${tint}12` }]}><Ionicons name="home-outline" size={40} color={tint} /></View>
          <Text style={[styles.authTitle, { color: text }]}>Become a Host</Text>
          <Text style={[styles.authSub, { color: subtle }]}>List your space and start earning from short-term stays</Text>
          <TouchableOpacity style={[styles.authBtn, { backgroundColor: tint }]} onPress={() => setShowSignIn(true)}><Text style={styles.authBtnText}>Sign In</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSignUp(true)}><Text style={[styles.authLink, { color: tint }]}>Create account</Text></TouchableOpacity>
        </View>
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    );
  }

  // ─── HOST DASHBOARD ───
  const NAV: { key: HostSection; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Overview', icon: 'grid-outline' },
    { key: 'properties', label: 'Listings', icon: 'home-outline' },
    { key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
    { key: 'reviews', label: 'Reviews', icon: 'star-outline' },
    { key: 'payouts', label: 'Payouts', icon: 'card-outline' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  ];

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text style={[styles.headerTitle, { color: text }]}>Host</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: tint }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>List</Text>
        </TouchableOpacity>
      </View>

      {/* Section nav */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navBar}>
        {NAV.map(n => (
          <TouchableOpacity key={n.key} style={[styles.navItem, section === n.key && { borderBottomColor: tint, borderBottomWidth: 2 }]} onPress={() => setSection(n.key)}>
            <Ionicons name={n.icon as any} size={16} color={section === n.key ? tint : subtle} />
            <Text style={[styles.navLabel, { color: section === n.key ? tint : subtle }]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ═══ DASHBOARD ═══ */}
      {section === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.dashContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}>
          {/* Stats cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="cash-outline" size={20} color={tint} />
              <Text style={[styles.statNum, { color: text }]}>Tshs {fmt(earnings.total)}</Text>
              <Text style={[styles.statLabel, { color: subtle }]}>Total earned</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="airplane-outline" size={20} color="#f59e0b" />
              <Text style={[styles.statNum, { color: text }]}>{earnings.upcoming}</Text>
              <Text style={[styles.statLabel, { color: subtle }]}>Upcoming</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
              <Ionicons name="home-outline" size={20} color="#8b5cf6" />
              <Text style={[styles.statNum, { color: text }]}>{properties.length}</Text>
              <Text style={[styles.statLabel, { color: subtle }]}>Listings</Text>
            </View>
          </View>

          {/* Pending bookings */}
          {pendingBookings.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: text }]}>⏳ Pending requests</Text>
              {pendingBookings.slice(0, 3).map(b => (
                <View key={b.bookingId} style={[styles.bookingRow, { borderColor: border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookingTitle, { color: text }]}>{b.propertyTitle}</Text>
                    <Text style={[styles.bookingDates, { color: subtle }]}>
                      {new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(b.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.pendingBadge, { backgroundColor: '#fef3c7' }]}>
                    <Text style={{ color: '#92400e', fontSize: 11, fontWeight: '600' }}>PENDING</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick actions */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: text }]}>Quick actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: card, borderColor: border }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
                <Ionicons name="add-circle-outline" size={24} color={tint} />
                <Text style={[styles.actionLabel, { color: text }]}>Add Property</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: card, borderColor: border }]} onPress={() => setSection('bookings')}>
                <Ionicons name="calendar-outline" size={24} color="#f59e0b" />
                <Text style={[styles.actionLabel, { color: text }]}>Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: card, borderColor: border }]} onPress={() => {
                const wa = user?.whatsappNumber || user?.phoneNumber;
                if (wa) Linking.openURL(`https://wa.me/${wa}`);
                else Alert.alert('WhatsApp', 'Add your WhatsApp number in Profile settings');
              }}>
                <Ionicons name="logo-whatsapp" size={24} color="#25d366" />
                <Text style={[styles.actionLabel, { color: text }]}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: card, borderColor: border }]} onPress={() => setSection('properties')}>
                <Ionicons name="settings-outline" size={24} color="#8b5cf6" />
                <Text style={[styles.actionLabel, { color: text }]}>Manage</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Properties inline below dashboard */}
          {properties.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: text }]}>Your listings</Text>
              {properties.map(p => {
                const st = String(p.status || 'DRAFT');
                const statusColor = (st === 'AVAILABLE' || st === 'ACTIVE' || st === 'PUBLISHED') ? tint : st === 'DRAFT' ? '#f59e0b' : subtle;
                return (
                  <View key={p.propertyId} style={[styles.propCard, { backgroundColor: card, borderColor: border }]}>
                    <TouchableOpacity style={styles.propRow} onPress={() => router.push(`/short-property/${p.propertyId}` as any)}>
                      <View style={styles.propImgWrap}>
                        {(p.thumbnail || p.images?.[0]) ? (
                          <Image source={{ uri: p.thumbnail || p.images?.[0] }} style={styles.propImg} contentFit="cover" />
                        ) : (
                          <View style={[styles.propImgPlaceholder, { backgroundColor: `${tint}10` }]}><Ionicons name="image-outline" size={20} color={tint} /></View>
                        )}
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      </View>
                      <View style={styles.propInfo}>
                        <Text style={[styles.propTitle, { color: text }]} numberOfLines={1}>{p.title}</Text>
                        <Text style={[styles.propLoc, { color: subtle }]}>{p.district}, {p.region}</Text>
                        <Text style={[styles.propPrice, { color: text }]}>{p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()} <Text style={{ color: subtle, fontWeight: '400' }}>/night</Text></Text>
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
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══ PROPERTIES ═══ */}
      {section === 'properties' && (
        <FlatList
          data={properties}
          keyExtractor={(p) => p.propertyId}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}
          renderItem={({ item: p }) => {
            const st = String(p.status || 'DRAFT');
            const statusColor = (st === 'AVAILABLE' || st === 'ACTIVE' || st === 'PUBLISHED') ? tint : st === 'DRAFT' ? '#f59e0b' : subtle;
            return (
              <View style={[styles.propCard, { backgroundColor: card, borderColor: border }]}>
                <TouchableOpacity style={styles.propRow} onPress={() => router.push(`/short-property/${p.propertyId}` as any)}>
                  <View style={styles.propImgWrap}>
                    {(p.thumbnail || p.images?.[0]) ? (
                      <Image source={{ uri: p.thumbnail || p.images?.[0] }} style={styles.propImg} contentFit="cover" />
                    ) : (
                      <View style={[styles.propImgPlaceholder, { backgroundColor: `${tint}10` }]}><Ionicons name="image-outline" size={20} color={tint} /></View>
                    )}
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  </View>
                  <View style={styles.propInfo}>
                    <Text style={[styles.propTitle, { color: text }]} numberOfLines={1}>{p.title}</Text>
                    <Text style={[styles.propLoc, { color: subtle }]}>{p.district}, {p.region}</Text>
                    <Text style={[styles.propPrice, { color: text }]}>{p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()} <Text style={{ color: subtle, fontWeight: '400' }}>/night</Text></Text>
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
          }}
          ListEmptyComponent={
            propsLoading ? <View style={styles.centerWrap}><ActivityIndicator size="large" color={tint} /></View> : (
              <View style={styles.centerWrap}>
                <Ionicons name="home-outline" size={36} color={subtle} />
                <Text style={[styles.emptyTitle, { color: text }]}>No listings yet</Text>
                <TouchableOpacity style={[styles.authBtn, { backgroundColor: tint, marginTop: 16 }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
                  <Text style={styles.authBtnText}>Add Property</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}

      {/* ═══ BOOKINGS ═══ */}
      {section === 'bookings' && (
        <ScrollView contentContainerStyle={styles.dashContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}>
          <HostBookings propertyIds={properties.map(p => p.propertyId)} onRefresh={handleRefresh} />
        </ScrollView>
      )}

      {/* ═══ REVIEWS ═══ */}
      {section === 'reviews' && (
        <ScrollView contentContainerStyle={styles.dashContent} showsVerticalScrollIndicator={false}>
          <HostReviews propertyIds={properties.map(p => p.propertyId)} propertyNames={Object.fromEntries(properties.map(p => [p.propertyId, p.title]))} />
        </ScrollView>
      )}

      {/* ═══ PAYOUTS ═══ */}
      {section === 'payouts' && (
        <ScrollView contentContainerStyle={styles.dashContent} showsVerticalScrollIndicator={false}>
          <HostPayouts />
        </ScrollView>
      )}

      {/* ═══ WHATSAPP ═══ */}
      {section === 'whatsapp' && (
        <ScrollView contentContainerStyle={styles.dashContent} showsVerticalScrollIndicator={false}>
          <HostWhatsApp />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Nav
  navBar: { paddingHorizontal: 16, paddingVertical: 8, gap: 20 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 4 },
  navLabel: { fontSize: 13, fontWeight: '600' },

  // Dashboard
  dashContent: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11 },

  sectionBlock: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  bookingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  bookingTitle: { fontSize: 14, fontWeight: '600' },
  bookingDates: { fontSize: 12, marginTop: 2 },
  pendingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%' as any, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600' },

  // Properties
  listPad: { padding: 16 },
  propCard: { borderRadius: 14, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  propRow: { flexDirection: 'row', padding: 12, gap: 12 },
  propImgWrap: { width: 64, height: 64, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  propImg: { width: '100%', height: '100%' },
  propImgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  statusDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: '#fff' },
  propInfo: { flex: 1, justifyContent: 'center' },
  propTitle: { fontSize: 14, fontWeight: '600' },
  propLoc: { fontSize: 12, marginTop: 2 },
  propPrice: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  propActions: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 12 },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  actText: { fontSize: 12, fontWeight: '600' },

  // Bookings
  bookingCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  bookingPrice: { fontSize: 15, fontWeight: '700', marginTop: 6 },

  // States
  centerWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 4 },

  // Auth
  authWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  authIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  authTitle: { fontSize: 22, fontWeight: '700' },
  authSub: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  authBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  authLink: { fontSize: 15, fontWeight: '600', marginTop: 14 },
});
