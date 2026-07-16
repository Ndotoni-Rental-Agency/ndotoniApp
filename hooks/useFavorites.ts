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
import { useCallback, useEffect, useReducer } from 'react';

// =============================================================================
// GLOBAL STATE (shared across all hook instances)
// =============================================================================

const STORAGE_KEY = 'ndotoni_favorites';

const globalFavorites = new Set<string>();
const inFlightToggles = new Set<string>(); // prevents double-toggling
let initialized = false;
let version = 0; // increment on every mutation to bust memoization

// Subscribers — simple notify pattern
const listeners = new Set<() => void>();

function notifyAll() {
  version++;
  listeners.forEach(fn => fn());
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
  // forceUpdate triggers a re-render so isFavorited reads fresh global state
  const [rev, forceUpdate] = useReducer(x => x + 1, 0);

  // Subscribe to global changes
  useEffect(() => {
    listeners.add(forceUpdate);
    loadFromStorage();
    return () => { listeners.delete(forceUpdate); };
  }, []);

  // isFavorited depends on `rev` so it returns a new function ref after each change,
  // causing consumers to re-render with the correct value.
  const isFavorited = useCallback(
    (propertyId: string) => globalFavorites.has(propertyId),
    [rev] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleFavorite = useCallback(async (propertyId: string) => {
    // Prevent double-toggling while a request is in-flight
    if (inFlightToggles.has(propertyId)) return;
    inFlightToggles.add(propertyId);

    const wasAlreadyFavorited = globalFavorites.has(propertyId);

    // ─── Optimistic update (mutate in place) ───
    if (wasAlreadyFavorited) globalFavorites.delete(propertyId);
    else globalFavorites.add(propertyId);
    persist();
    notifyAll();

    // ─── Server call ───
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
    } finally {
      inFlightToggles.delete(propertyId);
    }
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
