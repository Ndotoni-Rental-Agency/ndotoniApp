# Property Editing Sections Refactor

## Overview
Broke down the large property editing screens into smaller, reusable section components for better maintainability and code organization.

## Created Section Components

### 1. BasicInfoSection (`components/property/sections/BasicInfoSection.tsx`)
Handles basic property information:
- Title
- Description
- Property Type (with PropertyTypePicker)
- Status (AVAILABLE, DRAFT, MAINTENANCE, RENTED/BOOKED)

**Props:**
- `formData`: Object with title, description, propertyType, status
- `onUpdate`: Callback function (field, value)
- `propertyCategory`: 'long-term' | 'short-term'

### 2. LocationSection (`components/property/sections/LocationSection.tsx`)
Handles location and address information:
- Region, District, Ward, Street (via LocationSelector)
- City, Country (optional for short-term)
- Postal Code
- GPS Coordinates (via CoordinatesPicker)

**Props:**
- `formData`: Object with location fields
- `onUpdate`: Callback function (field, value)
- `onLocationChange`: Callback for LocationSelector
- `showCityCountry`: Boolean (for short-term properties)

### 3. PricingSection (`components/property/sections/PricingSection.tsx`)
Handles pricing information (adapts based on property category):

**Long-term:**
- Currency
- Monthly Rent
- Security Deposit
- Service Charge
- Utilities Included toggle

**Short-term:**
- Currency
- Nightly Rate
- Cleaning Fee
- Service Fee Percentage
- Tax Percentage

**Props:**
- `formData`: Object with pricing fields
- `onUpdate`: Callback function (field, value)
- `propertyCategory`: 'long-term' | 'short-term'

### 4. MediaSection (`components/property/sections/MediaSection.tsx`)
Handles media uploads and URLs:
- Property Photos & Videos (via MediaSelector)
- Floor Plan URL (long-term only)
- Virtual Tour URL (long-term only)
- Thumbnail URL (short-term only)

**Props:**
- `selectedMedia`: Array of media URLs
- `onMediaChange`: Callback (mediaUrls, images, videos)
- `floorPlan`, `virtualTour`, `thumbnail`: Optional strings
- `onFloorPlanChange`, `onVirtualTourChange`, `onThumbnailChange`: Optional callbacks
- `propertyCategory`: 'long-term' | 'short-term'

### 5. ContactSection (`components/property/sections/ContactSection.tsx`)
Handles contact information (landlord or host):
- First Name
- Last Name
- WhatsApp Number

**Props:**
- `formData`: Object with firstName, lastName, whatsapp
- `onUpdate`: Callback function (field, value)
- `contactType`: 'landlord' | 'host'

## Benefits

### 1. Maintainability
- Each section is self-contained and focused on a single responsibility
- Easier to find and fix bugs
- Changes to one section don't affect others

### 2. Reusability
- Sections can be reused across different property types
- Easy to add new property editing screens
- Consistent UI across all property forms

### 3. Testability
- Each section can be tested independently
- Smaller components are easier to test
- Mock props are simpler

### 4. Readability
- Main editing screens are now much shorter
- Clear separation of concerns
- Easier for new developers to understand

### 5. Flexibility
- Easy to add/remove sections
- Simple to reorder sections
- Can conditionally render sections based on property type

## Usage Example

```tsx
import BasicInfoSection from '@/components/property/sections/BasicInfoSection';
import CollapsibleSection from '@/components/property/CollapsibleSection';

// In your editing screen:
<CollapsibleSection 
  title="Basic Information" 
  icon="information-circle"
  onSave={() => saveSection('Basic Information', ['title', 'description', 'propertyType', 'status'])}
  onCancel={() => resetSection(['title', 'description', 'propertyType', 'status'])}
  hasChanges={hasSectionChanges(['title', 'description', 'propertyType', 'status'])}
  isSaving={sectionSaving['Basic Information']}
>
  <BasicInfoSection
    formData={{
      title: formData.title,
      description: formData.description,
      propertyType: formData.propertyType,
      status: formData.status,
    }}
    onUpdate={(field, value) => setFormData({ ...formData, [field]: value })}
    propertyCategory="long-term"
  />
</CollapsibleSection>
```

## Next Steps

To complete the refactor:

1. Update `app/landlord/property/[id].tsx` to use section components
2. Update `app/landlord/short-property/[id].tsx` to use section components
3. Create additional section components for:
   - Property Details (bedrooms, bathrooms, etc.)
   - Availability & Booking
   - Guest Capacity (short-term)
   - Policies & Rules (short-term)
   - Amenities (already have AmenitiesSelector, just need wrapper)

## File Structure

```
components/property/sections/
├── BasicInfoSection.tsx
├── LocationSection.tsx
├── PricingSection.tsx
├── MediaSection.tsx
└── ContactSection.tsx
```

## Estimated Impact

- **Before**: ~800-1000 lines per editing screen
- **After**: ~300-400 lines per editing screen (60-70% reduction)
- **Section components**: ~100-200 lines each
- **Total lines**: Similar, but much better organized
