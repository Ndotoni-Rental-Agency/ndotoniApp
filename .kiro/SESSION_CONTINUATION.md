# Session Continuation — ndotoniApp

## What was completed this session

### Auth & Session
- ✅ Login persists forever (refresh token 10 years, lazy token refresh)
- ✅ CDK auth stack updated (all Cognito clients: 10yr refresh, 1hr access)
- ✅ OIDC token refresh via Cognito token endpoint

### Host Dashboard (explore.tsx)
- ✅ Complete redesign — "Today" header, stats row, listing cards, quick actions
- ✅ Modularized into `components/host/dashboard/` (StatsRow, ListingCard, QuickActions)
- ✅ Pulsing badge on Bookings when pending requests exist
- ✅ Polls every 15s for new booking requests
- ✅ Max 2 listings shown + "See all" link

### Create Listing Flow
- ✅ 7-step Airbnb-style wizard with animations
- ✅ Each step in its own file (`components/create-listing/`)
- ✅ AI title/price suggestions, ward selection fix, keyboard dismiss

### Calendar
- ✅ Direct date selection on calendar grid (tap to select range)
- ✅ Bottom action bar with Block/Unblock

### Booking/Reservation Modal
- ✅ Modularized into `components/reservation/` (StepDates, StepAuthChoice, StepGuestInfo, StepPayment, StepResult)
- ✅ Guest checkout flow (name, email, phone — no auth required)
- ✅ Auth choice step (Sign in OR continue as guest)
- ✅ Auto-fill from user profile on sign-in
- ✅ Payment methods: M-Pesa + Card (Stripe via web redirect)
- ✅ Blocked dates properly fetched and enforced
- ✅ Calendar auto-opens on modal appear

### Trips Tab (messages.tsx)
- ✅ Tabs: Upcoming | Past | Cancelled (Airbnb pattern)
- ✅ Awaiting payment sorted to top with "Pay now" button
- ✅ Payment modal (M-Pesa + Card)
- ✅ Fixed pricing (reads from `pricing.total`)
- ✅ User-friendly status labels
- ✅ Modularized into `components/trips/` (TripCard, PaymentModal, types)

### WhatsApp
- ✅ Proper verification flow (initiate → code → confirm)
- ✅ Added `initiateWhatsAppAssociation` + `confirmWhatsAppAssociation` mutations

### UI Polish
- ✅ `AppSwitch` reusable component (visible in light mode)
- ✅ All Switch usages replaced across the app
- ✅ Default theme: light mode
- ✅ Edit page: pill tabs, roomier inputs, accordion polish
- ✅ Google Maps URL field in check-in instructions

### Cleanup
- ✅ Removed long-term property code (~1837 lines deleted)
- ✅ Extracted GalleryCarousel, FullScreenGallery, HighlightCard from property detail

---

## What remains — TODO (in priority order)

### 1. Modularization (large files still >400 lines)
- [ ] `app/(tabs)/list-property.tsx` (738 lines) — Extract `SwipeableConversationCard` into `components/inbox/`
- [ ] `app/(tabs)/profile.tsx` (712 lines) — Extract auth/unauth views, preference sections
- [ ] `components/search/SearchModal.tsx` (708 lines) — Split date picker, guest counter, location selector
- [ ] `app/search.tsx` (432 lines) — Extract card renderers, location modal
- [ ] `app/conversation/[id].tsx` (571 lines) — Extract message bubble components

### 2. Missing Features (from web)
- [ ] **Guest reviews** — `createReview` mutation after completed stay (show prompt in Trips > Past)
- [ ] **Host respond to reviews** — `respondToReview` in HostReviews component
- [ ] **Deactivate listing** — Add alongside Delete (uses `deactivateShortTermProperty` mutation, reversible)
- [ ] **Contact support** — `submitContactInquiry` mutation (simple form in Profile)

### 3. Dead Code Cleanup
- [ ] `hooks/useRentalType.ts` — Remove `LONG_TERM` enum, simplify (still imported in 4 files)
- [ ] `hooks/useCategorizedProperties.ts` — May reference `monthlyRent` (audit)
- [ ] `app/(tabs)/index.tsx` — Remove unused `useAuth`, `scrollY`, `CARD_IMG` imports
- [ ] `app/search.tsx` — Remove unused `RentalType`, `districts`, `category`
- [ ] Remove old `PricingSection.tsx` monthlyRent UI (long-term remnant)
- [ ] Remove `components/property/sections/ContactSection.tsx` (long-term)

### 4. Tab File Renaming (confusing names)
- [ ] `list-property.tsx` → should be `inbox.tsx` (it's the messages/inbox screen)
- [ ] `messages.tsx` → should be `trips.tsx` (it's the trips screen)  
- [ ] `explore.tsx` → should be `host.tsx` (it's the host dashboard)
- Note: Expo Router maps filenames to routes, so renaming requires updating `_layout.tsx` tab config

### 5. Backend Tasks (non-mobile)
- [ ] Scheduled Lambda to auto-cancel unpaid bookings for deleted properties
- [ ] Run `codegen` to regenerate API types (adds `googleMapsUrl`, WhatsApp mutations properly)

---

## Key Architecture Notes

```
ndotoniApp/
├── app/(tabs)/
│   ├── index.tsx         — Explore/search (guest-facing)
│   ├── messages.tsx      — Trips tab (Upcoming/Past/Cancelled)
│   ├── explore.tsx       — Host dashboard
│   ├── list-property.tsx — Inbox/Messages (chat)
│   └── profile.tsx       — User profile & settings
├── components/
│   ├── create-listing/   — 7-step wizard (modularized)
│   ├── reservation/      — Booking modal steps (modularized)
│   ├── trips/            — TripCard, PaymentModal (modularized)
│   ├── host/dashboard/   — StatsRow, ListingCard, QuickActions
│   ├── host/edit/        — EditDetailsTab, EditCheckInTab, EditSettingsTab
│   ├── property/         — GalleryCarousel, FullScreenGallery, HighlightCard, ReservationModal
│   └── ui/               — AppSwitch (reusable)
├── contexts/             — Auth, Theme, Chat, Language, Alert
├── hooks/                — useUpdateProperty, useShortTermPropertyDetail, etc.
└── lib/
    ├── auth/             — hybrid-auth-service, oidc-manager, amplify
    ├── graphql/          — mutations.ts, queries.ts (auto-generated + manual additions)
    └── ai-service.ts     — Title/price/description AI generation
```

## Payment Flow
1. Guest selects dates → enters details → `createBooking` (with guestName/email/phone)
2. If instant book → booking.status = CONFIRMED → payment step
3. Payment: M-Pesa (`initiatePayment` + polling) OR Card (redirect to `ndotonistays.com/pay/{id}`)
4. If request-to-book → booking.status = PENDING → host approves → guest pays

## Auth Flow
- Email/password via Amplify (Cognito SRP)
- Social (Google/Facebook) via custom OIDC manager
- Tokens stored in AsyncStorage, refresh happens lazily
- Guest booking works without auth (uses `executePublic`)
