/**
 * Purpose: Provides a safe session-backed storage adapter for browser code and local tests.
 * Used by: localAuth, localEntities, and local client data facades.
 * Main dependencies: none.
 * Public functions: getStorage, readJson, writeJson.
 * Side effects: Reads and writes browser sessionStorage when available.
 */
const createMemoryStorage = () => {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
};

const memoryStorage = createMemoryStorage();

export const getStorage = () => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }

  if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
    return globalThis.sessionStorage;
  }

  return memoryStorage;
};

export const readJson = (key, fallbackValue) => {
  const rawValue = getStorage().getItem(key);
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
};

export const writeJson = (key, value) => {
  getStorage().setItem(key, JSON.stringify(value));
};
