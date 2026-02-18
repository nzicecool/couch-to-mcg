/**
 * Storage Adapter Interface
 * Provides a unified interface for data storage across platforms
 */

export interface StorageAdapter {
  /**
   * Get a value from storage
   * @param key Storage key
   * @returns Promise resolving to the value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in storage
   * @param key Storage key
   * @param value Value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage
   * @param key Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all values from storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   * @returns Promise resolving to array of keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Check if a key exists in storage
   * @param key Storage key
   * @returns Promise resolving to true if key exists
   */
  has(key: string): Promise<boolean>;
}

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  COMPLETED_DATES: 'couchToMcgCompleted',
  PROFILE: 'couchToMcgProfile',
  RUN_LOGS: 'couchToMcgLogs',
  OVERRIDES: 'couchToMcgOverrides',
  CUSTOM_ACTIVITIES: 'couchToMcgCustomActivities',
  SYNC_METADATA: 'couchToMcgSyncMetadata',
  DEVICE_ID: 'couchToMcgDeviceId',
} as const;
