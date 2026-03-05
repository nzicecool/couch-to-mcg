import { STORAGE_KEYS } from './constants';

const DB_NAME = 'CouchToMCG';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('data')) {
        database.createObjectStore('data');
      }
    };
  });
};

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result ?? null);
      });
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        const request = store.put(value, key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};
