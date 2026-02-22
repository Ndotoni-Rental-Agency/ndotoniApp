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
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Booking {
  bookingId: string;
  bookingType: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  property: {
    propertyId: string;
    title: string;
    thumbnail?: string;
    images?: string[];
    currency?: string;
  };
}

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, selectedTab]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const statusMap = {
        upcoming: 'CONFIRMED',
        past: 'COMPLETED',
        cancelled: 'CANCELLED',
      };

      const response = await GraphQLClient.executeAuthenticated<any>(listMyBookings, {
        status: statusMap[selectedTab],
        limit: 50,
      });

      // Handle null or empty response gracefully
      const bookingsList = response?.listMyBookings?.bookings;
      setBookings(Array.isArray(bookingsList) ? bookingsList : []);
    } catch (error: any) {
      console.error('[Bookings] Error fetching bookings:', error);
      
      // If it's a null response error, just show empty state
      if (error?.message?.includes('Cannot return null for non-nullable')) {
        console.log('[Bookings] No bookings found (null response from backend)');
        setBookings([]);
      } else {
        // For other errors, you might want to show an error message
        console.error('[Bookings] Unexpected error:', error);
        setBookings([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setIsRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#ef4444';
      case 'COMPLETED':
        return '#6b7280';
      default:
        return secondaryText;
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const propertyImage = item.property?.thumbnail || item.property?.images?.[0];
    const currency = item.property?.currency || 'TZS';

    return (
      <TouchableOpacity
        style={[styles.bookingCard, { backgroundColor: cardBg, borderColor }]}
        onPress={() => router.push(`/bookings/${item.bookingId}` as any)}
      >
        {propertyImage && (
          <Image source={{ uri: propertyImage }} style={styles.propertyImage} resizeMode="cover" />
        )}
        <View style={styles.bookingInfo}>
          <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={2}>
            {item.property?.title || 'Property'}
          </Text>
          
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={secondaryText} />
            <Text style={[styles.dateText, { color: secondaryText }]}>
              {formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={[styles.priceText, { color: textColor }]}>
              {currency === 'TZS' ? 'Tshs' : currency} {item.totalPrice.toLocaleString()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>My Bookings</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={secondaryText} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>Sign In Required</Text>
          <Text style={[styles.emptyText, { color: secondaryText }]}>
            Please sign in to view your bookings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'upcoming' && { borderBottomColor: tintColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'upcoming' ? tintColor : secondaryText },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'past' && { borderBottomColor: tintColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setSelectedTab('past')}
        >
          <Text
            style={[styles.tabText, { color: selectedTab === 'past' ? tintColor : secondaryText }]}
          >
            Past
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'cancelled' && { borderBottomColor: tintColor, borderBottomWidth: 2 },
          ]}
          onPress={() => setSelectedTab('cancelled')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'cancelled' ? tintColor : secondaryText },
            ]}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={secondaryText} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No Bookings</Text>
          <Text style={[styles.emptyText, { color: secondaryText }]}>
            {selectedTab === 'upcoming'
              ? "You don't have any upcoming bookings"
              : selectedTab === 'past'
              ? "You don't have any past bookings"
              : "You don't have any cancelled bookings"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.bookingId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={tintColor} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 20,
  },
  bookingCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 180,
  },
  bookingInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
