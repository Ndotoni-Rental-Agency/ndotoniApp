# ndotoni Mobile App Setup

A React Native mobile application for the ndotoni property rental platform, built with Expo.

## Features Implemented

### Home Screen
- Rental type toggle (Monthly/Nightly) matching the web app
- Hero section with search functionality
- Property categories (Nearby, Lowest Price, Most Viewed, Featured)
- Property listings with cards showing:
  - Property images
  - Title and location
  - Bedrooms and bathrooms
  - Price (monthly or nightly based on rental type)

### Explore Screen
- Advanced search with location input
- Popular regions grid
- Property type filters (Apartment, House, Studio, Villa)
- Filter options:
  - Price range
  - Bedrooms
  - Bathrooms
  - More filters

### Favorites Screen
- Saved properties list
- Quick access to favorited properties
- Heart icon to remove from favorites

### Profile Screen
- User profile information
- Menu items:
  - My Properties (with badge count)
  - My Bookings
  - Messages (with unread count)
  - Settings
  - Help & Support
- Sign out functionality
- App version display

## Design

The mobile app follows the same design principles as the web app:
- Emerald color scheme (#059669 for light mode, #10b981 for dark mode)
- Clean, modern UI with rounded corners
- Shadow effects for depth
- Consistent spacing and typography
- Dark mode support

## Tech Stack

- React Native 0.81.5
- Expo ~54.0.33
- Expo Router for navigation
- TypeScript
- React Navigation for tabs
- Ionicons for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
ndotoniApp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Home screen
│   │   ├── explore.tsx     # Search/Explore screen
│   │   ├── favorites.tsx   # Favorites screen
│   │   ├── profile.tsx     # Profile screen
│   │   └── _layout.tsx     # Tab navigation layout
│   ├── _layout.tsx         # Root layout
│   └── modal.tsx           # Modal screen
├── components/             # Reusable components
├── constants/
│   └── theme.ts           # Color scheme and fonts
├── hooks/                 # Custom hooks
└── assets/               # Images and other assets
```

## Next Steps

To fully integrate with the web app backend:

1. Add GraphQL client configuration
2. Implement authentication (AWS Cognito)
3. Connect to property APIs
4. Add real property data
5. Implement booking flow
6. Add chat/messaging
7. Implement payment integration (M-Pesa)
8. Add property creation/management for landlords
9. Implement push notifications
10. Add image upload and gallery

## Notes

This is the initial setup with UI components. Backend integration and API calls need to be added to match the web app's functionality.
