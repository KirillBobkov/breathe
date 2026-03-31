/**
 * Storage abstraction layer types
 * Provides a unified interface for browser storage operations with error handling
 */

/**
 * Base error class for storage-related errors
 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Error thrown when storage quota is exceeded
 */
export class StorageQuotaExceededError extends StorageError {
  constructor(message: string = 'Storage quota exceeded', cause?: unknown) {
    super(message, cause);
    this.name = 'StorageQuotaExceededError';
  }
}

/**
 * Error thrown when data validation fails
 */
export class StorageValidationError extends StorageError {
  constructor(message: string, public readonly validationErrors?: unknown) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

/**
 * Error thrown when parsing stored data fails
 */
export class StorageParseError extends StorageError {
  constructor(message: string = 'Failed to parse stored data', cause?: unknown) {
    super(message, cause);
    this.name = 'StorageParseError';
  }
}

/**
 * Generic key-value storage interface
 * Abstracts the underlying storage mechanism (localStorage, sessionStorage, etc.)
 */
export interface IStorage {
  /**
   * Retrieve a value by key
   * @param key - The storage key
   * @returns The stored value or null if not found
   * @throws {StorageError} If retrieval fails
   */
  get<T>(key: string): T | null;

  /**
   * Store a value by key
   * @param key - The storage key
   * @param value - The value to store (must be JSON-serializable)
   * @throws {StorageQuotaExceededError} If storage quota is exceeded
   * @throws {StorageError} If storage operation fails
   */
  set<T>(key: string, value: T): void;

  /**
   * Remove a value by key
   * @param key - The storage key
   * @throws {StorageError} If removal fails
   */
  remove(key: string): void;

  /**
   * Check if a key exists in storage
   * @param key - The storage key
   * @returns True if the key exists, false otherwise
   */
  has(key: string): boolean;

  /**
   * Clear all stored values
   * @throws {StorageError} If clearing fails
   */
  clear(): void;

  /**
   * Get all keys in storage
   * @returns Array of all storage keys
   */
  keys(): string[];
}

/**
 * Result type for operations that may fail
 */
export type Result<T, E = StorageError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Storage options for configuring persistence behavior
 */
export interface StorageOptions {
  /**
   * Namespace prefix for all keys (prevents collisions)
   */
  namespace?: string;

  /**
   * Maximum number of items to store (0 = unlimited)
   */
  maxItems?: number;

  /**
   * TTL for stored items in milliseconds (0 = no expiration)
   */
  ttl?: number;
}

/**
 * Metadata for stored items
 */
export interface StoredItemMetadata {
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

/**
 * Stored item with metadata
 */
export interface StoredItem<T> {
  data: T;
  meta: StoredItemMetadata;
}
