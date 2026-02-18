import Dexie, { Table } from 'dexie';
import { StorageAdapter } from '@couch-to-mcg/core';

interface StorageItem {
  key: string;
  value: string;
  updatedAt: number;
}

/**
 * IndexedDB Storage Adapter for Web
 * Provides persistent storage using IndexedDB via Dexie
 */
class CouchToMCGDatabase extends Dexie {
  storage!: Table<StorageItem, string>;

  constructor() {
    super('CouchToMCGDatabase');
    this.version(1).stores({
      storage: 'key, updatedAt',
    });
  }
}

export class IndexedDBStorageAdapter implements StorageAdapter {
  private db: CouchToMCGDatabase;

  constructor() {
    this.db = new CouchToMCGDatabase();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await this.db.storage.get(key);
      if (!item) return null;
      return JSON.parse(item.value) as T;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      const timestamp = Date.now();
      await this.db.storage.put({
        key,
        value: jsonValue,
        updatedAt: timestamp,
      });
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.db.storage.delete(key);
    } catch (error) {
      console.error(`Error removing key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.db.storage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const items = await this.db.storage.toArray();
      return items.map(item => item.key);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const item = await this.db.storage.get(key);
      return item !== undefined;
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
