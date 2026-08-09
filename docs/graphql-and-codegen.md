# GraphQL Data Layer & Codegen

## Two different mechanisms for two different operation types

- **Queries & mutations**: `lib/graphql-client.ts` — a `GraphQLClient` class doing raw
  `fetch()` POSTs directly to `EXPO_PUBLIC_GRAPHQL_ENDPOINT`. It does **not** route
  through Amplify's `generateClient().graphql()` for this, even though `generateClient()`
  is instantiated in the same file — that instance goes unused for the main request path.
  Same three-method shape as the web apps: `execute` (auto-detect auth),
  `executeAuthenticated` (throws if signed out), `executePublic` (forces API key). The
  auth header comes from `HybridAuthService.getAccessToken()` — see
  [auth.md](./auth.md).
- **Subscriptions**: `hooks/useChatSubscription.ts` uses Amplify's `generateClient()`
  from `aws-amplify/api` directly, `.subscribe()` on `onNewMessage`/`onMessageUpdated`/
  `onTypingIndicator`/`onConversationRead` (apiKey auth mode).

If you're debugging why an auth header isn't showing up on a request, or why a
subscription behaves differently from a query in terms of auth/retry behavior, remember
these are genuinely two different client code paths, not one abstraction.

## Two codegen pipelines — only one is used

Same situation as both sibling web repos:

1. **Amplify CLI codegen** (`amplify:statements`/`amplify:types`/`amplify:codegen`
   scripts, via `@aws-amplify/cli`) — the real, active pipeline. Produces `lib/API.ts`
   (types, ~9400 lines) and `lib/graphql/{queries,mutations,subscriptions}.ts`
   (operations) — identifiable by their Amplify-CLI-generated file headers. This is what
   the app actually imports from.
2. **`graphql-codegen`** (`codegen.yml` + `.graphqlconfig.yml`, `pnpm run codegen`) — its
   `documents` glob points at `./lib/graphql/**/*.graphql`, but **there are zero
   `.graphql` document files anywhere in this repo**. This pipeline effectively does
   nothing when run; it's a leftover devDependency, not a real second source of types.

## Regenerating after a backend schema change

```bash
pnpm schema:update
```

Runs `schema:download` (AWS CLI, pulls introspection SDL from AppSync API id
`tpxpbec6e5crxhu277uknqxoqi`, region `us-west-2`, into root `schema.graphql`) →
`schema:clean` (strips Amplify placeholder fields) → `amplify:codegen` (regenerates
`lib/API.ts` + `lib/graphql/*.ts`). Don't run bare `pnpm codegen` expecting it to do
anything useful — see above.
