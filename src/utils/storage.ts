/**
 * Safe Storage utility for cross-origin iframe and restricted environments.
 * Prevents SecurityError / DOMException crashes when window.localStorage is blocked.
 */

const memoryFallback = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Access denied or blocked by iframe security sandbox
    }
    return memoryFallback.get(key) ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Storage blocked
    }
    memoryFallback.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Storage blocked
    }
    memoryFallback.delete(key);
  },

  getParsedItem: <T>(key: string, fallback: T): T => {
    try {
      const raw = safeStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== undefined && parsed !== null ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }
};
