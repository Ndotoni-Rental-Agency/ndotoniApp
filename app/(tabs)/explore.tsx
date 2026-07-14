import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLandlordShortTermProperties } from '@/hooks/useLandlordShortTermProperties';
import { useDeleteProperty } from '@/hooks/useProperty';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HostTab = 'properties' | 'bookings' | 'calendar';

export default function HostDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<HostTab>('properties');
  const [refreshing, setRefreshing] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const { properties, loading, refetch } = useLandlordShortTermProperties(isAuthenticated && !authLoading);
  const { deletePropertyById, isDeleting } = useDeleteProperty();

  const handleRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete property', `Remove "${title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const r = await deletePropertyById(id);
        if (r.success) handleRefresh();
        else Alert.alert('Error', r.message || 'Failed to delete');
      }},
    ]);
  };

  // ─── NOT AUTHENTICATED ───
  if (authLoading) return <View style={[styles.fill, { backgroundColor: bg }]}><ActivityIndicator style={{ flex: 1 }} color={tint} /></View>;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
        <View style={styles.unauthWrap}>
          <View style={[styles.unauthIcon, { backgroundColor: `${tint}15` }]}>
            <Ionicons name="home-outline" size={40} color={tint} />
          </View>
          <Text style={[styles.unauthTitle, { color: text }]}>Become a Host</Text>
          <Text style={[styles.unauthSub, { color: subtle }]}>List your property for short-term stays and start earning</Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: tint }]} onPress={() => setShowSignIn(true)}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSignUp(true)}>
            <Text style={[styles.linkText, { color: tint }]}>Create an account</Text>
          </TouchableOpacity>
        </View>
        <SignInModal visible={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} onForgotPassword={() => {}} onNeedsVerification={() => {}} />
        <SignUpModal visible={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} onNeedsVerification={() => {}} />
      </SafeAreaView>
    );
  }

  // ─── HOST DASHBOARD ───
  const TABS: { key: HostTab; label: string; icon: string }[] = [
    { key: 'properties', label: 'Listings', icon: 'home-outline' },
    { key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
    { key: 'calendar', label: 'Calendar', icon: 'grid-outline' },
  ];

  const renderProperty = ({ item: p }: { item: any }) => {
    const statusColor = p.status === 'AVAILABLE' || p.status === 'ACTIVE' ? tint : p.status === 'DRAFT' ? '#f59e0b' : subtle;
    return (
      <View style={[styles.propCard, { backgroundColor: card, borderColor: border }]}>
        <TouchableOpacity style={styles.propRow} activeOpacity={0.8} onPress={() => router.push(`/short-property/${p.propertyId}` as any)}>
          <View style={styles.propImgWrap}>
            {p.thumbnail || p.images?.[0] ? (
              <Image source={{ uri: p.thumbnail || p.images?.[0] }} style={styles.propImg} contentFit="cover" />
            ) : (
              <View style={[styles.propImgPlaceholder, { backgroundColor: `${tint}10` }]}>
                <Ionicons name="image-outline" size={24} color={tint} />
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <View style={styles.propInfo}>
            <Text style={[styles.propTitle, { color: text }]} numberOfLines={1}>{p.title}</Text>
            <Text style={[styles.propLoc, { color: subtle }]}>{p.district}, {p.region}</Text>
            <Text style={[styles.propPrice, { color: text }]}>
              {p.currency === 'TZS' ? 'Tshs' : p.currency} {(p.nightlyRate || 0).toLocaleString()}
              <Text style={{ color: subtle, fontWeight: '400' }}> /night</Text>
            </Text>
          </View>
        </TouchableOpacity>
        {/* Quick actions */}
        <View style={[styles.propActions, { borderTopColor: border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/landlord/short-property/${p.propertyId}` as any)}>
            <Ionicons name="create-outline" size={16} color={text} />
            <Text style={[styles.actionText, { color: text }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/landlord/calendar/${p.propertyId}?type=short-term` as any)}>
            <Ionicons name="calendar-outline" size={16} color={text} />
            <Text style={[styles.actionText, { color: text }]}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(p.propertyId, p.title)} disabled={isDeleting}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text style={[styles.headerTitle, { color: text }]}>Host Dashboard</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: tint }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: border }]}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? tint : subtle} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? tint : subtle }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'properties' && (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.propertyId}
          renderItem={renderProperty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tint} />}
          ListEmptyComponent={
            loading ? (
              <View style={styles.centerWrap}><ActivityIndicator size="large" color={tint} /></View>
            ) : (
              <View style={styles.centerWrap}>
                <Ionicons name="home-outline" size={40} color={subtle} />
                <Text style={[styles.emptyTitle, { color: text }]}>No listings yet</Text>
                <Text style={[styles.emptySub, { color: subtle }]}>Add your first property to start hosting</Text>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: tint, marginTop: 16 }]} onPress={() => router.push('/landlord/short-property/create' as any)}>
                  <Text style={styles.primaryBtnText}>Add Property</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}

      {activeTab === 'bookings' && (
        <ScrollView contentContainerStyle={styles.comingSoon}>
          <Ionicons name="calendar-outline" size={40} color={subtle} />
          <Text style={[styles.emptyTitle, { color: text }]}>Bookings</Text>
          <Text style={[styles.emptySub, { color: subtle }]}>Manage incoming booking requests and confirmed stays. Coming soon to the app — use the web dashboard for now.</Text>
        </ScrollView>
      )}

      {activeTab === 'calendar' && (
        <ScrollView contentContainerStyle={styles.comingSoon}>
          <Ionicons name="grid-outline" size={40} color={subtle} />
          <Text style={[styles.emptyTitle, { color: text }]}>Calendar</Text>
          <Text style={[styles.emptySub, { color: subtle }]}>Block dates, set pricing per night, and manage availability. Use the web dashboard for full calendar management.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: 'transparent' }, // color applied via tint
  tabText: { fontSize: 13, fontWeight: '600' },

  // List
  listContent: { padding: 16 },
  propCard: { borderRadius: 14, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  propRow: { flexDirection: 'row', padding: 12, gap: 12 },
  propImgWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  propImg: { width: '100%', height: '100%' },
  propImgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  statusDot: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  propInfo: { flex: 1, justifyContent: 'center' },
  propTitle: { fontSize: 15, fontWeight: '600' },
  propLoc: { fontSize: 13, marginTop: 2 },
  propPrice: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  propActions: { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  actionText: { fontSize: 12, fontWeight: '600' },

  // Empty / center
  centerWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  comingSoon: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },

  // Auth
  unauthWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  unauthIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  unauthTitle: { fontSize: 22, fontWeight: '700' },
  unauthSub: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  primaryBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { fontSize: 15, fontWeight: '600', marginTop: 14 },
});
