import PublishPropertyModal from '@/components/property/PublishPropertyModal';
import { useAlert } from '@/contexts/AlertContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLandlordShortTermProperties } from '@/hooks/useLandlordShortTermProperties';
import { useDeleteProperty } from '@/hooks/useProperty';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandlordPropertiesScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'background');
  const secondaryText = useThemeColor({ light: '#666', dark: '#9ca3af' }, 'text');

  const [refreshing, setRefreshing] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [selectedPropertyForPublish, setSelectedPropertyForPublish] = useState<any>(null);

  const {
    properties,
    loading,
    error,
    refetch,
  } = useLandlordShortTermProperties(true);

  const { deletePropertyById, isDeleting } = useDeleteProperty();
  const { showAlert } = useAlert();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (amount: number, currency: string = 'TZS') => {
    return `${currency} ${amount?.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'PUBLISHED':
      case 'AVAILABLE':
        return '#10b981';
      case 'DRAFT':
        return '#f59e0b';
      case 'PENDING':
      case 'PENDING_REVIEW':
        return '#3b82f6';
      case 'INACTIVE':
      case 'REJECTED':
        return '#ef4444';
      default:
        return secondaryText;
    }
  };

  const renderPropertyCard = ({ item: property }: { item: any }) => {
    const thumbnail = property.thumbnail || property.images?.[0];
    const isDraft = !property.status || property.status === 'DRAFT';
    const isActive = property.status === 'ACTIVE' || property.status === 'AVAILABLE' || property.status === 'PUBLISHED';
    
    return (
      <View style={[styles.propertyCard, { backgroundColor: cardBg, borderColor }]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/short-property/${property.propertyId}` as any)}
          activeOpacity={0.7}
        >
          {/* Property Image */}
          <View style={styles.imageContainer}>
            {thumbnail ? (
              <Image
                source={{ uri: thumbnail }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: `${tintColor}20` }]}>
                <Ionicons name="home" size={40} color={tintColor} />
              </View>
            )}
            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(property.status || 'DRAFT') },
              ]}
            >
              <Text style={styles.statusText}>
                {(property.status || 'DRAFT').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, { color: textColor }]} numberOfLines={2}>
              {property.title}
            </Text>
            
            <View style={styles.propertyLocation}>
              <Ionicons name="location-outline" size={14} color={secondaryText} />
              <Text style={[styles.locationText, { color: secondaryText }]} numberOfLines={1}>
                {property.district}, {property.region}
              </Text>
            </View>

            <View style={styles.propertyDetails}>
              <Text style={[styles.detailsText, { color: secondaryText }]}>
                {property.propertyType} · {property.maxGuests || 0} guests
              </Text>
            </View>

            {property.averageRating && property.averageRating > 0 && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={[styles.ratingText, { color: textColor }]}>
                  {property.averageRating.toFixed(1)}
                </Text>
                {property.ratingSummary?.totalReviews && (
                  <Text style={[styles.reviewsText, { color: secondaryText }]}>
                    ({property.ratingSummary.totalReviews})
                  </Text>
                )}
              </View>
            )}

            <View style={styles.propertyFooter}>
              <View>
                <Text style={[styles.propertyPrice, { color: textColor }]}>
                  {formatPrice(property.nightlyRate || 0, property.currency)}
                </Text>
                <Text style={[styles.priceUnit, { color: secondaryText }]}>per night</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { borderTopColor: borderColor }]}>
          {isDraft && (
            <TouchableOpacity
              style={[styles.actionButton, styles.publishButton]}
              onPress={() => {
                setSelectedPropertyForPublish(property);
                setPublishModalVisible(true);
              }}
            >
              <Text style={styles.publishButtonText}>Publish</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() => router.push(`/landlord/short-property/${property.propertyId}` as any)}
          >
            <Text style={[styles.actionButtonText, { color: textColor }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor }]}
            onPress={() => router.push(`/landlord/calendar/${property.propertyId}?type=short-term` as any)}
          >
            <Ionicons name="calendar-outline" size={16} color={textColor} />
            <Text style={[styles.actionButtonText, { color: textColor }]}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#ef4444' }]}
            onPress={() => {
              showAlert({
                title: 'Delete Property',
                message: 'Are you sure you want to delete this property? This action cannot be undone.',
                icon: 'delete',
                buttons: [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      const result = await deletePropertyById(property.propertyId);
                      if (result.success) {
                        showAlert({ title: 'Deleted', message: 'Property deleted successfully', icon: 'success' });
                        handleRefresh();
                      } else {
                        showAlert({ title: 'Error', message: result.message || 'Failed to delete property', icon: 'error' });
                      }
                    },
                  },
                ],
              });
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Listings</Text>
        <TouchableOpacity onPress={() => router.push('/landlord/short-property/create' as any)} style={styles.addButton}>
          <Ionicons name="add" size={24} color={tintColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={properties}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.propertyId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tintColor} />
        }
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[styles.loadingText, { color: secondaryText }]}>Loading properties...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: tintColor }]}
                onPress={handleRefresh}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={64} color={secondaryText} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No Properties Yet</Text>
              <Text style={[styles.emptyText, { color: secondaryText }]}>
                Start listing your short-term properties
              </Text>
              <TouchableOpacity
                style={[styles.addPropertyButton, { backgroundColor: tintColor }]}
                onPress={() => router.push('/landlord/short-property/create' as any)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addPropertyButtonText}>Add Property</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Publish Modal */}
      {selectedPropertyForPublish && (
        <PublishPropertyModal
          visible={publishModalVisible}
          onClose={() => {
            setPublishModalVisible(false);
            setSelectedPropertyForPublish(null);
          }}
          propertyId={selectedPropertyForPublish.propertyId}
          existingMedia={selectedPropertyForPublish.images || []}
          onSuccess={handleRefresh}
          isLongTerm={false}
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 80,
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  addPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addPropertyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  propertyCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 140,
    height: 140,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  propertyDetails: {
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 13,
  },
  propertyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  propertyPrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  publishButton: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
