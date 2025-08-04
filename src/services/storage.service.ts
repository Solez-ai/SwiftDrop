import { Preferences } from '@capacitor/preferences';
import { APP_CONFIG } from '../config';
import { deepClone } from '../utils/common';

class StorageService {
  private static instance: StorageService;
  private cache: Map<string, any> = new Map();
  
  private constructor() {
    // Initialize any required setup
  }

  /**
   * Get the singleton instance of StorageService
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Set a value in storage
   * @param key - The storage key
   * @param value - The value to store (will be stringified)
   */
  public async set<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await Preferences.set({ key, value: stringValue });
      this.cache.set(key, deepClone(value));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error setting value for key "${key}":`, error);
      throw new Error(`Failed to store data: ${errorMessage}`);
    }
  }

  /**
   * Get a value from storage
   * @param key - The storage key
   * @param defaultValue - Default value if key doesn't exist
   */
  public async get<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    // Check cache first
    if (this.cache.has(key)) {
      return deepClone(this.cache.get(key));
    }

    try {
      const { value } = await Preferences.get({ key });
      
      if (value === null) {
        return defaultValue;
      }
      
      try {
        const parsedValue = JSON.parse(value) as T;
        // Cache the parsed value
        this.cache.set(key, deepClone(parsedValue));
        return parsedValue;
      } catch (parseError) {
        console.error(`Error parsing stored value for key "${key}":`, parseError);
        return defaultValue;
      }
    } catch (error) {
      console.error(`Error getting value for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove a value from storage
   * @param key - The storage key to remove
   */
  public async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
      this.cache.delete(key);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error removing key "${key}":`, error);
      throw new Error(`Failed to remove data: ${errorMessage}`);
    }
  }

  /**
   * Clear all stored data (use with caution!)
   */
  public async clear(): Promise<void> {
    try {
      await Preferences.clear();
      this.cache.clear();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error clearing storage:', error);
      throw new Error(`Failed to clear storage: ${errorMessage}`);
    }
  }

  /**
   * Get all keys in storage
   */
  public async keys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists in storage
   * @param key - The key to check
   */
  public async has(key: string): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key });
      return value !== null;
    } catch (error) {
      console.error(`Error checking for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get multiple values from storage
   * @param keys - Array of keys to retrieve
   */
  public async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.get<T>(key);
      })
    );
    
    return result;
  }

  /**
   * Set multiple values in storage
   * @param items - Object with key-value pairs to store
   */
  public async setMany(items: Record<string, any>): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, value]) => this.set(key, value))
    );
  }

  /**
   * Remove multiple keys from storage
   * @param keys - Array of keys to remove
   */
  public async removeMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.remove(key)));
  }

  /**
   * Get all stored data (use with caution for large datasets)
   */
  public async getAll(): Promise<Record<string, any>> {
    try {
      const keys = await this.keys();
      const allData: Record<string, any> = {};
      
      for (const key of keys) {
        allData[key] = await this.get(key);
      }
      
      return allData;
    } catch (error) {
      console.error('Error getting all storage data:', error);
      return {};
    }
  }

  /**
   * Clear the in-memory cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // App-specific storage methods

  /**
   * Get the stored theme preference
   */
  public async getThemePreference(): Promise<'light' | 'dark' | 'system'> {
    return (await this.get(APP_CONFIG.STORAGE_KEYS.THEME_MODE, 'system')) as 'light' | 'dark' | 'system';
  }

  /**
   * Set the theme preference
   */
  public async setThemePreference(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.THEME_MODE, theme);
  }

  /**
   * Get the device name
   */
  public async getDeviceName(): Promise<string> {
    return (await this.get(APP_CONFIG.STORAGE_KEYS.DEVICE_NAME, APP_CONFIG.DEFAULTS.DEVICE_NAME)) as string;
  }

  /**
   * Set the device name
   */
  public async setDeviceName(name: string): Promise<void> {
    await this.set(APP_CONFIG.STORAGE_KEYS.DEVICE_NAME, name);
  }

  /**
   * Get recent devices
   */
  public async getRecentDevices(): Promise<Array<{ id: string; name: string; lastConnected: number }>> {
    return (await this.get(APP_CONFIG.STORAGE_KEYS.RECENT_DEVICES, [])) || [];
  }

  /**
   * Add or update a recent device
   */
  public async addRecentDevice(device: { id: string; name: string }): Promise<void> {
    const recentDevices = await this.getRecentDevices();
    const existingIndex = recentDevices.findIndex(d => d.id === device.id);
    
    if (existingIndex >= 0) {
      // Update existing
      recentDevices[existingIndex] = {
        ...recentDevices[existingIndex],
        name: device.name,
        lastConnected: Date.now(),
      };
    } else {
      // Add new
      recentDevices.unshift({
        ...device,
        lastConnected: Date.now(),
      });
    }
    
    // Keep only the 10 most recent
    const sorted = recentDevices.sort((a, b) => b.lastConnected - a.lastConnected).slice(0, 10);
    await this.set(APP_CONFIG.STORAGE_KEYS.RECENT_DEVICES, sorted);
  }

  /**
   * Clear recent devices
   */
  public async clearRecentDevices(): Promise<void> {
    await this.remove(APP_CONFIG.STORAGE_KEYS.RECENT_DEVICES);
  }
}

// Export a singleton instance
export const storageService = StorageService.getInstance();

export default storageService;
