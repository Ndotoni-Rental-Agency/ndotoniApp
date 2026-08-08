/**
 * Chat real-time subscriptions
 *
 * Subscribes to conversation events via AppSync WebSocket, using Amplify's
 * generateClient().graphql(). Auth mode: apiKey (these subscriptions have
 * @aws_api_key, avoiding OIDC/Amplify auth complexity — see ChatContext.tsx
 * for how isMine/senderId-dependent fields get resolved client-side instead
 * of trusted from the server on this connection).
 */

import { useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { onNewMessage, onMessageUpdated, onTypingIndicator, onConversationRead } from '@/lib/graphql/subscriptions';

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
  replyToMessageId?: string | null;
  replyToContent?: string | null;
  replyToSenderName?: string | null;
  reactions?: Array<{ emoji: string; userIds: string[] }> | null;
  readAt?: string | null;
}

export interface SubscriptionTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface SubscriptionReadEvent {
  conversationId: string;
  readByUserId: string;
  readAt: string;
}

/**
 * Generic subscribe-while-mounted helper shared by all conversation-scoped
 * chat subscriptions below. Re-subscribes when conversationId/enabled change,
 * always cleans up the previous subscription first.
 */
function useConversationSubscription<T>(
  query: string,
  resultKey: string,
  conversationId: string | null,
  onEvent: (event: T) => void,
  enabled: boolean,
  logLabel: string
) {
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const onEventRef = useRef(onEvent);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!conversationId || !enabled) {
      return;
    }

    try {
      // client.graphql()'s overload resolution to the Observable-returning subscription
      // variant depends on the branded GeneratedSubscription<I, O> type of `query`, which
      // this generic helper erases to `string` — cast to keep that resolution explicit.
      const observable = client.graphql({
        query,
        variables: { conversationId },
        authMode: 'apiKey',
      }) as { subscribe: (handlers: { next: (value: any) => void; error: (error: any) => void }) => { unsubscribe: () => void } };

      const sub = observable.subscribe({
        next: ({ data }: any) => {
          const event = data?.[resultKey];
          if (event) {
            onEventRef.current(event as T);
          }
        },
        error: (error: any) => {
          console.error(`[${logLabel}] Subscription error:`, error);
          reconnectTimerRef.current = setTimeout(() => {
            console.log(`[${logLabel}] Would reconnect, but letting effect re-run handle it`);
          }, 5000);
        },
      });

      subscriptionRef.current = sub;
    } catch (error) {
      console.error(`[${logLabel}] Failed to create subscription:`, error);
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [query, resultKey, conversationId, enabled, logLabel]);
}

interface UseChatSubscriptionOptions {
  conversationId: string | null;
  onMessageReceived: (message: SubscriptionMessage) => void;
  enabled?: boolean;
}

/** New messages arriving in a conversation. */
export function useChatSubscription({ conversationId, onMessageReceived, enabled = true }: UseChatSubscriptionOptions) {
  useConversationSubscription<SubscriptionMessage>(
    onNewMessage, 'onNewMessage', conversationId, onMessageReceived, enabled, 'ChatSubscription'
  );
}

interface UseMessageUpdatedSubscriptionOptions {
  conversationId: string | null;
  onMessageUpdated: (message: SubscriptionMessage) => void;
  enabled?: boolean;
}

/** Updates to an existing message — currently just reactions. */
export function useMessageUpdatedSubscription({ conversationId, onMessageUpdated: onEvent, enabled = true }: UseMessageUpdatedSubscriptionOptions) {
  useConversationSubscription<SubscriptionMessage>(
    onMessageUpdated, 'onMessageUpdated', conversationId, onEvent, enabled, 'MessageUpdatedSubscription'
  );
}

interface UseTypingIndicatorSubscriptionOptions {
  conversationId: string | null;
  onTypingReceived: (event: SubscriptionTypingEvent) => void;
  enabled?: boolean;
}

/** Live "X is typing" events. Ephemeral — not persisted anywhere. */
export function useTypingIndicatorSubscription({ conversationId, onTypingReceived, enabled = true }: UseTypingIndicatorSubscriptionOptions) {
  useConversationSubscription<SubscriptionTypingEvent>(
    onTypingIndicator, 'onTypingIndicator', conversationId, onTypingReceived, enabled, 'TypingIndicatorSubscription'
  );
}

interface UseConversationReadSubscriptionOptions {
  conversationId: string | null;
  onConversationRead: (event: SubscriptionReadEvent) => void;
  enabled?: boolean;
}

/** Fires when the other participant reads the conversation, to live-update read ticks. */
export function useConversationReadSubscription({ conversationId, onConversationRead: onEvent, enabled = true }: UseConversationReadSubscriptionOptions) {
  useConversationSubscription<SubscriptionReadEvent>(
    onConversationRead, 'onConversationRead', conversationId, onEvent, enabled, 'ConversationReadSubscription'
  );
}
