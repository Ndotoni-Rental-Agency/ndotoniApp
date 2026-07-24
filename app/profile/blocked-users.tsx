import { useThemeColor } from '@/hooks/use-theme-color';
import { GraphQLClient } from '@/lib/graphql-client';
import { BlockedUser } from '@/lib/API';
import { listBlockedUsers } from '@/lib/graphql/queries';
import { unblockUser as unblockUserMutation } from '@/lib/graphql/mutations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const loadBlockedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ listBlockedUsers: BlockedUser[] }>(
        listBlockedUsers
      );
      setBlockedUsers(data.listBlockedUsers || []);
    } catch (error) {
      console.error('[BlockedUsersScreen] Failed to load blocked users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert(
      `Unblock ${user.userName || 'this user'}?`,
      'They will be able to message you and their listings will appear in your search results again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblockingId(user.blockId);
            try {
              await GraphQLClient.executeAuthenticated(unblockUserMutation, { blockId: user.blockId });
              setBlockedUsers(prev => prev.filter(u => u.blockId !== user.blockId));
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            } finally {
              setUnblockingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={[styles.item, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.itemLeft}>
        <View style={[styles.avatar, { backgroundColor: `${tint}20` }]}>
          <Ionicons name="person" size={20} color={tint} />
        </View>
        <Text style={[styles.itemName, { color: text }]}>{item.userName || 'Unknown user'}</Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
        disabled={unblockingId === item.blockId}
      >
        {unblockingId === item.blockId ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <Text style={[styles.unblockText, { color: tint }]}>Unblock</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text }]}>Blocked Users</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.blockId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="ban-outline" size={56} color={secondaryText} />
              <Text style={[styles.emptyText, { color: secondaryText }]}>
                You haven't blocked anyone.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemName: { fontSize: 16, fontWeight: '500', flex: 1 },
  unblockButton: { paddingHorizontal: 12, paddingVertical: 6 },
  unblockText: { fontSize: 14, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 15, marginTop: 16, textAlign: 'center' },
});
