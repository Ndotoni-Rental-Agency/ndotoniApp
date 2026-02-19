# Map View and Complete Property Details - Implementation Plan

## Current Status
The property details pages show basic information but are missing several key sections that exist in the web app.

## Missing Sections

### Both Property Types Need:
1. **Map View** - Show property location on an interactive map
2. **Property Features** - Detailed breakdown (bedrooms, bathrooms, size, etc.)
3. **Complete Amenities List** - With icons and "Show all" functionality
4. **House Rules** - Detailed rules section
5. **Cancellation Policy** (short-term) / Lease Terms (long-term)
6. **Host/Landlord Information** - With contact options
7. **Reviews Section** - Display ratings and reviews
8. **Related Properties** - Similar properties section

## Implementation Steps

### Step 1: Install Required Packages
```bash
cd ndotoniApp
pnpm add react-native-maps
```

### Step 2: Create Map Component
Create `ndotoniApp/components/map/PropertyMapView.tsx`:
- Use `react-native-maps` MapView component
- Show property marker at coordinates
- Center map on property location
- Add zoom controls
- Handle missing coordinates gracefully

### Step 3: Update Short-Term Property Details
File: `ndotoniApp/app/short-property/[id].tsx`

Add sections in this order:
1. Image Gallery (✓ exists)
2. Title & Location (✓ exists)
3. Property Features (bedrooms, bathrooms, guests, etc.)
4. **Map View** (NEW)
5. Description (✓ exists)
6. Amenities (✓ exists - needs enhancement)
7. House Rules (✓ exists)
8. Cancellation Policy (NEW)
9. Host Information (✓ exists)
10. Reviews (NEW)
11. Related Properties (NEW)

### Step 4: Update Long-Term Property Details
File: `ndotoniApp/app/property/[id].tsx`

Add sections in this order:
1. Image Gallery (✓ exists)
2. Title & Location (✓ exists)
3. Property Features (bedrooms, bathrooms, size, etc.)
4. **Map View** (NEW)
5. Description (✓ exists)
6. Amenities (✓ exists - needs enhancement)
7. Lease Terms (NEW)
8. House Rules (✓ exists)
9. Landlord Information (✓ exists)
10. Reviews (NEW)
11. Related Properties (NEW)

## Map View Implementation Details

### Component Structure
```typescript
interface PropertyMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export default function PropertyMapView({
  latitude,
  longitude,
  title
}: PropertyMapViewProps) {
  // Implementation
}
```

### Features:
- Show marker at property location
- Center map with appropriate zoom level
- Show "Approximate location" disclaimer
- Handle dark mode
- Responsive height (280px like web app)
- Rounded corners with border

### Coordinates Extraction:
```typescript
// Short-term properties
const coords = property?.coordinates 
  ? { lat: property.coordinates.latitude, lng: property.coordinates.longitude }
  : null;

// Long-term properties  
const coords = property?.address?.coordinates
  ? { lat: property.address.coordinates.latitude, lng: property.address.coordinates.longitude }
  : null;
```

## Property Features Section

### Short-Term Features:
- Maximum Guests
- Bedrooms
- Bathrooms
- Minimum Stay
- Maximum Stay
- Check-in Time
- Check-out Time
- Instant Book Available

### Long-Term Features:
- Bedrooms
- Bathrooms
- Square Footage
- Property Type
- Furnished/Unfurnished
- Parking Spaces
- Floor Number
- Year Built

## Enhanced Amenities Section

### Current Issues:
- Shows only first 6 amenities
- "Show all" button doesn't work
- No icons for amenities

### Improvements Needed:
- Add icons for common amenities (WiFi, Kitchen, etc.)
- Implement modal for "Show all amenities"
- Group amenities by category
- Better visual presentation

## Reviews Section

### Display:
- Overall rating with stars
- Rating breakdown (Cleanliness, Communication, etc.)
- Individual reviews with:
  - Reviewer name and avatar
  - Rating
  - Date
  - Review text
  - Host response (if any)

## Related Properties Section

### Types:
1. More from this host/landlord
2. Similar properties in the area
3. Similar price range

### Display:
- Horizontal scrollable list
- Use PropertyCard component
- "View all" button

## Cancellation Policy / Lease Terms

### Short-Term:
- Flexible / Moderate / Strict policy
- Refund details
- Cancellation deadlines

### Long-Term:
- Lease duration
- Security deposit
- Move-in costs
- Renewal terms

## Next Steps

1. Install react-native-maps
2. Create PropertyMapView component
3. Add map section to both property details pages
4. Enhance existing sections with missing data
5. Add new sections (reviews, related properties, etc.)
6. Test on both iOS and Android
7. Ensure dark mode works for all new sections

## Files to Create/Modify

### New Files:
- `ndotoniApp/components/map/PropertyMapView.tsx`
- `ndotoniApp/components/property/PropertyFeatures.tsx`
- `ndotoniApp/components/property/ReviewsList.tsx`
- `ndotoniApp/components/property/RelatedProperties.tsx`
- `ndotoniApp/components/property/AmenitiesModal.tsx`

### Files to Modify:
- `ndotoniApp/app/short-property/[id].tsx`
- `ndotoniApp/app/property/[id].tsx`
- `ndotoniApp/package.json` (add react-native-maps)

## Testing Checklist

- [ ] Map displays correctly with property marker
- [ ] Map centers on property location
- [ ] All property features display correctly
- [ ] Amenities modal shows all amenities
- [ ] Reviews section displays properly
- [ ] Related properties load and navigate correctly
- [ ] Dark mode works for all sections
- [ ] Scrolling is smooth
- [ ] Images in gallery work
- [ ] All buttons are functional
- [ ] Back navigation works
- [ ] Booking/Apply buttons work
