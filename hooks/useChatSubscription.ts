/**
 * useChatSubscription
 *
 * Subscribes to real-time messages for a given conversation via AppSync WebSocket.
 * Uses Amplify's generateClient().graphql() which handles the WebSocket protocol.
 * Auth mode: apiKey (subscription has @aws_api_key, avoids OIDC/Amplify auth complexity).
 */

import { useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { onNewMessage } from '@/lib/graphql/subscriptions';

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
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the callback ref current without re-subscribing
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // Main subscription effect — only depends on conversationId and enabled
  useEffect(() => {
    // Clear any pending reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Clean up previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!conversationId || !enabled) {
      return;
    }

    console.log('[ChatSubscription] Subscribing to conversation:', conversationId);

    try {
      const observable = client.graphql({
        query: onNewMessage,
        variables: { conversationId },
        authMode: 'apiKey',
      });

      const sub = observable.subscribe({
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
          // Attempt to reconnect after a delay (only if still mounted)
          reconnectTimerRef.current = setTimeout(() => {
            console.log('[ChatSubscription] Would reconnect, but letting effect re-run handle it');
          }, 5000);
        },
      });

      subscriptionRef.current = sub;
      console.log('[ChatSubscription] Successfully subscribed');
    } catch (error) {
      console.error('[ChatSubscription] Failed to create subscription:', error);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (subscriptionRef.current) {
        console.log('[ChatSubscription] Unsubscribing from conversation:', conversationId);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [conversationId, enabled]);
}
