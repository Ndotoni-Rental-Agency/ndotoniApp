/**
 * Hook for hiding reported properties from search/home feeds.
 *
 * Stores property IDs with timestamps in AsyncStorage. Entries expire after 30 days.
 * Uses the same global-state + listener pattern as useFavorites for instant cross-screen sync.
 *
 * Usage:
 *   const { hiddenIds, hideProperty, isHidden } = useHiddenProperties();
 *   const visibleProperties = properties.filter(p => !isHidden(p.propertyId));
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useSyncExternalStore } from 'react';

// =============================================================================
// CONFIG
// =============================================================================

const STORAGE_KEY = '@ndotoni/hidden_properties';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// =============================================================================
// GLOBAL STATE (shared across all hook instances)
// =============================================================================

interface HiddenEntry {
  propertyId: string;
  hiddenAt: number; // epoch ms
}

let globalEntries: HiddenEntry[] = [];
let globalIds = new Set<string>();
let initialized = false;
let version = 0;

const listeners = new Set<() => void>();

function notifyAll() {
  version++;
  listeners.forEach(fn => fn());
}

// useSyncExternalStore plumbing — see useFavorites.ts for why this matters:
// with the React Compiler enabled (app.config.ts), a hand-rolled
// useReducer+listeners subscription looks pure to its static analysis and
// can get memoized across renders, so a hide/unhide would only show up
// after a full remount. useSyncExternalStore is the compiler-safe way to
// subscribe to state that lives outside React.
function subscribe(callback: () => void) {
  listeners.add(callback);
  loadFromStorage();
  return () => { listeners.delete(callback); };
}

function getVersion() {
  return version;
}

function rebuildSet() {
  globalIds = new Set(globalEntries.map(e => e.propertyId));
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(globalEntries)).catch(() => {});
}

/** Remove entries older than 30 days */
function pruneExpired(): boolean {
  const cutoff = Date.now() - TTL_MS;
  const before = globalEntries.length;
  globalEntries = globalEntries.filter(e => e.hiddenAt > cutoff);
  if (globalEntries.length !== before) {
    rebuildSet();
    return true;
  }
  return false;
}

async function loadFromStorage() {
  if (initialized) return;
  initialized = true;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      globalEntries = JSON.parse(stored);
      // Prune expired entries on load
      pruneExpired();
      rebuildSet();
      if (globalEntries.length > 0) notifyAll();
      // Persist pruned list
      persist();
    }
  } catch {
    // silently fail
  }
}

// =============================================================================
// PUBLIC HOOK
// =============================================================================

/**
 * Standalone function to merge server-side hidden IDs into the global state.
 * Call this from AuthContext after getMe returns (no hook context needed).
 */
export function syncHiddenPropertiesFromServer(serverIds: string[] | null | undefined) {
  if (!serverIds || serverIds.length === 0) return;
  let changed = false;
  for (const id of serverIds) {
    if (!globalIds.has(id)) {
      globalEntries.push({ propertyId: id, hiddenAt: Date.now() });
      changed = true;
    }
  }
  if (changed) {
    rebuildSet();
    persist();
    notifyAll();
  }
}

export function useHiddenProperties() {
  // Re-renders this component whenever notifyAll() bumps `version`.
  const storeVersion = useSyncExternalStore(subscribe, getVersion, getVersion);

  /** Merge server-side hidden IDs (from getMe) into local state */
  const syncFromServer = useCallback((serverIds: string[] | null | undefined) => {
    if (!serverIds || serverIds.length === 0) return;
    let changed = false;
    for (const id of serverIds) {
      if (!globalIds.has(id)) {
        globalEntries.push({ propertyId: id, hiddenAt: Date.now() });
        changed = true;
      }
    }
    if (changed) {
      rebuildSet();
      persist();
      notifyAll();
    }
  }, []);

  const hideProperty = useCallback((propertyId: string) => {
    if (globalIds.has(propertyId)) return; // already hidden

    globalEntries.push({ propertyId, hiddenAt: Date.now() });
    rebuildSet();
    persist();
    notifyAll();
  }, []);

  const unhideProperty = useCallback((propertyId: string) => {
    if (!globalIds.has(propertyId)) return;

    globalEntries = globalEntries.filter(e => e.propertyId !== propertyId);
    rebuildSet();
    persist();
    notifyAll();
  }, []);

  // See useFavorites.ts for why this depends on storeVersion — with the
  // React Compiler enabled, a `[]`-deps callback here can get memoized by
  // identity in a consumer and never notice globalIds changed.
  const isHidden = useCallback((propertyId: string) => {
    return globalIds.has(propertyId);
  }, [storeVersion]);

  const clearAll = useCallback(async () => {
    globalEntries = [];
    rebuildSet();
    await AsyncStorage.removeItem(STORAGE_KEY);
    notifyAll();
  }, []);

  return {
    /** Set of hidden property IDs (for inline filtering) */
    hiddenIds: globalIds,
    /** Hide a property (e.g. after reporting) */
    hideProperty,
    /** Unhide a property */
    unhideProperty,
    /** Merge server-side hidden IDs (from getMe) into local state */
    syncFromServer,
    /** Check if a specific property is hidden */
    isHidden,
    /** Clear all hidden properties */
    clearAll,
    /** Current version (for memoization deps) */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _version: version,
  };
}
