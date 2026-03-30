/**
 * Vitest setup file
 * Configures global test utilities and mocks
 */

import { vi } from 'vitest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Store reset helpers
export const createStoreReset = <T extends { reset: () => void }>(store: T) => {
  return () => {
    store.reset();
    // Clear any Zustand devtools state
    vi.clearAllMocks();
  };
};
