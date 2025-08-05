declare module '@capacitor/preferences' {
  export interface Preferences {
    /**
     * Set the value for a given key.
     */
    set(options: {
      key: string;
      value: string;
      group?: string;
    }): Promise<void>;
    
    /**
     * Get the value for a given key.
     */
    get(options: {
      key: string;
      group?: string;
    }): Promise<{ value: string | null }>;
    
    /**
     * Remove the value for a given key.
     */
    remove(options: {
      key: string;
      group?: string;
    }): Promise<void>;
    
    /**
     * Clear all stored preferences (or all keys in a group).
     */
    clear(options?: {
      group?: string;
    }): Promise<void>;
    
    /**
     * Get all stored keys.
     */
    keys(options?: {
      group?: string;
    }): Promise<{ keys: string[] }>;
    
    /**
     * Get all stored key/value pairs.
     */
    getItems(options?: {
      group?: string;
    }): Promise<{ items: { key: string; value: string | null }[] }>;
    
    /**
     * Set multiple key/value pairs.
     */
    setItems(options: {
      items: { key: string; value: string }[];
      group?: string;
    }): Promise<void>;
    
    /**
     * Remove multiple keys.
     */
    removeItems(options: {
      keys: string[];
      group?: string;
    }): Promise<void>;
  }

  const Preferences: Preferences;
  export { Preferences };
}
