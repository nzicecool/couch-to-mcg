/**
 * Sync Service Interface
 * Provides optional remote synchronization functionality
 */

export interface SyncMetadata {
  lastSyncTime: number | null;
  deviceId: string;
  syncEnabled: boolean;
}

export interface SyncConfig {
  apiKey?: string;
  projectId?: string;
  authDomain?: string;
  userId?: string;
}

export interface SyncService {
  /**
   * Initialize the sync service with configuration
   */
  initialize(config: SyncConfig): Promise<void>;

  /**
   * Check if sync is enabled and configured
   */
  isEnabled(): boolean;

  /**
   * Sync local data to remote storage
   * @param key Storage key
   * @param data Data to sync
   */
  syncToRemote<T>(key: string, data: T): Promise<void>;

  /**
   * Fetch data from remote storage
   * @param key Storage key
   */
  fetchFromRemote<T>(key: string): Promise<T | null>;

  /**
   * Perform full bidirectional sync
   * Resolves conflicts using last-write-wins strategy
   */
  performFullSync(): Promise<void>;

  /**
   * Enable or disable automatic sync
   */
  setAutoSync(enabled: boolean): void;

  /**
   * Get sync metadata
   */
  getSyncMetadata(): Promise<SyncMetadata>;
}

/**
 * Sync status for UI feedback
 */
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  DISABLED = 'disabled',
}

/**
 * Sync event for listening to sync state changes
 */
export interface SyncEvent {
  status: SyncStatus;
  message?: string;
  timestamp: number;
}
