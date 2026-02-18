import * as SQLite from 'expo-sqlite';
import { StorageAdapter } from '@couch-to-mcg/core';

/**
 * SQLite Storage Adapter for React Native
 * Provides persistent storage using SQLite database
 */
export class SQLiteStorageAdapter implements StorageAdapter {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName: string;

  constructor(dbName: string = 'couch-to-mcg.db') {
    this.dbName = dbName;
  }

  /**
   * Initialize the database and create tables if needed
   */
  private async initDB(): Promise<SQLite.SQLiteDatabase> {
    if (this.db) return this.db;

    this.db = await SQLite.openDatabaseAsync(this.dbName);
    
    // Create key-value storage table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS storage (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    return this.db;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      const result = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM storage WHERE key = ?',
        [key]
      );

      if (!result) return null;
      return JSON.parse(result.value) as T;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.initDB();
      const jsonValue = JSON.stringify(value);
      const timestamp = Date.now();

      await db.runAsync(
        'INSERT OR REPLACE INTO storage (key, value, updated_at) VALUES (?, ?, ?)',
        [key, jsonValue, timestamp]
      );
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.initDB();
      await db.runAsync('DELETE FROM storage WHERE key = ?', [key]);
    } catch (error) {
      console.error(`Error removing key ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.initDB();
      await db.runAsync('DELETE FROM storage');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.initDB();
      const results = await db.getAllAsync<{ key: string }>(
        'SELECT key FROM storage'
      );
      return results.map(row => row.key);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM storage WHERE key = ?',
        [key]
      );
      return (result?.count ?? 0) > 0;
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}
