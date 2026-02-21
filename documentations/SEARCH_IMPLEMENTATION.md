# Search Bar Implementation

The search bar has been updated to be adaptive based on rental type (Monthly/Nightly) with full location selection and date picker functionality.

## Features

### Adaptive Search Bar
- Shows different fields based on rental type:
  - **Monthly (Long-term)**: Location + Move-in date (optional)
  - **Nightly (Short-term)**: Location + Check-in/Check-out dates

### Location Selection
- Fetches real location data from CloudFront
- Supports both regions and districts
- Fuzzy search with real-time filtering
- Shows location type (Region/District)

### Date Pickers
- Native date pickers for iOS and Android
- Minimum date validation (today)
- Check-out date must be after check-in
- Date range display in search bar

## Installation

Install the required date picker package:

```bash
cd ndotoniApp
npm install
```

The `@react-native-community/datetimepicker` package has been added to package.json.

## Usage

The search bar automatically adapts to the selected rental type:

```tsx
<SearchBar 
  onPress={() => setShowSearchModal(true)} 
  rentalType={rentalType}
  selectedLocation={searchParams.location?.displayName}
  checkInDate={searchParams.checkInDate}
  checkOutDate={searchParams.checkOutDate}
  moveInDate={searchParams.moveInDate}
/>

<SearchModal
  visible={showSearchModal}
  onClose={() => setShowSearchModal(false)}
  rentalType={rentalType}
  onSearch={handleSearch}
/>
```

## Components

### SearchBar
- Compact display of search criteria
- Shows selected location and dates
- Opens SearchModal on press

### SearchModal
- Full-screen modal with tabs (Where, When/Move-in)
- Location search with real-time filtering
- Native date pickers
- Clear all and Search actions

## Data Flow

1. User taps search bar → Opens SearchModal
2. User selects location from list
3. User selects dates (check-in/out or move-in)
4. User taps Search → Returns SearchParams
5. SearchParams include:
   - `location`: Selected location object
   - `checkInDate`: ISO date string (short-term)
   - `checkOutDate`: ISO date string (short-term)
   - `moveInDate`: ISO date string (long-term)

## Next Steps

- Implement search results page
- Add navigation to search results with params
- Add filters (price, bedrooms, etc.)
- Add recent searches
- Add location autocomplete improvements
