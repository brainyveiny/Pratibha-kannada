'use client';

import { useSyncExternalStore } from 'react';

export type LanguageMode = 'kannada' | 'english';

export const LANGUAGE_MODE_KEY = 'pratibha_language_mode';
export const SEARCH_MODE_COOKIE_KEY = 'pratibha_search_mode';

const listeners = new Set<() => void>();

let currentMode: LanguageMode = 'kannada';
let isInitialized = false;

function normalizeMode(val: string | null | undefined): LanguageMode {
  if (!val) return 'kannada';
  const clean = val.toLowerCase().trim();
  if (clean === 'english' || clean === 'en') return 'english';
  return 'kannada';
}

function readClientStorage(): LanguageMode {
  if (typeof window === 'undefined') return 'kannada';
  try {
    const local = localStorage.getItem(LANGUAGE_MODE_KEY);
    if (local) return normalizeMode(local);

    const match = document.cookie.match(/(?:^|;\s*)pratibha_language_mode=([^;]*)/);
    if (match) return normalizeMode(match[1]);

    const legacyMatch = document.cookie.match(/(?:^|;\s*)pratibha_search_mode=([^;]*)/);
    if (legacyMatch) return normalizeMode(legacyMatch[1]);
  } catch {
    // Storage access blocked or unavailable
  }
  return 'kannada';
}

function initModeIfNeeded() {
  if (!isInitialized && typeof window !== 'undefined') {
    currentMode = readClientStorage();
    isInitialized = true;
  }
}

/**
 * Set the global persistent language mode across the entire application.
 * Synchronizes localStorage, session cookies, internal state, and broadcasts
 * across all mounted components and other browser tabs.
 */
export function setGlobalLanguageMode(mode: LanguageMode) {
  const normalized = normalizeMode(mode);
  if (currentMode === normalized && isInitialized) return;

  currentMode = normalized;
  isInitialized = true;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_MODE_KEY, normalized);
      // Keep legacy search mode key in sync for backwards compatibility
      localStorage.setItem('pratibha_search_mode', normalized === 'english' ? 'en' : 'kn');

      // Set cookie (1 year expiry, site-wide, Lax)
      const shortCode = normalized === 'english' ? 'en' : 'kn';
      document.cookie = `${LANGUAGE_MODE_KEY}=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `${SEARCH_MODE_COOKIE_KEY}=${shortCode}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Storage access blocked or private browsing restrictions
    }

    // Broadcast change for same-page non-React listeners
    window.dispatchEvent(
      new CustomEvent('pratibha:language-mode-change', { detail: { mode: normalized } })
    );
  }

  // Notify all useSyncExternalStore subscribers
  listeners.forEach((listener) => listener());
}

/**
 * Toggle between 'kannada' and 'english' mode globally.
 */
export function toggleGlobalLanguageMode(): LanguageMode {
  initModeIfNeeded();
  const nextMode: LanguageMode = currentMode === 'kannada' ? 'english' : 'kannada';
  setGlobalLanguageMode(nextMode);
  return nextMode;
}

function subscribe(callback: () => void) {
  initModeIfNeeded();
  listeners.add(callback);

  // Cross-tab synchronization via storage event
  const handleStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_MODE_KEY && event.newValue) {
      const newMode = normalizeMode(event.newValue);
      if (newMode !== currentMode) {
        currentMode = newMode;
        listeners.forEach((l) => l());
      }
    }
  };

  // Custom event listener for custom triggers
  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<{ mode: LanguageMode }>;
    if (custom.detail?.mode && custom.detail.mode !== currentMode) {
      currentMode = custom.detail.mode;
      listeners.forEach((l) => l());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pratibha:language-mode-change', handleCustomEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pratibha:language-mode-change', handleCustomEvent);
    }
  };
}

function getSnapshot(): LanguageMode {
  initModeIfNeeded();
  return currentMode;
}

function getServerSnapshot(): LanguageMode {
  return 'kannada';
}

/**
 * React hook to consume and update the single persistent global language mode.
 * Safe from hydration mismatches and immediately synchronized across all components.
 */
export function useLanguageMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    mode,
    isEnglish: mode === 'english',
    isKannada: mode === 'kannada',
    setMode: setGlobalLanguageMode,
    toggleMode: toggleGlobalLanguageMode,
  };
}
