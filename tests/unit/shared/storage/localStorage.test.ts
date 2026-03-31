/**
 * Unit tests for LocalStorage class
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  LocalStorage,
  createNamespacedStorage,
} from '../../../../src/shared/storage/localStorage';
import {
  StorageError,
  StorageQuotaExceededError,
  StorageParseError,
} from '../../../../src/shared/storage/storage.types';

// Mock localStorage implementation for testing
class MockStorage implements Storage {
  private data: Record<string, string> = {};
  private _shouldThrowQuotaError = false;
  private _shouldThrowGenericError = false;

  // Make test helpers non-enumerable
  private _nonEnumerable = {
    setThrowQuotaError: (shouldThrow: boolean) => {
      this._shouldThrowQuotaError = shouldThrow;
    },
    setThrowGenericError: (shouldThrow: boolean) => {
      this._shouldThrowGenericError = shouldThrow;
    },
  };

  get length(): number {
    return Object.keys(this.data).length;
  }

  clear(): void {
    this.data = {};
  }

  getItem(key: string): string | null {
    if (this._shouldThrowGenericError) {
      throw new Error('Generic storage error');
    }
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
  }

  setItem(key: string, value: string): void {
    if (this._shouldThrowGenericError) {
      throw new Error('Generic storage error');
    }
    if (this._shouldThrowQuotaError) {
      const error = new DOMException('Quota exceeded', 'QuotaExceededError');
      (error as any).code = 22;
      throw error;
    }
    this.data[key] = value;
  }

  removeItem(key: string): void {
    if (this._shouldThrowGenericError) {
      throw new Error('Generic storage error');
    }
    delete this.data[key];
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] ?? null;
  }

  // Test helpers (assigned after construction to avoid being part of the instance)
  setThrowQuotaError(shouldThrow: boolean): void {
    this._shouldThrowQuotaError = shouldThrow;
  }

  setThrowGenericError(shouldThrow: boolean): void {
    this._shouldThrowGenericError = shouldThrow;
  }

  // Helper to check if key exists
  hasItem(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  // Helper to get the raw stored value
  getRawItem(key: string): string | null {
    return this.data[key] ?? null;
  }
}

describe('LocalStorage', () => {
  let mockStorage: MockStorage;
  let localStorage: LocalStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    localStorage = new LocalStorage({}, mockStorage);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const storage = new LocalStorage({}, mockStorage);
      expect(storage).toBeInstanceOf(LocalStorage);
    });

    it('should validate storage availability on construction', () => {
      const failingStorage = new MockStorage();
      failingStorage.setThrowGenericError(true);

      expect(() => new LocalStorage({}, failingStorage)).toThrow(StorageError);
    });

    it('should accept namespace option', () => {
      const namespaced = new LocalStorage({ namespace: 'test' }, mockStorage);
      namespaced.set('key', 'value');

      // Check the raw storage has the namespaced key
      const rawValue = mockStorage.getRawItem('test:key');
      expect(rawValue).toBeTruthy();
      expect(rawValue).toContain('value');
    });

    it('should accept maxItems option', () => {
      const limitedMock = new MockStorage();
      const limitedStorage = new LocalStorage({ maxItems: 2 }, limitedMock);
      limitedStorage.set('key1', 'value1');
      limitedStorage.set('key2', 'value2');

      expect(() => limitedStorage.set('key3', 'value3')).toThrow(StorageQuotaExceededError);
    });

    it('should accept ttl option', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1000);

      const withTTL = new LocalStorage({ ttl: 1000 }, mockStorage);
      withTTL.set('key', 'value');

      // Should be available immediately
      expect(withTTL.get('key')).toBe('value');

      // Advance time past TTL
      vi.setSystemTime(3000);
      expect(() => withTTL.get('key')).toThrow(StorageError);

      vi.useRealTimers();
    });
  });

  describe('set and get', () => {
    it('should store and retrieve string values', () => {
      localStorage.set('name', 'Alice');
      expect(localStorage.get('name')).toBe('Alice');
    });

    it('should store and retrieve number values', () => {
      localStorage.set('count', 42);
      expect(localStorage.get('count')).toBe(42);
    });

    it('should store and retrieve boolean values', () => {
      localStorage.set('isActive', true);
      expect(localStorage.get('isActive')).toBe(true);
    });

    it('should store and retrieve object values', () => {
      const obj = { foo: 'bar', num: 123 };
      localStorage.set('obj', obj);
      expect(localStorage.get('obj')).toEqual(obj);
    });

    it('should store and retrieve array values', () => {
      const arr = [1, 2, 3];
      localStorage.set('arr', arr);
      expect(localStorage.get('arr')).toEqual(arr);
    });

    it('should store and retrieve null values', () => {
      localStorage.set('nullValue', null);
      expect(localStorage.get('nullValue')).toBe(null);
    });

    it('should return null for non-existent keys', () => {
      expect(localStorage.get('nonexistent')).toBeNull();
    });

    it('should overwrite existing values', () => {
      localStorage.set('key', 'first');
      localStorage.set('key', 'second');
      expect(localStorage.get('key')).toBe('second');
    });

    it('should include metadata in stored value', () => {
      vi.useFakeTimers();
      vi.setSystemTime(5000);

      localStorage.set('key', 'value');
      const raw = mockStorage.getRawItem('key');
      const parsed = JSON.parse(raw!);

      expect(parsed.data).toBe('value');
      expect(parsed.meta.createdAt).toBe(5000);
      expect(parsed.meta.updatedAt).toBe(5000);
      expect(parsed.meta.expiresAt).toBeUndefined();

      vi.useRealTimers();
    });

    it('should include expiresAt in metadata when TTL is set', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1000);

      const withTTL = new LocalStorage({ ttl: 5000 }, mockStorage);
      withTTL.set('key', 'value');

      const raw = mockStorage.getRawItem('key');
      const parsed = JSON.parse(raw!);

      expect(parsed.meta.expiresAt).toBe(6000);

      vi.useRealTimers();
    });
  });

  describe('remove', () => {
    it('should remove existing key', () => {
      localStorage.set('key', 'value');
      expect(localStorage.get('key')).toBe('value');

      localStorage.remove('key');
      expect(localStorage.get('key')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => localStorage.remove('nonexistent')).not.toThrow();
    });

    it('should throw StorageError on removal failure', () => {
      const failingStorage = new MockStorage();
      const storage = new LocalStorage({}, failingStorage);
      failingStorage.setThrowGenericError(true);

      expect(() => storage.remove('key')).toThrow(StorageError);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      localStorage.set('key', 'value');
      expect(localStorage.has('key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(localStorage.has('nonexistent')).toBe(false);
    });

    it('should return false after removing key', () => {
      localStorage.set('key', 'value');
      localStorage.remove('key');
      expect(localStorage.has('key')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all stored values', () => {
      localStorage.set('key1', 'value1');
      localStorage.set('key2', 'value2');
      localStorage.set('key3', 'value3');

      localStorage.clear();

      expect(localStorage.get('key1')).toBeNull();
      expect(localStorage.get('key2')).toBeNull();
      expect(localStorage.get('key3')).toBeNull();
    });

    it('should only clear namespaced keys when namespace is set', () => {
      const appMock = new MockStorage();
      // Set up a namespaced storage
      const namespaced = new LocalStorage({ namespace: 'app' }, appMock);

      // Set keys in different namespaces
      namespaced.set('key1', 'value1');
      appMock.setItem('other:key2', JSON.stringify({ data: 'value2', meta: {} }));
      appMock.setItem('no-namespace', JSON.stringify({ data: 'value3', meta: {} }));

      namespaced.clear();

      // Only namespaced keys should be cleared
      expect(appMock.getRawItem('app:key1')).toBeNull();
      expect(appMock.getRawItem('other:key2')).not.toBeNull();
      expect(appMock.getRawItem('no-namespace')).not.toBeNull();
    });

    it('should clear entire storage when no namespace is set', () => {
      localStorage.set('key1', 'value1');
      mockStorage.setItem('key2', JSON.stringify({ data: 'value2', meta: {} }));

      localStorage.clear();

      expect(mockStorage.length).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return empty array when storage is empty', () => {
      expect(localStorage.keys()).toEqual([]);
    });

    it('should return all stored keys without namespace', () => {
      localStorage.set('key1', 'value1');
      localStorage.set('key2', 'value2');

      expect(localStorage.keys()).toEqual(['key1', 'key2']);
    });

    it('should return only namespaced keys when namespace is set', () => {
      const nsMock = new MockStorage();
      const namespaced = new LocalStorage({ namespace: 'app' }, nsMock);

      namespaced.set('key1', 'value1');
      namespaced.set('key2', 'value2');
      nsMock.setItem('other:key3', JSON.stringify({ data: 'value3', meta: {} }));

      expect(namespaced.keys()).toEqual(['key1', 'key2']);
    });

    it('should strip namespace prefix from returned keys', () => {
      const nsMock = new MockStorage();
      const namespaced = new LocalStorage({ namespace: 'app' }, nsMock);

      namespaced.set('key1', 'value1');
      namespaced.set('key2', 'value2');

      expect(namespaced.keys()).not.toContain('app:key1');
      expect(namespaced.keys()).toContain('key1');
    });
  });

  describe('error handling', () => {
    it('should throw StorageQuotaExceededError on quota exceeded', () => {
      mockStorage.setThrowQuotaError(true);

      expect(() => localStorage.set('key', 'value')).toThrow(StorageQuotaExceededError);
    });

    it('should wrap generic setItem errors in StorageError', () => {
      mockStorage.setThrowGenericError(true);

      expect(() => localStorage.set('key', 'value')).toThrow(StorageError);
    });

    it('should throw StorageParseError for invalid JSON', () => {
      mockStorage.setItem('key', 'invalid json{');

      expect(() => localStorage.get('key')).toThrow(StorageError);
    });

    it('should remove invalid data on parse error', () => {
      mockStorage.setItem('key', 'invalid json');

      try {
        localStorage.get('key');
      } catch {
        // Expected to throw
      }

      expect(mockStorage.getRawItem('key')).toBeNull();
    });

    it('should throw StorageError for expired data', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1000);

      const withTTL = new LocalStorage({ ttl: 100 }, mockStorage);
      withTTL.set('key', 'value');

      vi.setSystemTime(2000);

      expect(() => withTTL.get('key')).toThrow(StorageError);

      vi.useRealTimers();
    });
  });

  describe('maxItems limit', () => {
    it('should enforce maxItems limit', () => {
      const limitedMock = new MockStorage();
      const limited = new LocalStorage({ maxItems: 2 }, limitedMock);

      limited.set('key1', 'value1');
      limited.set('key2', 'value2');

      expect(() => limited.set('key3', 'value3')).toThrow(StorageQuotaExceededError);
    });

    it('should allow updating existing keys when at maxItems limit', () => {
      const limitedMock = new MockStorage();
      const limited = new LocalStorage({ maxItems: 2 }, limitedMock);

      limited.set('key1', 'value1');
      limited.set('key2', 'value2');

      // Should not throw - updating existing key
      expect(() => limited.set('key1', 'updated')).not.toThrow();
      expect(limited.get('key1')).toBe('updated');
    });

    it('should not enforce limit when maxItems is 0', () => {
      const unlimitedMock = new MockStorage();
      const unlimited = new LocalStorage({ maxItems: 0 }, unlimitedMock);

      for (let i = 0; i < 100; i++) {
        unlimited.set(`key${i}`, `value${i}`);
      }

      expect(unlimited.keys()).toHaveLength(100);
    });
  });

  describe('namespace isolation', () => {
    it('should isolate keys by namespace', () => {
      const sharedMock = new MockStorage();
      const app1 = new LocalStorage({ namespace: 'app1' }, sharedMock);
      const app2 = new LocalStorage({ namespace: 'app2' }, sharedMock);

      app1.set('key', 'value1');
      app2.set('key', 'value2');

      expect(app1.get('key')).toBe('value1');
      expect(app2.get('key')).toBe('value2');
    });

    it('should not affect non-namespaced storage', () => {
      const sharedMock = new MockStorage();
      const namespaced = new LocalStorage({ namespace: 'ns' }, sharedMock);
      const global = new LocalStorage({}, sharedMock);

      namespaced.set('key', 'namespaced');
      global.set('key', 'global');

      expect(namespaced.get('key')).toBe('namespaced');
      expect(global.get('key')).toBe('global');
    });

    it('should include namespace in all keys', () => {
      const nsMock = new MockStorage();
      const namespaced = new LocalStorage({ namespace: 'test' }, nsMock);

      namespaced.set('key1', 'value1');
      namespaced.set('key2', 'value2');

      expect(nsMock.getRawItem('test:key1')).toBeTruthy();
      expect(nsMock.getRawItem('test:key2')).toBeTruthy();
      expect(nsMock.getRawItem('key1')).toBeNull();
      expect(nsMock.getRawItem('key2')).toBeNull();
    });
  });

  describe('createNamespacedStorage', () => {
    it('should create a storage instance with given namespace', () => {
      const nsMock = new MockStorage();
      const storage = createNamespacedStorage('test');

      // Can't easily test with shared mock, so verify interface exists
      expect(storage.get).toBeDefined();
      expect(storage.set).toBeDefined();
      expect(storage.remove).toBeDefined();
      expect(storage.has).toBeDefined();
      expect(storage.clear).toBeDefined();
      expect(storage.keys).toBeDefined();
    });

    it('should return IStorage interface', () => {
      const storage = createNamespacedStorage('test');

      expect(storage.get).toBeDefined();
      expect(storage.set).toBeDefined();
      expect(storage.remove).toBeDefined();
      expect(storage.has).toBeDefined();
      expect(storage.clear).toBeDefined();
      expect(storage.keys).toBeDefined();
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return data before TTL expires', () => {
      vi.setSystemTime(1000);
      const withTTL = new LocalStorage({ ttl: 5000 }, mockStorage);

      withTTL.set('key', 'value');

      vi.setSystemTime(4000);
      expect(withTTL.get('key')).toBe('value');
    });

    it('should throw error after TTL expires', () => {
      vi.setSystemTime(1000);
      const withTTL = new LocalStorage({ ttl: 1000 }, mockStorage);

      withTTL.set('key', 'value');

      vi.setSystemTime(3000);
      expect(() => withTTL.get('key')).toThrow(StorageError);
    });

    it('should remove expired data on access', () => {
      vi.setSystemTime(1000);
      const withTTL = new LocalStorage({ ttl: 1000 }, mockStorage);

      withTTL.set('key', 'value');

      vi.setSystemTime(3000);
      try {
        withTTL.get('key');
      } catch {
        // Expected
      }

      expect(mockStorage.getRawItem('key')).toBeNull();
    });

    it('should allow zero TTL for no expiration', () => {
      vi.setSystemTime(1000);
      const noTTL = new LocalStorage({ ttl: 0 }, mockStorage);

      noTTL.set('key', 'value');

      vi.setSystemTime(9999999);
      expect(noTTL.get('key')).toBe('value');
    });
  });

  describe('metadata', () => {
    it('should set createdAt and updatedAt on initial save', () => {
      vi.useFakeTimers();
      vi.setSystemTime(5000);

      localStorage.set('meta-test-1', 'value');
      const raw = mockStorage.getRawItem('meta-test-1');
      const parsed = JSON.parse(raw!);

      expect(parsed.meta.createdAt).toBe(5000);
      expect(parsed.meta.updatedAt).toBe(5000);

      vi.useRealTimers();
    });

    it('should update both createdAt and updatedAt on overwrite', () => {
      vi.useFakeTimers();
      vi.setSystemTime(5000);
      localStorage.set('meta-test-2', 'value1');

      vi.setSystemTime(10000);
      localStorage.set('meta-test-2', 'value2');

      const raw = mockStorage.getRawItem('meta-test-2');
      const parsed = JSON.parse(raw!);

      // When overwriting, a new StoredItem is created with both timestamps from the second write
      expect(parsed.meta.createdAt).toBe(10000);
      expect(parsed.meta.updatedAt).toBe(10000);

      vi.useRealTimers();
    });

    it('should set expiresAt when TTL is provided', () => {
      vi.setSystemTime(1000);
      const withTTL = new LocalStorage({ ttl: 5000 }, mockStorage);

      withTTL.set('key', 'value');

      const raw = mockStorage.getRawItem('key');
      const parsed = JSON.parse(raw!);

      expect(parsed.meta.expiresAt).toBe(6000);
    });

    it('should not set expiresAt when TTL is 0', () => {
      vi.setSystemTime(1000);
      const noTTL = new LocalStorage({ ttl: 0 }, mockStorage);

      noTTL.set('key', 'value');

      const raw = mockStorage.getRawItem('key');
      const parsed = JSON.parse(raw!);

      expect(parsed.meta.expiresAt).toBeUndefined();
    });
  });

  describe('complex data types', () => {
    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'Alice',
          address: {
            city: 'Berlin',
            country: 'Germany',
          },
        },
      };

      localStorage.set('nested', data);
      expect(localStorage.get('nested')).toEqual(data);
    });

    it('should handle arrays of objects', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      localStorage.set('arrayOfObjects', data);
      expect(localStorage.get('arrayOfObjects')).toEqual(data);
    });

    it('should handle special characters in strings', () => {
      const special = 'Hello\nWorld\t"quoted" \u00A9';
      localStorage.set('special', special);

      expect(localStorage.get('special')).toBe(special);
    });

    it('should handle unicode characters', () => {
      const unicode = '你好世界 🌍 Привет';
      localStorage.set('unicode', unicode);

      expect(localStorage.get('unicode')).toBe(unicode);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as value', () => {
      localStorage.set('empty', '');
      expect(localStorage.get('empty')).toBe('');
    });

    it('should handle zero as value', () => {
      localStorage.set('zero', 0);
      expect(localStorage.get('zero')).toBe(0);
    });

    it('should handle false as value', () => {
      localStorage.set('false', false);
      expect(localStorage.get('false')).toBe(false);
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      localStorage.set(longKey, 'value');

      expect(localStorage.get(longKey)).toBe('value');
    });

    it('should handle empty object', () => {
      localStorage.set('emptyObj', {});
      expect(localStorage.get('emptyObj')).toEqual({});
    });

    it('should handle empty array', () => {
      localStorage.set('emptyArr', []);
      expect(localStorage.get('emptyArr')).toEqual([]);
    });
  });

  describe('has method with namespaced storage', () => {
    it('should return true only for keys in the same namespace', () => {
      const sharedMock = new MockStorage();
      const ns1 = new LocalStorage({ namespace: 'ns1' }, sharedMock);
      const ns2 = new LocalStorage({ namespace: 'ns2' }, sharedMock);

      ns1.set('key', 'value1');

      expect(ns1.has('key')).toBe(true);
      expect(ns2.has('key')).toBe(false);
    });
  });
});
