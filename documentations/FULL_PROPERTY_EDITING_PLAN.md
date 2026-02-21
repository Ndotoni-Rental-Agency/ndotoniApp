# Full Property Editing Implementation Plan

## Overview
Implement comprehensive property editing for both long-term and short-term properties, covering all fields from the Property and ShortTermProperty types.

## Long-Term Property Fields (Property Type)

### Basic Information
- ✅ title
- ✅ description
- ✅ propertyType (APARTMENT, COMMERCIAL, HOUSE, LAND, ROOM, STUDIO)
- ✅ status (AVAILABLE, DRAFT, MAINTENANCE, RENTED, DELETED)

### Address
- ✅ region
- ✅ district
- ✅ ward
- ✅ street
- ❌ postalCode
- ❌ coordinates (latitude, longitude)

### Pricing
- ✅ monthlyRent
- ❌ currency
- ❌ deposit
- ❌ serviceCharge
- ❌ utilitiesIncluded

### Specifications
- ✅ bedrooms
- ✅ bathrooms
- ❌ squareMeters
- ❌ floors
- ❌ parkingSpaces
- ❌ furnished

### Availability
- ✅ available
- ❌ availableFrom (date)
- ❌ minimumLeaseTerm (months)
- ❌ maximumLeaseTerm (months)

### Media
- ✅ images
- ✅ videos
- ❌ floorPlan
- ❌ virtualTour

### Amenities
- ❌ amenities (array of strings)

### Agent/Landlord
- ❌ landlord info (firstName, lastName, whatsappNumber)
- ❌ agent info (firstName, lastName, whatsappNumber)

## Short-Term Property Fields (ShortTermProperty Type)

### Basic Information
- ✅ title
- ✅ description
- ✅ propertyType (APARTMENT, BUNGALOW, COTTAGE, GUESTHOUSE, HOSTEL, HOTEL, HOUSE, RESORT, ROOM, STUDIO, VILLA)
- ❌ status

### Location
- ❌ region
- ❌ district
- ❌ address (city, country, district, region, street, postalCode)
- ❌ coordinates (latitude, longitude)

### Pricing
- ✅ nightlyRate
- ❌ currency
- ✅ cleaningFee
- ❌ serviceFeePercentage
- ❌ taxPercentage

### Guest Capacity
- ✅ maxGuests
- ❌ maxAdults
- ❌ maxChildren
- ❌ maxInfants

### Booking Rules
- ✅ minimumStay
- ❌ maximumStay
- ❌ advanceBookingDays
- ✅ instantBookEnabled

### Check-in/Check-out
- ❌ checkInTime
- ❌ checkOutTime
- ❌ checkInInstructions

### Policies
- ❌ cancellationPolicy (FLEXIBLE, MODERATE, STRICT)
- ❌ allowsPets
- ❌ allowsSmoking
- ❌ allowsChildren
- ❌ allowsInfants

### Media
- ✅ images
- ❌ thumbnail
- ❌ videos

### Amenities & Rules
- ❌ amenities (array)
- ❌ houseRules (array)

### Host Information
- ❌ host (firstName, lastName, whatsappNumber)

## Implementation Strategy

### Phase 1: Enhanced Form Components
Create reusable form components for:
1. Multi-select amenities picker
2. Time picker (check-in/check-out times)
3. Date picker (available from date)
4. Coordinate picker (map integration)
5. Policy selector (cancellation, house rules)
6. Currency selector
7. Property type picker with icons

### Phase 2: Long-Term Property Editing
Expand `app/landlord/property/[id].tsx` to include:
1. All address fields including coordinates
2. Complete pricing section (deposit, service charge, utilities)
3. Full specifications (square meters, floors, parking, furnished)
4. Availability settings (dates, lease terms)
5. All media types (floor plan, virtual tour)
6. Amenities multi-select
7. Landlord/agent contact information

### Phase 3: Short-Term Property Editing
Expand `app/landlord/short-property/[id].tsx` to include:
1. Complete address with coordinates
2. Full pricing (taxes, service fees)
3. Detailed guest capacity (adults, children, infants)
4. Booking rules (max stay, advance booking)
5. Check-in/out times and instructions
6. All policies (cancellation, pets, smoking, children)
7. Amenities and house rules
8. Host information

### Phase 4: Update Mutations
Create/update GraphQL mutations for:
1. `updateProperty` - for long-term properties
2. `updateShortTermProperty` - for short-term properties
3. Include all new fields in mutation inputs

### Phase 5: Validation & Error Handling
1. Form validation for required fields
2. Data type validation (numbers, dates, etc.)
3. Business logic validation (min < max, etc.)
4. Error messages and user feedback
5. Unsaved changes warning

## UI/UX Considerations

### Sectioned Layout
Group related fields into collapsible sections:
- Basic Information
- Location & Address
- Pricing & Fees
- Property Details
- Availability & Booking
- Policies & Rules
- Media & Photos
- Contact Information

### Progressive Disclosure
- Show basic fields first
- Advanced options in expandable sections
- Context-sensitive help text
- Field dependencies (e.g., show infant fields only if allows infants)

### Mobile-Friendly
- Large touch targets
- Appropriate keyboard types
- Scroll-to-error on validation
- Save progress indicators
- Offline draft support

## Next Steps

1. Create reusable form components
2. Implement comprehensive long-term property editing
3. Implement comprehensive short-term property editing
4. Add GraphQL mutations
5. Add validation and error handling
6. Test thoroughly on both platforms
7. Document new features

## Estimated Effort
- Form Components: 2-3 days
- Long-Term Editing: 2-3 days
- Short-Term Editing: 2-3 days
- Mutations & Backend: 1-2 days
- Testing & Polish: 1-2 days
- **Total: 8-13 days**
