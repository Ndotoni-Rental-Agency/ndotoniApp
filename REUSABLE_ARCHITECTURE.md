# Reusable Architecture

The mobile app now follows the same architecture patterns as ndotoniWeb with reusable hooks, utilities, and services.

## Structure

```
ndotoniApp/
├── hooks/
│   ├── useLocationSearch.ts      # Location search with caching
│   ├── useRentalType.ts          # Rental type state management
│   ├── use-color-scheme.ts       # Theme management
│   └── use-theme-color.ts        # Theme colors
├── lib/
│   ├── location/
│   │   ├── types.ts              # Location type definitions
│   │   └── location-service.ts   # Location fetching & caching
│   ├── utils/
│   │   └── common.ts             # Common utilities
│   ├── api.ts                    # API client
│   └── config.ts                 # App configuration
└── components/
    ├── search/
    │   ├── SearchBar.tsx         # Compact search display
    │   └── SearchModal.tsx       # Full search interface
    └── property/
        └── PropertyCard.tsx      # Property display card
```

## Reusable Hooks

### useLocationSearch
Fetches and searches locations with AsyncStorage caching (30 days).

```tsx
import { useLocationSearch } from '@/hooks/useLocationSearch';

const { results, isLoading, error } = useLocationSearch(searchQuery);
```

Features:
- Fetches from CloudFront
- Caches in AsyncStorage for 30 days
- Debounced search (200ms default)
- Returns regions and districts
- Fuzzy search support

### useRentalType
Manages rental type state (LONG_TERM or SHORT_TERM).

```tsx
import { useRentalType, RentalType } from '@/hooks/useRentalType';

const { 
  rentalType, 
  setRentalType, 
  isShortTerm, 
  isLongTerm,
  toggleRentalType 
} = useRentalType(RentalType.LONG_TERM);
```

## Reusable Services

### Location Service
Handles location data fetching and caching.

```tsx
import { 
  fetchLocations, 
  flattenLocations, 
  searchLocations,
  clearLocationCache,
  getCacheInfo
} from '@/lib/location/location-service';

// Fetch locations (with caching)
const data = await fetchLocations();

// Flatten for search
const flattened = flattenLocations(data);

// Search
const results = searchLocations(flattened, 'dar es salaam');

// Cache management
await clearLocationCache();
const info = await getCacheInfo();
```

## Common Utilities

### String Utilities
```tsx
import { toTitleCase, truncate } from '@/lib/utils/common';

toTitleCase('dar es salaam'); // "Dar Es Salaam"
truncate('Long text...', 20);  // "Long text..."
```

### Date Utilities
```tsx
import { 
  formatDate, 
  formatDateShort, 
  getMinDate,
  calculateNights 
} from '@/lib/utils/common';

formatDate('2024-03-15');      // "Mar 15, 2024"
formatDateShort('2024-03-15'); // "Mar 15"
getMinDate();                  // Today's date
calculateNights('2024-03-15', '2024-03-17'); // 2
```

### Currency Utilities
```tsx
import { formatCurrency } from '@/lib/utils/common';

formatCurrency(1000000); // "1,000,000"
```

### Other Utilities
```tsx
import { 
  debounce, 
  sleep, 
  safeJsonParse,
  generateId 
} from '@/lib/utils/common';

const debouncedFn = debounce(myFunction, 300);
await sleep(1000);
const data = safeJsonParse(jsonString, defaultValue);
const id = generateId();
```

## Type Definitions

### Location Types
```tsx
import type { 
  LocationData, 
  FlattenedLocation 
} from '@/lib/location/types';

interface LocationData {
  [regionName: string]: string[]; // region -> districts
}

interface FlattenedLocation {
  type: 'region' | 'district';
  name: string;
  regionName?: string;
  displayName: string;
}
```

### Rental Type
```tsx
import { RentalType } from '@/hooks/useRentalType';

enum RentalType {
  LONG_TERM = 'LONG_TERM',
  SHORT_TERM = 'SHORT_TERM',
}
```

## Installation

Install required dependencies:

```bash
cd ndotoniApp
npm install
```

New dependencies added:
- `@react-native-async-storage/async-storage` - For location caching
- `@react-native-community/datetimepicker` - For date selection

## Benefits

1. **Code Reusability**: Hooks and utilities can be used across components
2. **Consistency**: Same patterns as ndotoniWeb
3. **Performance**: Location data cached for 30 days
4. **Type Safety**: Full TypeScript support
5. **Maintainability**: Centralized logic in hooks and services
6. **Testability**: Isolated functions easy to test

## Usage Examples

### Search with Location and Dates
```tsx
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { RentalType } from '@/hooks/useRentalType';
import SearchModal from '@/components/search/SearchModal';

function MyComponent() {
  const [showSearch, setShowSearch] = useState(false);
  
  const handleSearch = (params) => {
    console.log('Location:', params.location?.displayName);
    console.log('Check-in:', params.checkInDate);
    console.log('Check-out:', params.checkOutDate);
  };
  
  return (
    <SearchModal
      visible={showSearch}
      onClose={() => setShowSearch(false)}
      rentalType={RentalType.SHORT_TERM}
      onSearch={handleSearch}
    />
  );
}
```

### Property Listing with Rental Type
```tsx
import { useRentalType, RentalType } from '@/hooks/useRentalType';
import PropertyCard from '@/components/property/PropertyCard';

function PropertyList() {
  const { rentalType, isShortTerm } = useRentalType();
  
  return (
    <PropertyCard
      propertyId={property.id}
      title={property.title}
      price={isShortTerm ? property.nightlyRate : property.monthlyRent}
      priceUnit={isShortTerm ? 'night' : 'month'}
    />
  );
}
```

## Next Steps

- Add more reusable hooks (useAuth, useProperties, etc.)
- Create shared UI components library
- Add unit tests for hooks and utilities
- Implement error boundary components
- Add analytics hooks
