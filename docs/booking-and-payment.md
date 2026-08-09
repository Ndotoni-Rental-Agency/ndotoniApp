# Booking & Payment

Uses the **same backend GraphQL operations** as the `ndotoniStays` web app
(`createBooking`, `calculateBookingPrice`, `checkAvailability`, `initiatePayment`,
`getPayment`, `getBooking`, `cancelBooking`, `listMyBookings`) via this app's
`GraphQLClient` — no mobile-specific backend API. See the web app's
[`docs/booking-and-payment.md`](https://github.com/Ndotoni-Rental-Agency/ndotoniStays/blob/main/docs/booking-and-payment.md)
for the full two-phase (create-then-pay) flow, which is identical here at the backend
level.

## The mobile-specific part: no native card payment

There is **no Stripe SDK** in this app (`@stripe/stripe-react-native` or similar isn't a
dependency). `components/trips/PaymentModal.tsx` implements two payment paths
differently:

- **Mobile money** — fully in-app: calls `initiatePayment({ bookingId, phoneNumber })`,
  then if the result is `PENDING`, polls `getPayment` every 10 seconds for up to 30
  attempts (5 minutes), watching for `CAPTURED`/`AUTHORIZED`/`FAILED`. Same polling
  pattern as the web app.
- **Card payment** — hands off entirely to the web: `Linking.openURL('https://www.ndotonistays.com/pay/${bookingId}')`
  opens the `ndotoniStays` web app's hosted checkout in the system browser. Since
  `Linking.openURL` gives no completion callback, `PaymentModal` sets an
  `awaitingCardReturnRef` flag and re-checks the booking's real payment status via
  `getBooking` when the app returns to the foreground (an `AppState` listener) — this is
  the mobile-specific workaround for not having an in-app card payment SDK.

**If you're asked to "add native card payment to the mobile app"**, that's a real,
non-trivial feature addition (integrating a Stripe React Native SDK, handling
Apple Pay/Google Pay natively), not a small fix — scope it accordingly rather than
assuming it's close to done because payment "already works" via the web handoff.

## Testing the payment flow

Since card payment leaves the app entirely, you can't fully exercise it in a simulator
without either a real device (to actually return to the app via the system browser) or by
manually toggling app foreground/background state in a simulator after completing the web
checkout. Mobile money can be tested end-to-end within the app.
