# Ndotoni App (Mobile)

Expo (React Native) mobile app for **Ndotoni Stays** — the short-term/Airbnb-style
booking product (companion to [`ndotoniStays`](https://github.com/Ndotoni-Rental-Agency/ndotoniStays),
ndotonistays.com). Despite the repo name, **this app covers short-term stays only** — see
[docs/architecture.md](./docs/architecture.md) for the (vestigial, unused) long-term-rental
plumbing still present in the code. Talks to the shared AWS backend
([`ndotoniBackend`](https://github.com/Ndotoni-Rental-Agency/ndotoniBackend)) via AppSync
GraphQL, and shares its Cognito user pool with both `ndotoniWeb` and `ndotoniStays`.

**→ For architecture, auth, the data layer, push notifications, and the booking/payment
flow, see [`docs/README.md`](./docs/README.md).** This file only covers local setup and
builds.

## Prerequisites

- Node.js, **pnpm**
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (via `npx expo`, no global install needed)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`) for builds/OTA updates
- Xcode (iOS builds/simulator) and/or Android Studio (Android builds/emulator) if building
  natively rather than using Expo Go
- AWS CLI with credentials, **only if** regenerating GraphQL types against the live
  AppSync API

## Setup

```bash
pnpm install
cp .env.example .env    # fill in the values below
pnpm start                # expo start
```

### Environment variables

`.env.example` is accurate and current — copy it and fill in real values:

```
EXPO_PUBLIC_AWS_REGION=us-west-2
EXPO_PUBLIC_USER_POOL_ID=
EXPO_PUBLIC_USER_POOL_CLIENT_ID=
EXPO_PUBLIC_MOBILE_CLIENT_ID=
EXPO_PUBLIC_COGNITO_DOMAIN=
EXPO_PUBLIC_GRAPHQL_ENDPOINT=
EXPO_PUBLIC_GRAPHQL_REGION=us-west-2
EXPO_PUBLIC_API_KEY=
EXPO_PUBLIC_REDIRECT_SIGN_IN=ndotoniapp://
EXPO_PUBLIC_REDIRECT_SIGN_OUT=ndotoniapp://
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_CLOUDFRONT_DOMAIN=
EXPO_PUBLIC_CLOUDFRONT_URL=
EXPO_PUBLIC_S3_BUCKET=
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_STAGE=dev
```

If you ever find an older doc or note listing different variable names (e.g.
`EXPO_PUBLIC_AWS_APPSYNC_ENDPOINT`) — trust `.env.example`/the code over it; a previous
round of docs in this repo had drifted from reality and was replaced (see
[docs/README.md](./docs/README.md)).

### Credential files (not committed)

`google-services.json` (Android Firebase config, needed for push notification delivery)
**is** committed and expected. Two other JSON files may exist in your local checkout but
are gitignored and must **never** be committed: a Firebase Admin SDK private key
(`ndotoni-6c29c-firebase-adminsdk-*.json`, backend-only, not used by this app at all) and
a Google Play Console service-account key (`chatbox-c9b6d-*.json`, used only by
`eas submit` for Android). Get these from whoever manages EAS/Firebase access if you need
to submit a build — don't recreate or commit them.

## Local development

```bash
pnpm start          # expo start — scan the QR code with Expo Go, or run a dev build
pnpm ios             # expo run:ios (requires Xcode)
pnpm android         # expo run:android (requires Android Studio)
pnpm type-check      # tsc --noEmit
pnpm lint            # expo lint
```

Social sign-in (Google/Facebook/Apple) works in Expo Go — see
[docs/auth.md](./docs/auth.md) for why that wasn't always true and isn't guaranteed to
stay true if the auth implementation changes again.

## Regenerating GraphQL types

```bash
pnpm schema:update
```

See [docs/graphql-and-codegen.md](./docs/graphql-and-codegen.md) — like the sibling web
repos, this app has two codegen configs and only one is actually used.

## Building & shipping

Two independent release mechanisms, triggered differently — see
[docs/README.md § deployment](./docs/README.md#deployment) for the full picture:

- **OTA JS update** (no app store review): automatic on every push to `main` via
  `.github/workflows/eas-update.yml` (`eas update --branch production`). Ships instantly
  to production users' existing app installs.
- **Native store build + submission**: triggered by pushing a `v*` git tag via
  `.github/workflows/eas-build.yml` (`eas build` + `eas submit` for both iOS and
  Android). Use this only when you've changed native code/config (new permission, new
  native dependency, `app.config.ts` change) — a JS-only change should ship via OTA
  instead.

Manual equivalents: `eas build --profile production --platform all`,
`eas update --branch production --platform all`.
