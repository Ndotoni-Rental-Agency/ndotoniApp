/**
 * useChatSubscription
 *
 * Subscribes to real-time messages for a given conversation via AppSync WebSocket.
 * Uses Amplify's generateClient().graphql() which handles the WebSocket protocol.
 * Auth mode: apiKey (subscription has @aws_api_key, avoids OIDC/Amplify auth complexity).
 */

import { useEffect, useRef, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { onNewMessage } from '@/lib/graphql/subscriptions';
import { ChatMessage } from '@/lib/API';

// Ensure Amplify is configured before using the client
import '@/lib/amplify';

const client = generateClient();

export interface SubscriptionMessage {
  id: string;
  conversationId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isMine: boolean;
  senderId?: string | null;
}

interface UseChatSubscriptionOptions {
  /** The conversation ID to subscribe to */
  conversationId: string | null;
  /** Called when a new message arrives via subscription */
  onMessageReceived: (message: SubscriptionMessage) => void;
  /** Whether the subscription should be active */
  enabled?: boolean;
}

/**
 * Hook that subscribes to real-time messages for a conversation.
 * Automatically connects/disconnects based on conversationId and enabled state.
 */
export function useChatSubscription({
  conversationId,
  onMessageReceived,
  enabled = true,
}: UseChatSubscriptionOptions) {
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

  // Keep the callback ref current without re-subscribing
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const subscribe = useCallback(() => {
    if (!conversationId || !enabled) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    console.log('[ChatSubscription] Subscribing to conversation:', conversationId);

    try {
      const sub = client.graphql({
        query: onNewMessage,
        variables: { conversationId },
        authMode: 'apiKey',
      }).subscribe({
        next: ({ data }: any) => {
          const message = data?.onNewMessage;
          if (message) {
            console.log('[ChatSubscription] New message received:', {
              id: message.id,
              senderName: message.senderName,
              isMine: message.isMine,
              contentPreview: message.content?.substring(0, 30),
            });
            onMessageReceivedRef.current(message as SubscriptionMessage);
          }
        },
        error: (error: any) => {
          console.error('[ChatSubscription] Subscription error:', error);
          // Attempt to reconnect after a delay
          setTimeout(() => {
            console.log('[ChatSubscription] Attempting reconnection...');
            subscribe();
          }, 3000);
        },
      });

      subscriptionRef.current = sub;
    } catch (error) {
      console.error('[ChatSubscription] Failed to create subscription:', error);
    }
  }, [conversationId, enabled]);

  // Subscribe when conversationId or enabled changes
  useEffect(() => {
    subscribe();

    return () => {
      if (subscriptionRef.current) {
        console.log('[ChatSubscription] Unsubscribing from conversation:', conversationId);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [subscribe]);
}
