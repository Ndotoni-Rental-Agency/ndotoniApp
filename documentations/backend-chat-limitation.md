# Backend Chat Limitation - Short-Term Properties

## Issue

The `initializePropertyChat` mutation currently only supports long-term properties. When attempting to initialize a chat for a short-term property, the backend returns:

```
Error: Property not found
```

## Error Details

```
[GraphQLClient] GraphQL errors: [{
  "errorType": "Lambda:Unhandled",
  "message": "Property not found",
  "path": ["initializePropertyChat"]
}]
```

## Root Cause

The backend's chat initialization logic is looking up properties in the long-term properties table/index, but short-term properties are stored separately.

## Frontend Solution (Implemented)

The frontend now handles this gracefully:

1. **Error Detection**: Catches "Property not found" error
2. **User-Friendly Message**: Shows clear explanation that internal messaging isn't available yet
3. **WhatsApp Fallback**: Suggests using WhatsApp if available
4. **UI Priority**: WhatsApp button is now primary (green), Message button is secondary (outlined)

### Code Changes

**File**: `components/property/PropertyContactSection.tsx`

```typescript
catch (error: any) {
  if (error?.message?.includes('Property not found')) {
    Alert.alert(
      'Internal Messaging Not Available',
      hostWhatsappNumber 
        ? 'Internal messaging is not yet available for short-term properties. Please use WhatsApp to contact the host.'
        : 'Internal messaging is not yet available for short-term properties.',
      [
        hostWhatsappNumber && {
          text: 'Use WhatsApp',
          onPress: handleWhatsAppContact,
        },
        { text: 'OK', style: 'cancel' },
      ].filter(Boolean)
    );
  }
}
```

## Backend Solution (Required)

### Option 1: Unified Chat System (Recommended)

Update `initializePropertyChat` to support both property types:

```typescript
export const initializePropertyChat = async (event) => {
  const { propertyId } = event.arguments;
  const userId = event.identity.sub;
  
  // Try to find property in both tables
  let property = await getShortTermProperty(propertyId);
  let propertyType = 'SHORT_TERM';
  
  if (!property) {
    property = await getLongTermProperty(propertyId);
    propertyType = 'LONG_TERM';
  }
  
  if (!property) {
    throw new Error('Property not found');
  }
  
  // Create or get conversation
  const conversation = await createOrGetConversation({
    propertyId,
    propertyType,
    tenantId: userId,
    landlordId: property.landlordId,
  });
  
  return conversation;
};
```

### Option 2: Separate Mutations

Create separate mutations for each property type:

```graphql
mutation InitializeShortTermPropertyChat($propertyId: ID!) {
  initializeShortTermPropertyChat(propertyId: $propertyId) {
    conversationId
    propertyId
    participants
  }
}

mutation InitializeLongTermPropertyChat($propertyId: ID!) {
  initializeLongTermPropertyChat(propertyId: $propertyId) {
    conversationId
    propertyId
    participants
  }
}
```

Then update frontend to use the appropriate mutation based on property type.

## Current Workaround

Users can contact hosts via:
1. ✅ **WhatsApp** - Works perfectly (if host has WhatsApp number)
2. ⏳ **Internal Messaging** - Shows helpful error message directing to WhatsApp

## Impact

- **User Experience**: Minimal - WhatsApp is preferred by most users anyway
- **Functionality**: WhatsApp provides full communication capability
- **Priority**: Medium - Internal messaging is nice-to-have, not critical

## Testing

To verify the fix:

1. Navigate to a short-term property
2. Click "Message" button
3. Should see alert: "Internal messaging is not yet available for short-term properties. Please use WhatsApp to contact the host."
4. Click "Use WhatsApp" - should open WhatsApp
5. WhatsApp button should work directly

## Status

- Frontend: ✅ Fixed with graceful error handling
- Backend: ⏳ Needs update to support short-term properties
- Priority: Medium (WhatsApp works as alternative)

## Related Files

- `components/property/PropertyContactSection.tsx` - Contact UI component
- `contexts/ChatContext.tsx` - Chat initialization logic
- Backend: `initializePropertyChat` resolver

## Recommendation

Implement Option 1 (Unified Chat System) in the backend to support both property types with a single mutation. This provides the best user experience and maintains consistency across the platform.
