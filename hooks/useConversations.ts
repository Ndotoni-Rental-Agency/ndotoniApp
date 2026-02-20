import { useState, useEffect } from 'react';
import { Conversation } from '@/lib/API';
import { getUserConversations } from '@/lib/graphql/queries';
import { GraphQLClient } from '@/lib/graphql-client';

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useConversations(enabled: boolean = true): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!enabled) {
      console.log('[useConversations] ⏸️  Feature disabled, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useConversations] 🔄 Fetching conversations...');

      const response = await GraphQLClient.executeAuthenticated<{
        getUserConversations: Conversation[];
      }>(getUserConversations);

      console.log('[useConversations] ✅ Response received:', {
        conversationsLength: response.getUserConversations?.length || 0,
      });

      setConversations(response.getUserConversations || []);
      
      console.log('[useConversations] ✅ State updated with', 
        response.getUserConversations?.length || 0, 
        'conversations'
      );
    } catch (err: any) {
      console.error('[useConversations] ❌ Error fetching conversations:', err);
      console.error('[useConversations] Error details:', {
        message: err instanceof Error ? err.message : String(err),
        name: err?.name,
      });
      
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
      console.log('[useConversations] 🏁 Fetch complete');
    }
  };

  useEffect(() => {
    if (!enabled) {
      console.log('[useConversations] ⏸️  Feature disabled, skipping initial fetch');
      return;
    }
    console.log('[useConversations] 🚀 Hook mounted, starting fetch...');
    fetchConversations();
  }, [enabled]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  };
}
