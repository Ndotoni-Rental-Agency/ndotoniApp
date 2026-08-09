# Architecture

## Tech stack

- **Expo SDK 54**, **React Native 0.81.5**, **React 19.1**, new architecture enabled,
  React Compiler enabled.
- **Expo Router ~6** — file-based routing under `app/`, typed routes enabled.
- **Auth**: hybrid AWS Amplify (email/password) + hand-rolled OIDC (social sign-in) — see
  [auth.md](./auth.md).
- **Data**: custom `fetch()`-based `GraphQLClient` for queries/mutations, Amplify's
  `generateClient()` for subscriptions — see [graphql-and-codegen.md](./graphql-and-codegen.md).
- **Maps**: `react-native-maps` — Apple Maps by default on iOS, Google Maps
  (`PROVIDER_GOOGLE`) on Android.
- **Push**: Expo push notification service (not raw FCM/APNs integration) — see
  [push-notifications.md](./push-notifications.md).
- **State**: no Redux/Zustand — plain React Context (`AuthContext`, `ChatContext`,
  `AlertContext`, `AuthPromptContext`, `LanguageContext`, `PushNotificationContext`,
  `ThemeContext`) plus `AsyncStorage`-backed caches (`lib/cache.ts`,
  `lib/property-cache.ts`, `lib/homepage-cache.ts`).
- **No test framework configured.**

## This is the short-term-stays app, not a dual-product app

Despite the repo being named `ndotoniApp`, functionally this is the mobile companion to
`ndotoniStays` (ndotonistays.com) — package.json's own `name` field is literally
`"ndotoni-stays"`. There is no long-term-rental screen anywhere in `app/`.
`hooks/useRentalType.ts`'s `RentalType` enum has **only** a `SHORT_TERM` member — no
`LONG_TERM` value exists. A `LONG_TERM` code branch does still exist in
`hooks/useCategorizedProperties.ts` and `lib/config.ts` (`CACHE_URLS.longTermHomepage`),
vestigial from a shared/copy-pasted codebase, but it's never actually invoked — the
Explore tab hardcodes `useCategorizedProperties('SHORT_TERM')`. Don't spend time trying to
"finish" the long-term path unless explicitly asked to add long-term support to this app;
treat it as dead plumbing.

## Screen map (`app/` — Expo Router)

Root layout (`app/_layout.tsx`) provider order: `ThemeProvider > LanguageProvider >
AuthProvider > ChatProvider > PushNotificationProvider > AlertProvider >
AuthPromptProvider > ErrorBoundary`.

### Tabs (`app/(tabs)/`) — 5 tabs

| Tab | Route | What it is |
|---|---|---|
| Explore | `index.tsx` | Home feed — categorized short-term property sections (Nearby/Lowest Price/Most Viewed/More), sourced from a CloudFront JSON cache; search entry point |
| Trips | `trips.tsx` | Guest's bookings ("My Trips") — upcoming/past, wires `PaymentModal`/`ReviewModal` |
| Host | `host.tsx` | Host dashboard — bookings, reviews, payouts, WhatsApp association, stats |
| Inbox | `inbox.tsx` | Conversation list |
| Profile | `profile.tsx` | Profile menu, links to profile subroutes |

### Stack routes

| Route | What it is |
|---|---|
| `auth/callback.tsx` | **Android-only** OAuth deep-link handler (`ndotoniapp://auth/callback?code=...`) — exchanges code for tokens, see [auth.md](./auth.md) for why iOS doesn't need this |
| `search.tsx` | Full search results with filter modal |
| `short-property/[id].tsx` | Property detail — gallery, amenities, contact/chat CTA, reservation entry |
| `conversation/[id].tsx` | Chat thread — reply, reactions, read receipts, typing indicator |
| `profile/edit.tsx`, `favorites.tsx`, `settings.tsx`, `blocked-users.tsx` | Profile subroutes |
| `landlord/properties.tsx` | Host's property list management |
| `landlord/calendar/[id].tsx` | Availability calendar — block/unblock dates |
| `landlord/short-property/[id].tsx` | Edit an existing listing |
| `landlord/short-property/create.tsx` | Multi-step listing creation wizard |
| `modal.tsx` | Leftover default Expo Router template modal — not product-specific, safe to repurpose or remove if you need a generic modal route |

## Known dead code

- **`lib/auth-bridge.ts`** (`AuthBridge`, ~380 lines) — an older, separate OAuth
  implementation (implicit flow) from before the current hybrid OIDC approach. Confirmed
  imported nowhere. Don't extend it thinking it's live; see [auth.md](./auth.md) for the
  actual current auth implementation.
- **The `graphql-codegen`/`codegen.yml` pipeline** — its `documents` glob
  (`./lib/graphql/**/*.graphql`) matches zero files in this repo, so it's effectively a
  no-op. See [graphql-and-codegen.md](./graphql-and-codegen.md).
- **`hooks/useCategorizedProperties.ts`'s `LONG_TERM` branch** — see above.
- **`app/modal.tsx`** — Expo Router's default template modal, not wired into any real
  feature flow.

## Permissions declared (`app.config.ts`)

iOS: location (when-in-use + always-and-when-in-use, for "find stays near you"/setting
coordinates), camera, photo library (listing photos). Android: coarse + fine location.
Bundle identifier / package: `com.ndotoni.app`. Deep-link scheme: `ndotoniapp://`.
