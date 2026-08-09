# Auth

Genuinely more complex than the sister web apps' auth, and for a real, documented reason
— not accidental complexity. Uses **the same Cognito user pool as `ndotoniWeb` and
`ndotoniStays`**.

## Why it's hybrid

Email/password sign-up/sign-in/confirm/reset goes through **Amplify** (`aws-amplify/auth`)
directly. Google/Facebook/Apple sign-in goes through a **hand-rolled OIDC
authorization-code flow** instead of Amplify's built-in OAuth. The reason is stated
directly in the code (`lib/auth-bridge.ts:197`, though that specific file is dead — see
below): *"Amplify's `signInWithRedirect` doesn't work well in React Native."* This is the
app's **third** attempt at social auth (an earlier implicit-flow implementation was
abandoned, then a full revert-to-Amplify-only was tried and itself reverted) — if you're
tempted to "simplify" this back to pure Amplify, that's almost certainly been tried
before and didn't work; verify current OAuth behavior thoroughly before touching this.

## The single entry point: `HybridAuthService`

`lib/auth/hybrid-auth-service.ts` — used everywhere (`AuthContext`, `graphql-client.ts`).
`isAuthenticated()`/`getAccessToken()`/`getUserId()` check the OIDC session first, then
fall back to Amplify. Routes: Amplify for email/password, `lib/auth/oidc-manager.ts` for
social sign-in.

## How the OIDC flow actually works

`lib/auth/oidc-manager.ts` depends on `oidc-client-ts`'s `UserManager`, but the real
sign-in functions (`signInWithGoogle`, `signInWithFacebook`, `signInWithApple`) **don't
use its `signinRedirect()`** — they:

1. Manually build the Cognito Hosted UI authorize URL (`buildAuthUrl`).
2. Open it with `expo-web-browser`'s `WebBrowser.openAuthSessionAsync` — a pure JS Expo
   SDK API, no native linking required (this is what makes it work in Expo Go, unlike the
   Amplify path it replaced).
3. Manually exchange the returned code for tokens via `fetch()` against the Cognito token
   endpoint (`exchangeCodeForTokens`) — authorization-code flow, not implicit.

`userManager` (the `oidc-client-ts` instance) is essentially vestigial — only used as a
fallback inside `refreshTokens()`.

**iOS vs. Android differ**: on iOS, `WebBrowser.openAuthSessionAsync`'s result directly
returns the callback URL, so no deep-link route is needed. On Android, the OS hands the
`ndotoniapp://auth/callback?code=...` deep link to `app/auth/callback.tsx`, which does
the token exchange and redirects into the app. (That file has a stale comment mislabeling
the scheme as `ndotonistays://` — the real scheme, per `app.config.ts`, is `ndotoniapp://`.)

## Dead code: `lib/auth-bridge.ts`

A separate, older `AuthBridge` class (~380 lines) implementing OAuth via **implicit
flow** (`response_type=token`) plus its own `signInWithAmplify`/`signUpWithCustom`.
Confirmed imported nowhere in the app. This is a leftover from an earlier auth iteration —
don't extend it, and feel free to flag it for deletion if you're doing cleanup (not
removed as part of this doc pass since it's a code change, not a docs change).

## Session persistence

- OIDC tokens: `AsyncStorage`, prefix `oidc.` (`oidc-manager.ts`'s `AsyncStorageStore`).
- Cached user profile: `AsyncStorage` key `@ndotoni:user` (`AuthContext.tsx`).
- Amplify manages its own Cognito token persistence internally (also `AsyncStorage`-backed).

## Token refresh

`HybridAuthService.getAccessToken()` proactively force-refreshes Amplify tokens within 5
minutes of expiry. OIDC tokens refresh manually via the `refresh_token` grant
(`oidc-manager.ts`'s `refreshTokensManually()`). `AuthContext` also runs this check on
init and periodically (every 5 minutes) while the user is authenticated.

## A real, still-relevant gotcha

`fetchAuthSession()` forces Amplify to restore/validate tokens; `getCurrentUser()` does
**not** guarantee that. If you see intermittent "signed in but requests fail as
unauthenticated" bugs, check whether the code path in question relies on
`getCurrentUser()` alone versus actually calling `fetchAuthSession()` first.
