# Map-Based Coordinates Picker Implementation

## Overview
Replaced the manual text-input coordinates picker with an interactive map-based picker that allows users to drag a pin to set property location. The system automatically geocodes the address (region, district, ward) to provide an initial location using Google's Geocoding API.

## New Component: MapCoordinatesPicker

### Location
`components/property/MapCoordinatesPicker.tsx`

### Features

#### 1. Interactive Map
- Full Google Maps integration with draggable marker
- Pan, zoom, and scroll enabled for easy navigation
- Visual feedback with coordinate display overlay
- 280px height for comfortable interaction

#### 2. Automatic Geocoding
- Automatically calculates initial coordinates from address fields
- Uses region, district, and optionally ward to geocode
- Powered by Google Geocoding API (accurate and reliable)
- Fallback to Tanzania center (-6.369028, 34.888822) if geocoding fails

#### 3. Current Location Support
- Uses device GPS to get current location
- Requests location permissions automatically
- Zooms to current location when selected
- Useful for landlords listing properties at their current location

#### 4. User-Friendly Interface
- Collapsible design to save screen space
- Shows current coordinates in header when set
- Loading indicator during geocoding and location fetching
- Clear visual instructions

#### 5. Multiple Input Methods
- **Drag Pin**: Primary method - drag marker to exact location
- **Current Location**: Use device GPS to set location
- **Clear**: Remove coordinates completely
- **Save**: Confirm and save selected location

### Props
```typescript
interface MapCoordinatesPickerProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
  region?: string;      // Used for geocoding
  district?: string;    // Used for geocoding
  ward?: string;        // Used for geocoding (optional)
}
```

### Geocoding Logic

#### Address Building
1. Combines ward (optional), district, region, and "Tanzania"
2. Example: "Kinondoni, Dar es Salaam, Tanzania"

