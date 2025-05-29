// indexedDBManager.js
class IndexedDBManager {
  constructor() {
    this.dbName = 'PayerDataDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for unique values
        if (!db.objectStoreNames.contains('uniqueValues')) {
          const store = db.createObjectStore('uniqueValues', {
            keyPath: 'type',
          });
          store.createIndex('type', 'type', { unique: true });
        }
      };
    });
  }

  async getUniqueValues(type) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uniqueValues'], 'readonly');
      const store = transaction.objectStore('uniqueValues');
      const request = store.get(type);

      request.onsuccess = () => {
        resolve(request.result?.data || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setUniqueValues(type, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uniqueValues'], 'readwrite');
      const store = transaction.objectStore('uniqueValues');
      const request = store.put({
        type,
        data,
        lastUpdated: new Date().toISOString(),
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addUniqueValue(type, newValue) {
    const existingData = await this.getUniqueValues(type);

    // Check if value already exists (case-insensitive)
    const valueExists = existingData.some(
      (item) => item.toLowerCase() === newValue.toLowerCase()
    );

    if (!valueExists) {
      const updatedData = [...existingData, newValue];
      await this.setUniqueValues(type, updatedData);
      return updatedData;
    }

    return existingData;
  }

  async getAllUniqueValues() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uniqueValues'], 'readonly');
      const store = transaction.objectStore('uniqueValues');
      const request = store.getAll();

      request.onsuccess = () => {
        const result = {};
        request.result.forEach((item) => {
          result[item.type] = item.data;
        });
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['uniqueValues'], 'readwrite');
      const store = transaction.objectStore('uniqueValues');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbManager = new IndexedDBManager();
