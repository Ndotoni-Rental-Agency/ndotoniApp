import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';

export function usePropertyContact(
  userId: string | undefined,
  onConversationCreated?: (conversationId: string, tempConversation?: any) => void,
  onConversationsReload?: () => Promise<any[]>
) {
  const [suggestedMessage, setSuggestedMessage] = useState('');
  const searchParams = useLocalSearchParams();
  const processedParams = useRef<string | null>(null);

  // Extract search params (expo-router returns string | string[] | undefined)
  const landlordId = Array.isArray(searchParams.landlordId) ? searchParams.landlordId[0] : searchParams.landlordId;
  const propertyTitle = Array.isArray(searchParams.propertyTitle) ? searchParams.propertyTitle[0] : searchParams.propertyTitle;
  const isLandlordAccessingOwnProperty = userId === landlordId;

  const getSuggestedMessage = (messagesLength: number) => {
    // Only return the stored suggested message
    // This ensures the suggested message is ONLY shown for new conversations
    // coming from URL params, not for existing conversations with 0 messages
    return suggestedMessage;
  };

  const clearSuggestedMessage = () => {
    setSuggestedMessage('');
  };

  useEffect(() => {
    const handlePropertyContact = () => {
      // Extract params (expo-router returns string | string[] | undefined)
      const propertyId = Array.isArray(searchParams.propertyId) ? searchParams.propertyId[0] : searchParams.propertyId;
      let landlordId = Array.isArray(searchParams.landlordId) ? searchParams.landlordId[0] : searchParams.landlordId;
      const propertyTitle = Array.isArray(searchParams.propertyTitle) ? searchParams.propertyTitle[0] : searchParams.propertyTitle;
      const landLordFirstName = Array.isArray(searchParams.landLordFirstName) ? searchParams.landLordFirstName[0] : searchParams.landLordFirstName;
      const landLordLastName = Array.isArray(searchParams.landLordLastName) ? searchParams.landLordLastName[0] : searchParams.landLordLastName;

      // Create a unique key for these params to prevent duplicate processing
      const paramsKey = `${propertyId}-${landlordId}-${propertyTitle}-${userId}`;
      
      // Skip if we've already processed these exact params
      if (!propertyId || !propertyTitle || !userId || 
          processedParams.current === paramsKey) {
        return;
      }

      // Mark these params as being processed
      processedParams.current = paramsKey;

      // Check if current user is the landlord (property owner)
      const isLandlord = userId === landlordId;
      
      if (isLandlord) {
        // Landlord accessing their own property - this shouldn't create a conversation
        // Don't set any suggested message, just show existing conversations
        // The landlord should see conversations where they are the landlord for this property
        return;
      }
      
      // Generate the conversation ID that would be used
      const conversationId = `${userId}#${propertyId}`;
      
      onConversationsReload?.().then(async (conversations) => {
        const existingConversation = conversations?.find(c => c.id === conversationId);
        
        if (existingConversation) {
          // Existing conversation found - clear any suggested message and just open it
          setSuggestedMessage('');
          
          // Select the existing conversation
          setTimeout(() => {
            onConversationCreated?.(conversationId);
          }, 100);
        } else {
          // No existing conversation - this is a NEW conversation
          // Build landlord name from URL params if available
          const landlordName = landLordFirstName && landLordLastName 
            ? `${landLordFirstName} ${landLordLastName}`
            : 'the landlord';
          
          // Set appropriate suggested message for tenant inquiries with property link
          const propertyUrl = `https://ndotoni.com/property/${propertyId}`; // Use production URL for React Native
          const suggested = `Hi ${landLordFirstName || ''}! I'm interested in your property "${propertyTitle}". Could you please provide more information about viewing arrangements?\n\nProperty link: ${propertyUrl}`;
          setSuggestedMessage(suggested);
          
          // Use landlordId from URL params (should always be provided now)
          const resolvedLandlordId = landlordId || 'unknown';
          
          // Create a temporary conversation object for the UI with landlord info
          const tempConversation = {
            id: conversationId,
            tenantId: userId,
            landlordId: resolvedLandlordId || 'unknown',
            propertyId,
            propertyTitle,
            lastMessage: '',
            lastMessageSender: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isTemporary: true, // Flag to indicate this is a temporary conversation
            // Add landlord info from URL params
            landlordInfo: landLordFirstName && landLordLastName ? {
              firstName: landLordFirstName,
              lastName: landLordLastName,
            } : undefined,
          };
          
          // Trigger the conversation selection with the temporary conversation
          setTimeout(() => {
            onConversationCreated?.(conversationId, tempConversation);
          }, 100);
        }
      });
    };

    if (userId) {
      handlePropertyContact();
    }
  }, [searchParams, userId, onConversationCreated, onConversationsReload]);

  return {
    suggestedMessage,
    getSuggestedMessage,
    clearSuggestedMessage,
    isLandlordAccessingOwnProperty,
    propertyTitle,
  };
}