#### API Used
- **Service**: Google Geocoding API
- **Endpoint**: `https://maps.googleapis.com/maps/api/geocode/json`
- **API Key**: Configured in `config/maps.ts`
- **Format**: JSON
- **Accuracy**: High (Google's comprehensive database)

#### Fallback Strategy
1. If geocoding succeeds → Use returned coordinates
2. If geocoding fails → Use Tanzania center coordinates
3. If user has existing coordinates → Use those as initial position

### UI Components

#### Header (Collapsed State)
- Map icon
- Current coordinates or "Set location on map (optional)"
- Chevron indicator

#### Expanded State
- Helper text explaining drag functionality
- Loading indicator during geocoding
- Interactive map with draggable marker
- Coordinate display overlay (shows current pin position)
- Action buttons: Current Location, Clear, Save

### Styling
- Consistent with app theme (light/dark mode support)
- Rounded corners (12px border radius)
- Proper spacing and padding
- Shadow effects for coordinate display overlay
- Responsive button layout

## Configuration

### Maps Config File
`config/maps.ts`

Contains centralized configuration for all map-related features:

```typescript
export const MAPS_CONFIG = {
  // Google Maps API Key
  GOOGLE_API_KEY: 'AIzaSyAA79IOdXt_LrssAhIYer_ZQQHNeD8Xogs',
  
  // Default map settings
  DEFAULT_REGION: {
    latitude: -6.369028,
    longitude: 34.888822,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  
  // Tanzania center coordinates (fallback)
  TANZANIA_CENTER: {
    latitude: -6.369028,
    longitude: 34.888822,
  },
};
```

### Security Note
- API key is currently in source code for development
- For production, move to environment variables
- Consider implementing API key restrictions in Google Cloud Console
- Restrict to specific domains/apps for security

## Integration

### LocationSection Component Updated
`components/property/sections/LocationSection.tsx`

#### Changes Made
1. Replaced `CoordinatesPicker` import with `MapCoordinatesPicker`
2. Passed address fields (region, district, ward) to enable geocoding
3. Maintained same props interface for backward compatibility

#### Usage in LocationSection
```typescript
<MapCoordinatesPicker
  value={formData.coordinates}
  onChange={(coords) => onUpdate('coordinates', coords)}
  region={formData.region}
  district={formData.district}
  ward={formData.ward}
/>
```

## Files Modified
1. `components/property/MapCoordinatesPicker.tsx` - New component
2. `components/property/sections/LocationSection.tsx` - Updated to use new picker
3. `config/maps.ts` - New configuration file for API keys
4. Both property edit pages automatically benefit from this change

## Benefits

### For Users
1. **Visual Selection**: See exactly where the property is located
2. **Accurate Placement**: Drag pin to precise location
3. **Automatic Initial Position**: No need to look up coordinates manually
4. **Familiar Interface**: Standard map interaction patterns

### For Developers
1. **Reusable Component**: Can be used anywhere coordinates are needed
2. **Free Geocoding**: No API key required (Nominatim)
3. **Fallback Handling**: Graceful degradation if geocoding fails
4. **Type Safe**: Full TypeScript support

## Technical Details

### Dependencies
- `react-native-maps`: Map display and marker interaction
- `@expo/vector-icons`: Icons for UI elements
- `expo-location`: Device GPS location access
- Google Geocoding API: Address to coordinates conversion
- Google Maps API: Map display

### Map Configuration
- Provider: Google Maps
- Initial zoom: 0.05 delta (approximately 5km view)
- Pitch: Disabled (2D view only)
- Rotation: Disabled (north always up)
- Scroll/Zoom: Enabled

### Coordinate Precision
- Display: 6 decimal places
- Storage: Full precision (double)
- Accuracy: ~0.11 meters at 6 decimal places

## Future Enhancements

### Planned Features
1. ✅ **Current Location**: Implemented with expo-location
2. **Search**: Add address search within map
3. **Satellite View**: Toggle between map and satellite imagery
4. **Nearby Places**: Show landmarks for reference
5. **Distance Measurement**: Show distance from city center

### Potential Improvements
1. Cache geocoding results to reduce API calls
2. Add reverse geocoding (coordinates → address)
3. Support for multiple map providers
4. Offline map support
5. Custom marker icons
6. Move API key to environment variables

## Testing Recommendations

### Manual Testing
1. Test with various address combinations (region only, region+district, full address)
2. Verify geocoding works for different Tanzania regions
3. Test drag functionality on both iOS and Android
4. Verify fallback behavior when geocoding fails
5. Test save/clear/cancel actions
6. Check coordinate display accuracy
7. Test current location feature with location permissions
8. Verify location permission denial handling

### Edge Cases
1. No address provided (should show Tanzania center)
2. Invalid address (should fallback gracefully)
3. Network failure during geocoding
4. Rapid expand/collapse actions
5. Marker dragged outside Tanzania
6. Location permission denied
7. GPS unavailable or disabled
8. Slow GPS response

## API Usage & Costs

### Google Maps Platform
- **Geocoding API**: $5 per 1000 requests (after free tier)
- **Maps SDK**: $7 per 1000 loads (after free tier)
- **Free Tier**: $200 monthly credit (covers ~40,000 geocoding requests)

### Cost Optimization
1. Cache geocoding results for same addresses
2. Implement request throttling
3. Only geocode when address changes
4. Consider batch geocoding for bulk operations
5. Monitor usage in Google Cloud Console

### API Key Security
- Restrict API key to specific apps/domains
- Enable only required APIs (Geocoding, Maps)
- Set usage quotas to prevent abuse
- Monitor for unusual activity
- Rotate keys periodically

## Migration Notes

### From CoordinatesPicker
- No breaking changes for existing code
- Existing coordinates are preserved
- Same props interface maintained
- Automatic upgrade path

### Data Compatibility
- Coordinates format unchanged: `{ latitude: number, longitude: number }`
- Existing property data works without migration
- New properties benefit from geocoding automatically

## Status
✅ Component created and integrated
✅ Geocoding implemented with Google API
✅ Current location feature implemented
✅ LocationSection updated
✅ Both property edit pages updated automatically
✅ TypeScript types defined
✅ No diagnostics errors
✅ expo-location installed
✅ Maps config file created
⏳ Address search feature (planned)
⏳ Satellite view toggle (planned)
