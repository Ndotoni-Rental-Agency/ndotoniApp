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
import { useCallback, useEffect, useReducer } from 'react';

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
      globalIds.add(id);
      changed = true;
    }
  }
  if (changed) {
    persist();
    notifyAll();
  }
}

export function useHiddenProperties() {
  // Force re-render when global state changes
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    loadFromStorage();
    listeners.add(forceUpdate);
    return () => { listeners.delete(forceUpdate); };
  }, []);

  /** Merge server-side hidden IDs (from getMe) into local state */
  const syncFromServer = useCallback((serverIds: string[] | null | undefined) => {
    if (!serverIds || serverIds.length === 0) return;
    let changed = false;
    for (const id of serverIds) {
      if (!globalIds.has(id)) {
        globalEntries.push({ propertyId: id, hiddenAt: Date.now() });
        globalIds.add(id);
        changed = true;
      }
    }
    if (changed) {
      persist();
      notifyAll();
    }
  }, []);

  const hideProperty = useCallback((propertyId: string) => {
    if (globalIds.has(propertyId)) return; // already hidden

    globalEntries.push({ propertyId, hiddenAt: Date.now() });
    globalIds.add(propertyId);
    persist();
    notifyAll();
  }, []);

  const unhideProperty = useCallback((propertyId: string) => {
    if (!globalIds.has(propertyId)) return;

    globalEntries = globalEntries.filter(e => e.propertyId !== propertyId);
    globalIds.delete(propertyId);
    persist();
    notifyAll();
  }, []);

  const isHidden = useCallback((propertyId: string) => {
    return globalIds.has(propertyId);
  }, []);

  const clearAll = useCallback(async () => {
    globalEntries = [];
    globalIds.clear();
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
