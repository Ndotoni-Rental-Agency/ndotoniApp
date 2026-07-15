import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { listPropertyBookings } from '@/lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  propertyIds: string[];
}

interface MonthData {
  month: string;
  earnings: number;
  bookings: number;
}

export default function HostStats({ propertyIds }: Props) {
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [avgPerNight, setAvgPerNight] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);

  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background');
  const border = useThemeColor({ light: '#ebebeb', dark: '#2c2c2e' }, 'background');
  const subtle = useThemeColor({ light: '#717171', dark: '#a1a1aa' }, 'text');

  useEffect(() => {
    if (propertyIds.length > 0) fetchData();
    else setLoading(false);
  }, [propertyIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const allBookings: any[] = [];
      const results = await Promise.allSettled(
        propertyIds.slice(0, 10).map(pid =>
          GraphQLClient.executeAuthenticated<any>(listPropertyBookings, { propertyId: pid, limit: 50 })
        )
      );
      for (const r of results) {
        if (r.status === 'fulfilled') allBookings.push(...(r.value.listPropertyBookings?.bookings || []));
      }

      // Only paid bookings count
      const paid = allBookings.filter(b => b.paymentStatus === 'CAPTURED' || b.paymentStatus === 'AUTHORIZED');
      const total = paid.reduce((s, b) => s + (b.pricing?.total || b.totalPrice || 0), 0);
      const totalNights = paid.reduce((s, b) => s + (b.numberOfNights || 1), 0);

      setTotalEarned(total);
      setTotalBookings(paid.length);
      setAvgPerNight(totalNights > 0 ? Math.round(total / totalNights) : 0);

      // Build last 6 months
      const now = new Date();
      const months: MonthData[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthBookings = paid.filter(b => (b.checkInDate || b.createdAt || '').startsWith(key));
        const monthEarnings = monthBookings.reduce((s, b) => s + (b.pricing?.total || b.totalPrice || 0), 0);
        months.push({ month: monthNames[d.getMonth()], earnings: monthEarnings, bookings: monthBookings.length });
      }
      setMonthlyData(months);
    } catch {} finally { setLoading(false); }
  };

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : n.toLocaleString();
  const maxEarnings = Math.max(...monthlyData.map(m => m.earnings), 1);

  if (loading) return <ActivityIndicator color={tint} style={{ paddingVertical: 60 }} />;

  return (
    <View>
      {/* Summary stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: card, borderColor: border }]}>
          <Ionicons name="cash-outline" size={20} color={tint} />
          <Text style={[styles.statNum, { color: text }]}>Tshs {fmt(totalEarned)}</Text>
          <Text style={[styles.statLabel, { color: subtle }]}>Total earned</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: card, borderColor: border }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={tint} />
          <Text style={[styles.statNum, { color: text }]}>{totalBookings}</Text>
          <Text style={[styles.statLabel, { color: subtle }]}>Completed</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: card, borderColor: border }]}>
          <Ionicons name="trending-up-outline" size={20} color={tint} />
          <Text style={[styles.statNum, { color: text }]}>Tshs {fmt(avgPerNight)}</Text>
          <Text style={[styles.statLabel, { color: subtle }]}>Avg / night</Text>
        </View>
      </View>

      {/* Earnings chart (bar graph) */}
      <View style={[styles.chartSection, { backgroundColor: card, borderColor: border }]}>
        <Text style={[styles.chartTitle, { color: text }]}>Monthly earnings</Text>
        <Text style={[styles.chartSub, { color: subtle }]}>Last 6 months</Text>

        <View style={styles.chart}>
          {monthlyData.map((m, i) => {
            const height = maxEarnings > 0 ? Math.max((m.earnings / maxEarnings) * 120, 4) : 4;
            return (
              <View key={i} style={styles.barCol}>
                <View style={styles.barWrap}>
                  <View style={[styles.bar, { height, backgroundColor: m.earnings > 0 ? tint : border }]} />
                </View>
                <Text style={[styles.barLabel, { color: subtle }]}>{m.month}</Text>
                {m.earnings > 0 && (
                  <Text style={[styles.barValue, { color: text }]}>{fmt(m.earnings)}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Monthly breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={[styles.chartTitle, { color: text }]}>Breakdown</Text>
        {monthlyData.filter(m => m.bookings > 0).reverse().map((m, i) => (
          <View key={i} style={[styles.breakdownRow, { borderBottomColor: border }]}>
            <Text style={[styles.breakdownMonth, { color: text }]}>{m.month}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.breakdownEarnings, { color: text }]}>Tshs {m.earnings.toLocaleString()}</Text>
              <Text style={[styles.breakdownBookings, { color: subtle }]}>{m.bookings} booking{m.bookings !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        ))}
        {monthlyData.every(m => m.bookings === 0) && (
          <Text style={[styles.noData, { color: subtle }]}>No earnings data yet. Bookings will appear here once guests pay.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 11 },

  chartSection: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartSub: { fontSize: 12, marginTop: 2, marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barCol: { flex: 1, alignItems: 'center' },
  barWrap: { height: 120, justifyContent: 'flex-end' },
  bar: { width: 24, borderRadius: 6 },
  barLabel: { fontSize: 11, marginTop: 6 },
  barValue: { fontSize: 9, fontWeight: '600', marginTop: 2 },

  breakdownSection: { marginTop: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  breakdownMonth: { fontSize: 15, fontWeight: '600' },
  breakdownEarnings: { fontSize: 14, fontWeight: '600' },
  breakdownBookings: { fontSize: 12, marginTop: 1 },
  noData: { fontSize: 14, textAlign: 'center', paddingVertical: 30, lineHeight: 20 },
});
