# Short-Term Property Contact Feature - Implementation Guide

## Issue
The WhatsApp and internal messaging buttons on short-term properties need to:
1. Work like long-term properties (with modal and authentication)
2. Check if user is authenticated before allowing messaging
3. Show sign-in modal if not authenticated

## Current Implementation (Long-Term Properties)
Long-term properties use a contact modal with:
- Message Host button (requires authentication)
- WhatsApp button (if available)
- Reserve/Check Availability button

## Required Changes for Short-Term Properties

### 1. Add Required Imports
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { Modal, Alert, Linking } from 'react-native';
```

### 2. Add State Variables
```typescript
const [showContactModal, setShowContactModal] = useState(false);
const [isInitializingChat, setIsInitializingChat] = useState(false);
const { isAuthenticated } = useAuth();
const { initializeChat } = useChat();
```

### 3. Add Contact Handler Functions
```typescript
const handleContactHost = async () => {
  if (!isAuthenticated) {
    Alert.alert(
      'Sign In Required',
      'Please sign in to contact the property host',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(tabs)/profile') }
      ]
    );
    return;
  }

  if (!property) return;

  try {
    setIsInitializingChat(true);
    const chatData = await initializeChat(property.propertyId);
    
    // Navigate to conversation
    const encodedConversationId = encodeURIComponent(chatData.conversationId);
    router.push(`/conversation/${encodedConversationId}`);
  } catch (error) {
    console.error('Error initializing chat:', error);
    Alert.alert('Error', 'Failed to start chat. Please try again.');
  } finally {
    setIsInitializingChat(false);
  }
};

const handleWhatsAppContact = () => {
  if (!property) return;

  const whatsappNumber = property.host?.whatsappNumber;
  
  if (!whatsappNumber) {
    Alert.alert('Not Available', 'WhatsApp contact is not available for this property');
    return;
  }

  const whatsappUrl = generateWhatsAppUrl(
    whatsappNumber,
    property.title,
    property.propertyId
  );

  Linking.openURL(whatsappUrl).catch(() => {
    Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed.');
  });
};
```

### 4. Replace Bottom Bar
Replace the current bottom bar with:

```typescript
<SafeAreaView edges={['bottom']} style={{ backgroundColor: headerBg }}>
  <View style={[styles.bottomBar, { backgroundColor: headerBg, borderTopColor: borderColor }]}>
    <View style={styles.bottomBarContent}>
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: textColor }]}>
          {property.currency} {property.nightlyRate.toLocaleString()}
        </Text>
        <Text style={styles.priceUnit}>per night</Text>
      </View>
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: tintColor }]}
        onPress={() => setShowContactModal(true)}
      >
        <Ionicons name="chatbubble" size={20} color="#fff" />
        <Text style={styles.bookButtonText}>Contact</Text>
      </TouchableOpacity>
    </View>
  </View>
</SafeAreaView>
```

### 5. Add Contact Modal
Add this modal after the bottom bar:

```typescript
<Modal
  visible={showContactModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowContactModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: headerBg }]}>
      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: textColor }]}>Contact Options</Text>
        <TouchableOpacity onPress={() => setShowContactModal(false)}>
          <Ionicons name="close" size={28} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Price Info */}
      <View style={[styles.modalPriceSection, { borderBottomColor: borderColor }]}>
        <Text style={[styles.modalPrice, { color: textColor }]}>
          {property.currency} {property.nightlyRate.toLocaleString()}
        </Text>
        <Text style={styles.modalPriceUnit}>per night</Text>
      </View>

      {/* Contact Buttons */}
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalContactButton, { backgroundColor: textColor }]}
          onPress={() => {
            setShowContactModal(false);
            handleContactHost();
          }}
          disabled={isInitializingChat}
        >
          {isInitializingChat ? (
            <ActivityIndicator size="small" color={backgroundColor} />
          ) : (
            <>
              <Ionicons name="chatbubble" size={20} color={backgroundColor} />
              <Text style={[styles.modalContactButtonText, { color: backgroundColor }]}>
                Message Host
              </Text>
            </>
          )}
        </TouchableOpacity>

        {property.host?.whatsappNumber && (
          <TouchableOpacity
            style={[styles.modalWhatsappButton, { backgroundColor: '#10B981' }]}
            onPress={() => {
              setShowContactModal(false);
              handleWhatsAppContact();
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.modalWhatsappButtonText}>WhatsApp Contact</Text>
          </TouchableOpacity>
        )}

        {/* Reserve Button */}
        <TouchableOpacity
          style={[styles.modalReserveButton, { backgroundColor: tintColor }]}
          onPress={() => {
            setShowContactModal(false);
            setShowReservationModal(true);
          }}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.modalReserveButtonText}>
            Reserve Property
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

### 6. Add Modal Styles
Add these styles to the StyleSheet:

```typescript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
},
modalContent: {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: 40,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 20,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
},
modalPriceSection: {
  paddingHorizontal: 20,
  paddingBottom: 20,
  borderBottomWidth: 1,
},
modalPrice: {
  fontSize: 24,
  fontWeight: 'bold',
},
modalPriceUnit: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
},
modalButtons: {
  paddingHorizontal: 20,
  paddingTop: 20,
  gap: 12,
},
modalContactButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 16,
  borderRadius: 12,
},
modalContactButtonText: {
  fontSize: 16,
  fontWeight: '600',
},
modalWhatsappButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 16,
  borderRadius: 12,
},
modalWhatsappButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
modalReserveButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 16,
  borderRadius: 12,
},
modalReserveButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
```

### 7. Update bookButton Style
```typescript
bookButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 28,
  paddingVertical: 16,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 6,
},
```

## Benefits

1. **Authentication Check**: Users must sign in before messaging
2. **Better UX**: Modal provides clear options
3. **Consistent**: Matches long-term property behavior
4. **WhatsApp Integration**: Only shows if host has WhatsApp number
5. **Error Handling**: Graceful handling of missing data or errors

## Testing

1. Test as unauthenticated user - should show sign-in alert
2. Test as authenticated user - should open chat
3. Test WhatsApp button - should open WhatsApp
4. Test Reserve button - should open reservation modal
5. Test with property that has no WhatsApp - button should not appear

## Status

- Documentation: ✅ Complete
- Implementation: ⏳ Pending (apply changes to `app/short-property/[id].tsx`)
- Testing: ⏳ Pending

## Reference

See `app/property/[id].tsx` for the complete working implementation on long-term properties.
