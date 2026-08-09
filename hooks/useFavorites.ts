/**
 * Dedicated favorites hook with shared global state.
 *
 * All consumers (homepage, favorites page, property detail) share the same
 * in-memory Set so toggling on one screen is reflected everywhere instantly.
 *
 * Persistence: AsyncStorage (survives app restarts).
 * Auth: Uses GraphQLClient.executeAuthenticated (supports Amplify + OIDC).
 * UX: Optimistic update — UI toggles immediately, reverts on error.
 */

import { GraphQLClient } from '@/lib/graphql-client';
import { toggleFavorite as toggleFavoriteMutation } from '@/lib/graphql/mutations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useSyncExternalStore } from 'react';

// =============================================================================
// GLOBAL STATE (shared across all hook instances)
// =============================================================================

const STORAGE_KEY = 'ndotoni_favorites';

const globalFavorites = new Set<string>();
// Per-property request chains — serializes rapid toggles so a second tap
// (e.g. favorite then quickly un-favorite) always updates the UI immediately
// and queues its network call after the in-flight one, instead of being
// silently dropped while a request is pending.
const inFlightChains = new Map<string, Promise<void>>();
let initialized = false;
let version = 0; // increment on every mutation to bust memoization

// Subscribers — simple notify pattern
const listeners = new Set<() => void>();

function notifyAll() {
  version++;
  listeners.forEach(fn => fn());
}

// useSyncExternalStore plumbing — this is the React-Compiler-safe way to
// subscribe to state that lives outside React (globalFavorites is mutated
// directly, not through props/state). A hand-rolled useReducer+listeners
// subscription looks pure to the compiler's static analysis, so it can
// memoize `isFavorited(propertyId)` across renders and never notice the
// mutable Set changed underneath it — which is exactly what caused the
// heart icon to only reflect a toggle after a full remount/refresh.
function subscribe(callback: () => void) {
  listeners.add(callback);
  loadFromStorage();
  return () => { listeners.delete(callback); };
}

function getVersion() {
  return version;
}

// Persist to AsyncStorage (fire-and-forget)
function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(globalFavorites))).catch(() => {});
}

// Load from AsyncStorage (called once)
async function loadFromStorage() {
  if (initialized) return;
  initialized = true;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const ids: string[] = JSON.parse(stored);
      ids.forEach(id => globalFavorites.add(id));
      if (ids.length > 0) notifyAll();
    }
  } catch {
    // silently fail
  }
}

// =============================================================================
// PUBLIC HOOK
// =============================================================================

export function useFavorites() {
  // Re-renders this component whenever notifyAll() bumps `version` — the
  // compiler-safe replacement for the old manual useReducer+listeners setup.
  const storeVersion = useSyncExternalStore(subscribe, getVersion, getVersion);

  // isFavorited reads from the mutable globalFavorites, so its result can
  // change without any of ITS OWN inputs changing. With the React Compiler
  // enabled (app.config.ts), a `[]`-deps callback here gets treated as safe
  // to call once and cache by identity — `isFavorited(propertyId)` in a
  // consumer component would then get memoized across renders and never
  // notice the Set changed. Depending on `storeVersion` gives this a new
  // identity every time the store actually changes, which correctly busts
  // that memoization wherever it's called.
  const isFavorited = useCallback(
    (propertyId: string) => globalFavorites.has(propertyId),
    [storeVersion]
  );

  const toggleFavorite = useCallback(async (propertyId: string) => {
    const wasAlreadyFavorited = globalFavorites.has(propertyId);

    // ─── Optimistic update (mutate in place) — always immediate, never
    // blocked by a previous request that's still in flight ───
    if (wasAlreadyFavorited) globalFavorites.delete(propertyId);
    else globalFavorites.add(propertyId);
    persist();
    notifyAll();

    const runServerCall = async () => {
      try {
        const response = await GraphQLClient.executeAuthenticated<{
          toggleFavorite: { success: boolean; isFavorited: boolean; message?: string };
        }>(toggleFavoriteMutation, { propertyId });

        const result = response?.toggleFavorite;
        console.log('[useFavorites] Server response:', { propertyId, result });

        if (result?.success) {
          // Only reconcile if server disagrees with current optimistic state
          const currentlyHas = globalFavorites.has(propertyId);
          if (currentlyHas !== result.isFavorited) {
            if (result.isFavorited) globalFavorites.add(propertyId);
            else globalFavorites.delete(propertyId);
            persist();
            notifyAll();
          }
        } else {
          console.warn('[useFavorites] Server rejected toggle:', result?.message);
          revert(propertyId, wasAlreadyFavorited);
        }
      } catch (error) {
        console.error('[useFavorites] Error toggling favorite:', error);
        revert(propertyId, wasAlreadyFavorited);
      }
    };

    // Chain onto any request already in flight for this property, so rapid
    // taps hit the server in the order the user made them instead of racing.
    const previous = inFlightChains.get(propertyId) || Promise.resolve();
    const next = previous.then(runServerCall);
    inFlightChains.set(propertyId, next);
    await next;
  }, []);

  return { isFavorited, toggleFavorite };
}

// =============================================================================
// HELPERS
// =============================================================================

function revert(propertyId: string, wasAlreadyFavorited: boolean) {
  if (wasAlreadyFavorited) globalFavorites.add(propertyId);
  else globalFavorites.delete(propertyId);
  persist();
  notifyAll();
}

/**
 * Seed favorites from server data (e.g. after login or initial load).
 * Call this from auth context or app init if you fetch the user's favorites list.
 */
export function seedFavorites(propertyIds: string[]) {
  globalFavorites.clear();
  propertyIds.forEach(id => globalFavorites.add(id));
  initialized = true;
  persist();
  notifyAll();
}
