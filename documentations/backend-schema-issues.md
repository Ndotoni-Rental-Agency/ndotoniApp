# Backend Schema Issues

## Issue: listMyBookings Returns Null for Non-Nullable Fields

### Error Message
```
Cannot return null for non-nullable type: 'null' within parent 'BookingListResponse' (/listMyBookings/bookings)
Cannot return null for non-nullable type: 'Int' within parent 'BookingListResponse' (/listMyBookings/count)
```

### Root Cause
The GraphQL schema defines `BookingListResponse` with non-nullable fields:

```graphql
type BookingListResponse {
  bookings: [Booking]!  # Non-nullable array
  count: Int!           # Non-nullable integer
  nextToken: String
}
```

However, when a user has no bookings, the backend returns `null` instead of an empty array and `0`.

### Frontend Solution (Implemented)
The bookings screen now handles this gracefully:

```typescript
try {
  const response = await GraphQLClient.executeAuthenticated<any>(listMyBookings, {
    status: statusMap[selectedTab],
    limit: 50,
  });

  const bookingsList = response?.listMyBookings?.bookings;
  setBookings(Array.isArray(bookingsList) ? bookingsList : []);
} catch (error: any) {
  // Handle null response error
  if (error?.message?.includes('Cannot return null for non-nullable')) {
    console.log('[Bookings] No bookings found (null response from backend)');
    setBookings([]);
  }
}
```

### Backend Solution (Recommended)

#### Option 1: Fix the Resolver (Preferred)
Update the `listMyBookings` resolver to return empty values instead of null:

```typescript
// In your resolver
export const listMyBookings = async (event) => {
  // ... your logic
  
  const bookings = await fetchUserBookings(userId, status);
  
  return {
    bookings: bookings || [],  // Return empty array instead of null
    count: bookings?.length || 0,  // Return 0 instead of null
    nextToken: null
  };
};
```

#### Option 2: Make Fields Nullable
Update the GraphQL schema to allow null values:

```graphql
type BookingListResponse {
  bookings: [Booking]  # Nullable array
  count: Int           # Nullable integer
  nextToken: String
}
```

However, this is less ideal as it requires frontend code to handle null checks everywhere.

### Impact
- **User Experience**: ✅ No impact - frontend handles gracefully
- **Error Logs**: ⚠️ Errors logged but caught and handled
- **Functionality**: ✅ Works correctly - shows empty state

### Status
- Frontend: ✅ Fixed and deployed
- Backend: ⏳ Needs resolver update (recommended)

### Testing
To verify the fix works:

1. Sign in with a user who has no bookings
2. Navigate to Profile → My Bookings
3. Should see "No Bookings" message instead of error
4. Check console - error is caught and handled

### Related Files
- `app/bookings/index.tsx` - Frontend handling
- Backend resolver: `listMyBookings` (needs update)

### Priority
- **Frontend**: ✅ Complete
- **Backend**: Low priority (frontend handles it, but should be fixed for cleaner logs)

---

## Other Potential Schema Issues

### 1. Property Images/Videos
If a property has no images or videos, ensure empty arrays are returned:

```typescript
return {
  images: property.images || [],
  videos: property.videos || []
};
```

### 2. User Profile Fields
Ensure optional fields return null consistently:

```typescript
return {
  profileImage: user.profileImage || null,
  phoneNumber: user.phoneNumber || null
};
```

### 3. Pagination
Always return pagination fields even when empty:

```typescript
return {
  items: items || [],
  nextToken: nextToken || null,
  count: items?.length || 0
};
```

## Best Practices

### 1. Always Return Empty Collections
```typescript
// Good
return { items: [] };

// Bad
return { items: null };
```

### 2. Use Default Values
```typescript
const bookings = data?.bookings ?? [];
const count = data?.count ?? 0;
```

### 3. Validate Schema Matches Implementation
Ensure your resolvers always return data that matches the schema definition.

### 4. Test Edge Cases
- Empty results
- New users with no data
- Deleted/archived items

## Monitoring

Add logging to track these issues:

```typescript
if (!bookings || bookings.length === 0) {
  console.log('[Resolver] Returning empty bookings for user:', userId);
}
```

This helps identify if the issue is:
- No data in database (expected)
- Query error (needs investigation)
- Schema mismatch (needs fix)
