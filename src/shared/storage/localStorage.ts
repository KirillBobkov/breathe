/**
 * localStorage wrapper with error handling and namespacing
 * Provides a safe abstraction over browser localStorage with proper error handling
 */

import type {
  IStorage,
  StorageOptions,
  StoredItem,
} from './storage.types';
import {
  StorageError,
  StorageQuotaExceededError,
  StorageParseError,
} from './storage.types';

/**
 * Default storage options
 */
const DEFAULT_OPTIONS: Required<StorageOptions> = {
  namespace: '',
  maxItems: 0,
  ttl: 0,
};

/**
 * localStorage implementation of IStorage interface
 * Handles browser localStorage with proper error handling and namespacing
 */
export class LocalStorage implements IStorage {
  private readonly options: Required<StorageOptions>;
  private readonly storage: Storage;

  /**
   * @param options - Storage configuration options
   * @param storage - The underlying storage implementation (defaults to window.localStorage)
   */
  constructor(options: StorageOptions = {}, storage: Storage = window.localStorage) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.storage = storage;

    // Validate localStorage availability
    this.validateStorage();
  }

  /**
   * Validate that localStorage is available and functional
   * @throws {StorageError} If localStorage is not available
   */
  private validateStorage(): void {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
    } catch (error) {
      throw new StorageError('localStorage is not available', error);
    }
  }

  /**
   * Get the full key with namespace prefix
   */
  private getKey(key: string): string {
    return this.options.namespace ? `${this.options.namespace}:${key}` : key;
  }

  /**
   * Serialize a value with metadata
   */
  private serialize<T>(value: T): string {
    const item: StoredItem<T> = {
      data: value,
      meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: this.options.ttl ? Date.now() + this.options.ttl : undefined,
      },
    };
    return JSON.stringify(item);
  }

  /**
   * Deserialize a value with metadata validation
   * @throws {StorageParseError} If parsing fails or data is expired
   */
  private deserialize<T>(raw: string): T {
    try {
      const item: StoredItem<T> = JSON.parse(raw);

      // Check expiration
      if (item.meta.expiresAt && Date.now() > item.meta.expiresAt) {
        throw new StorageParseError('Stored data has expired');
      }

      return item.data;
    } catch (error) {
      if (error instanceof StorageParseError) {
        throw error;
      }
      throw new StorageParseError('Failed to deserialize stored data', error);
    }
  }

  /**
   * Retrieve a value by key
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.getKey(key);
      const raw = this.storage.getItem(fullKey);

      if (raw === null) {
        return null;
      }

      return this.deserialize<T>(raw);
    } catch (error) {
      if (error instanceof StorageParseError) {
        // Remove invalid/expired data
        this.remove(key);
      }
      throw new StorageError(`Failed to get key "${key}"`, error);
    }
  }

  /**
   * Store a value by key
   */
  set<T>(key: string, value: T): void {
    try {
      // Check max items limit
      if (this.options.maxItems > 0) {
        const currentKeys = this.keys();
        if (!this.has(key) && currentKeys.length >= this.options.maxItems) {
          throw new StorageQuotaExceededError(
            `Maximum storage limit of ${this.options.maxItems} items reached`
          );
        }
      }

      const fullKey = this.getKey(key);
      const serialized = this.serialize(value);
      this.storage.setItem(fullKey, serialized);
    } catch (error) {
      // Re-throw StorageQuotaExceededError as-is
      if (error instanceof StorageQuotaExceededError) {
        throw error;
      }
      if (this.isQuotaError(error)) {
        throw new StorageQuotaExceededError('localStorage quota exceeded', error);
      }
      throw new StorageError(`Failed to set key "${key}"`, error);
    }
  }

  /**
   * Remove a value by key
   */
  remove(key: string): void {
    try {
      const fullKey = this.getKey(key);
      this.storage.removeItem(fullKey);
    } catch (error) {
      throw new StorageError(`Failed to remove key "${key}"`, error);
    }
  }

  /**
   * Check if a key exists in storage
   */
  has(key: string): boolean {
    try {
      const fullKey = this.getKey(key);
      return this.storage.getItem(fullKey) !== null;
    } catch (error) {
      throw new StorageError(`Failed to check key "${key}"`, error);
    }
  }

  /**
   * Clear all stored values (only those with the namespace prefix)
   */
  clear(): void {
    try {
      if (this.options.namespace) {
        // Only remove keys with the namespace prefix
        const keysToRemove = this.keys();
        keysToRemove.forEach((key) => this.remove(key));
      } else {
        // Clear all storage
        this.storage.clear();
      }
    } catch (error) {
      throw new StorageError('Failed to clear storage', error);
    }
  }

  /**
   * Get all keys in storage (only those with the namespace prefix)
   */
  keys(): string[] {
    try {
      const prefix = this.options.namespace ? `${this.options.namespace}:` : '';
      const allKeys: string[] = [];

      // Use the Storage interface's length and key() methods to iterate
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          allKeys.push(key);
        }
      }

      if (!prefix) {
        return allKeys;
      }

      return allKeys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length));
    } catch (error) {
      throw new StorageError('Failed to get storage keys', error);
    }
  }

  /**
   * Check if an error is a quota exceeded error
   */
  private isQuotaError(error: unknown): boolean {
    if (error instanceof DOMException) {
      return (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        // Firefox
        error.code === 22 ||
        // Chrome/Safari
        error.code === 1014
      );
    }
    return false;
  }
}

/**
 * Create a namespaced localStorage instance
 * @param namespace - Namespace prefix for all keys
 * @returns A LocalStorage instance with the given namespace
 */
export function createNamespacedStorage(namespace: string): IStorage {
  return new LocalStorage({ namespace });
}

/**
 * Default app storage instance with 'breathe' namespace
 */
export const appStorage = new LocalStorage({ namespace: 'breathe' });
