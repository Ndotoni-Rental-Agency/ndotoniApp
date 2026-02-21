# Message Search Feature

## Overview
Implemented local search functionality for the messages screen, allowing users to quickly find conversations by searching for user names or property titles.

## Features

### Search Capabilities
Users can search conversations by:
1. **User Name** (50% weight) - Search by the other party's name
2. **Property Title** (40% weight) - Search by the property associated with the conversation
3. **Last Message** (10% weight) - Search within the last message content

### Search Behavior
- **Fuzzy Search**: Uses Fuse.js for intelligent fuzzy matching
- **Real-time**: Results update as you type
- **Case-insensitive**: Searches work regardless of letter casing
- **Minimum 2 characters**: Search activates after typing at least 2 characters
- **Threshold**: 0.3 (balanced between strict and fuzzy matching)

## Implementation

### Updated Files

#### 1. `hooks/useConversationSearch.ts`
Enhanced the existing search hook to include user name searching:

```typescript
keys: [
  {
    name: 'otherPartyName',  // NEW: Search by user name
    weight: 0.5
  },
  {
    name: 'propertyTitle',
    weight: 0.4
  },
  {
    name: 'lastMessage',
    weight: 0.1
  }
]
```

**Key Changes:**
- Added `otherPartyName` as a searchable field with highest weight
- Adjusted weights to prioritize name and property over message content
- Reduced threshold from 0.4 to 0.3 for more accurate results
- Increased minimum match length from 1 to 2 characters
- Made `currentUserId` optional (not currently used)

#### 2. `app/(tabs)/messages.tsx`
Integrated search functionality into the messages screen:

**New Features:**
- Search bar component with clear button
- Real-time filtering of conversations
- Empty state for no search results
- Search bar only shows when conversations exist

**UI Components:**
```typescript
// Search state
const [searchQuery, setSearchQuery] = useState('');

// Use search hook
const { filteredConversations } = useConversationSearch({
  conversations,
  searchQuery,
});

// Search bar UI
<View style={styles.searchBar}>
  <Ionicons name="search" size={20} />
  <TextInput
    placeholder="Search by name or property..."
    value={searchQuery}
    onChangeText={setSearchQuery}
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Ionicons name="close-circle" size={20} />
    </TouchableOpacity>
  )}
</View>
```

### Styling

**Search Bar:**
- Rounded corners (12px border radius)
- Subtle border matching theme
- Icon on left, clear button on right
- Proper spacing and padding
- Theme-aware colors (light/dark mode)

**Empty State:**
- Shows when search returns no results
- Helpful message: "Try searching with a different name or property"
- Search icon for visual context

## User Experience

### Search Flow
1. User opens Messages screen
2. If conversations exist, search bar appears below header
3. User types in search bar
4. Results filter in real-time
5. User can clear search with X button
6. Empty state shows if no matches found

### Search Examples
- "John" - Finds conversations with users named John
- "apartment" - Finds conversations about apartment properties
- "downtown" - Finds properties with "downtown" in the title
- "Smith" - Finds users with Smith in their name

### Performance
- **Local Search**: No API calls, instant results
- **Memoized**: Search index is cached and only rebuilt when conversations change
- **Efficient**: Fuse.js provides fast fuzzy matching even with many conversations

## Technical Details

### Fuse.js Configuration
```typescript
{
  threshold: 0.3,        // Balance between strict and fuzzy
  distance: 100,         // Maximum distance for matches
  minMatchCharLength: 2, // Minimum characters to match
  includeScore: true,    // Include match scores
  includeMatches: true   // Include match details
}
```

### Search Weights
- **otherPartyName**: 0.5 (50%) - Most important
- **propertyTitle**: 0.4 (40%) - Second priority
- **lastMessage**: 0.1 (10%) - Least important

This weighting ensures that searching for a person's name or property title gives the most relevant results.

## Future Enhancements

Potential improvements:
1. Search history/suggestions
2. Advanced filters (date range, unread only, etc.)
3. Highlight matching text in results
4. Search within message content (full conversation search)
5. Voice search capability
6. Recent searches quick access

## Testing

To test the search feature:
1. Navigate to Messages screen
2. Ensure you have multiple conversations
3. Type a user's name in the search bar
4. Verify conversations filter correctly
5. Type a property title
6. Verify property-based filtering works
7. Clear search and verify all conversations return
8. Test with partial matches (fuzzy search)
9. Test with no results scenario

## Dependencies

- **fuse.js**: Fuzzy search library (already installed)
- No additional dependencies required
