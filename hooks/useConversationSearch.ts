import { useMemo } from 'react';
import { Conversation } from '@/lib/API';
import Fuse from 'fuse.js';

interface UseConversationSearchProps {
  conversations: Conversation[];
  searchQuery: string;
  currentUserId: string;
}

export function useConversationSearch({ 
  conversations, 
  searchQuery, 
}: UseConversationSearchProps) {

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    const options = {
      keys: [
        {
          name: 'propertyTitle',
          weight: 0.6
        },
        {
          name: 'lastMessage',
          weight: 0.4
        }
      ],
      threshold: 0.4, // Lower = more strict, Higher = more fuzzy
      distance: 100,
      minMatchCharLength: 1,
      includeScore: true,
      includeMatches: true
    };

    return new Fuse(conversations, options);
  }, [conversations]);

  // Filter conversations using fuzzy search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const results = fuse.search(searchQuery.trim());
    
    // Return the original conversations in the order found by Fuse
    return results.map(result => result.item);
  }, [conversations, searchQuery, fuse]);

  return {
    filteredConversations,
    isSearching: false, // No async operations needed
  };
}