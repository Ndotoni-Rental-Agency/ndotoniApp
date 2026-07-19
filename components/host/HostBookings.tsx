import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { approveBooking, declineBooking } from '@/lib/graphql/mutations';
import { listPropertyBookings } from '@/lib/graphql/queries';
import { ListPropertyBookingsQuery, BookingStatus } from '@/lib/API';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Booking = ListPropertyBookingsQuery['listPropertyBookings']['bookings'][number];

interface Props {
  propertyIds: string[];
  onRefresh?: () => void;
}

type Filter = 'PENDING' | 'CONFIRMED' | 'ALL';
type TimeFilter = 'upcoming' | 'past';

export default function HostBookings({ propertyIds, onRefresh }: Props) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  const fetchBookings = useCallback(async () => {
    if (propertyIds.length === 0) { setBookings([]); setLoading(false); return; }
    try {
      setLoading(true);
      const all: Booking[] = [];
      const results = await Promise.allSettled(
        propertyIds.slice(0, 10).map(pid =>
          GraphQLClient.executeAuthenticated<any>(listPropertyBookings, {
            propertyId: pid, limit: 20, status: filter === 'ALL' ? undefined : filter,
          })
        )
      );
      for (const r of results) {
        if (r.status === 'fulfilled') all.push(...(r.value.listPropertyBookings?.bookings || []));
      }
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(all);
    } catch {} finally { setLoading(false); }
  }, [propertyIds, filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await GraphQLClient.executeAuthenticated<any>(approveBooking, { bookingId: id });
      setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, status: BookingStatus.CONFIRMED } : b));
      Alert.alert('✅ Approved', 'Booking confirmed. Guest will be notified.');
      onRefresh?.();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to approve');
    } finally { setActionLoading(null); }
  };

  const handleDecline = async (id: string) => {
    if (!declineReason.trim()) { Alert.alert('Reason required'); return; }
    setActionLoading(id);
    try {
      await GraphQLClient.executeAuthenticated<any>(declineBooking, { bookingId: id, reason: declineReason.trim() });
      setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, status: BookingStatus.DECLINED } : b));
      setDeclineTarget(null); setDeclineReason('');
      Alert.alert('Declined', 'Booking request declined.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to decline');
    } finally { setActionLoading(null); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtPrice = (amt: number, cur: string) => `${cur === 'TZS' ? 'Tshs' : cur} ${amt.toLocaleString()}`;

  const statusColor = (s: string) => {
    if (s === 'PENDING') return '#f59e0b';
    if (s === 'CONFIRMED') return tint;
    if (s === 'CANCELLED' || s === 'DECLINED') return '#ef4444';
    return subtle;
  };

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const today = new Date().toISOString().split('T')[0];
  const filteredBookings = bookings.filter(b => {
    if (timeFilter === 'upcoming') return b.checkOutDate >= today;
    return b.checkOutDate < today;
  });

  if (loading) return <ActivityIndicator color={tint} style={{ paddingVertical: 40 }} />;

  return (
    <View>
      {/* Time toggle */}
      <View style={styles.filterRow}>
        {(['upcoming', 'past'] as TimeFilter[]).map(t => (
          <TouchableOpacity key={t} style={[styles.filterPill, { backgroundColor: timeFilter === t ? text : `${border}` }]} onPress={() => setTimeFilter(t)}>
            <Text style={[styles.filterText, { color: timeFilter === t ? '#fff' : text }]}>
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filters */}
      <View style={styles.filterRow}>
        {(['PENDING', 'CONFIRMED', 'ALL'] as Filter[]).map(f => (
          <TouchableOpacity key={f} style={[styles.filterPill, { backgroundColor: filter === f ? tint : `${border}` }]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : text }]}>
              {f === 'PENDING' && pendingCount > 0 ? `Pending (${pendingCount})` : f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings */}
      {filteredBookings.length === 0 ? (
        <Text style={[styles.empty, { color: subtle }]}>
          {timeFilter === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
        </Text>
      ) : (
        filteredBookings.map(b => {
          const guestName = b.guestName || (b.guest ? `${b.guest.firstName} ${b.guest.lastName || ''}`.trim() : 'Guest');
          const isProcessing = actionLoading === b.bookingId;
          const isPast = b.checkInDate < today;

          return (
            <View key={b.bookingId} style={[styles.bookingCard, { backgroundColor: card, borderColor: border }]}>
              {/* Header */}
              <View style={styles.bHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.bNameRow}>
                    <Text style={[styles.bName, { color: text }]}>{guestName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor(b.status)}15` }]}>
                      <Text style={[styles.statusText, { color: statusColor(b.status) }]}>{b.status}</Text>
                    </View>
                  </View>
                  {b.property?.title && <Text style={[styles.bProperty, { color: subtle }]}>{b.property.title}</Text>}
                </View>
                <Text style={[styles.bPrice, { color: text }]}>{fmtPrice((b.pricing?.subtotal || 0) + (b.pricing?.cleaningFee || 0), b.pricing?.currency || 'TZS')}</Text>
              </View>

              {/* Details */}
              <View style={styles.bDetails}>
                <Text style={[styles.bDetail, { color: subtle }]}>{fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}</Text>
                <Text style={[styles.bDetail, { color: subtle }]}>{b.numberOfNights || 1} night{(b.numberOfNights || 1) > 1 ? 's' : ''} · {b.numberOfGuests || 1} guest{(b.numberOfGuests || 1) > 1 ? 's' : ''}</Text>
              </View>

              {b.specialRequests && <Text style={[styles.bRequest, { color: subtle, borderColor: border }]}>"{b.specialRequests}"</Text>}

              {/* Actions for pending (only upcoming) */}
              {b.status === 'PENDING' && !isPast && (
                <View style={[styles.bActions, { borderTopColor: border }]}>
                  {declineTarget === b.bookingId ? (
                    <View style={{ gap: 8, flex: 1 }}>
                      <TextInput style={[styles.declineInput, { color: text, borderColor: border }]} value={declineReason} onChangeText={setDeclineReason} placeholder="Reason..." placeholderTextColor={subtle} />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={[styles.cancelBtn, { borderColor: border }]} onPress={() => { setDeclineTarget(null); setDeclineReason(''); }}>
                          <Text style={[{ color: text, fontSize: 13, fontWeight: '600' }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.declineConfirmBtn]} onPress={() => handleDecline(b.bookingId)} disabled={isProcessing}>
                          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{isProcessing ? '...' : 'Decline'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity style={[styles.approveBtn, { backgroundColor: tint }]} onPress={() => handleApprove(b.bookingId)} disabled={isProcessing}>
                        <Text style={styles.approveBtnText}>{isProcessing ? 'Approving...' : 'Approve'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.declineBtn, { borderColor: '#fca5a5' }]} onPress={() => setDeclineTarget(b.bookingId)}>
                        <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* Message guest in-app */}
              {b.status === 'CONFIRMED' && (
                <TouchableOpacity style={[styles.messageBtn, { borderTopColor: border }]} onPress={() => {
                  const conversationId = `${b.guestId}#${b.propertyId}`;
                  router.push(`/conversation/${encodeURIComponent(conversationId)}` as any);
                }}>
                  <Ionicons name="chatbubble-outline" size={16} color={tint} />
                  <Text style={{ color: tint, fontSize: 13, fontWeight: '600' }}>Message Guest</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', paddingVertical: 40, fontSize: 14 },

  bookingCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  bHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bName: { fontSize: 15, fontWeight: '600' },
  bProperty: { fontSize: 12, marginTop: 2 },
  bPrice: { fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  bDetails: { flexDirection: 'row', gap: 12, marginTop: 10 },
  bDetail: { fontSize: 12 },
  bRequest: { fontSize: 12, fontStyle: 'italic', marginTop: 8, padding: 8, borderWidth: 1, borderRadius: 8 },

  bActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  approveBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  declineBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  declineInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  cancelBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  declineConfirmBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#ef4444' },

  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
});
