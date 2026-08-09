# Push Notifications

Uses the **Expo push notification service**, not a direct FCM/APNs integration — despite
Firebase files being present in the repo.

## Firebase's actual role

`google-services.json` (tracked, Firebase project `ndotoni-6c29c`) is wired into
`app.config.ts` (`android.googleServicesFile`) purely so Android push delivery routes
through FCM under the hood of Expo's push service. There is **no Firebase JS/RN SDK
dependency anywhere in this app** — don't go looking for `@react-native-firebase/*` usage,
there isn't any. (A separate `ndotoni-6c29c-firebase-adminsdk-*.json` file may exist
locally — that's a backend Firebase Admin credential, gitignored, unrelated to and unused
by this app.)

## Registration

`hooks/usePushNotifications.ts` lazy-`require()`s `expo-notifications`/`expo-device`
inside a try/catch so the module gracefully no-ops in Expo Go (where these native modules
aren't linked). Calls `Notifications.getExpoPushTokenAsync({ projectId: '<eas-project-id>' })`
to get an **Expo push token** (not a raw FCM/APNs token). Two Android notification
channels are configured: `messages` (chat) and `bookings` ("Bookings & Payments").

`contexts/PushNotificationContext.tsx` triggers registration on auth-state change and
app-foreground, then sends the token to the backend via the `registerPushToken` mutation
(backend schema field `registerPushToken(token: String!): SuccessResponse!`), de-duped
against the last-registered token so it doesn't spam the backend on every foreground event.

## What triggers a notification, and where tapping it goes

`handleNotificationResponse` in `usePushNotifications.ts` routes by `data.type`:

| `data.type` | Audience | Navigates to |
|---|---|---|
| `new_message` | either | conversation screen |
| `new_booking`, `booking_approved`, `payment_received`, `booking_cancelled` | host | conversation or Host tab |
| `booking_confirmed`, `booking_declined`, `payment_receipt` | guest | conversation or Trips tab |
| `new_review` | host | property page or Host tab |

Also handles the **cold-start case** explicitly via `getLastNotificationResponseAsync()`
— the tap listener doesn't fire if the app was launched fresh by tapping a notification,
so this is checked separately on app start. If you add a new notification type, make sure
it's handled in both the live-listener path and this cold-start path, or notifications
that launch the app from a killed state won't navigate correctly.
