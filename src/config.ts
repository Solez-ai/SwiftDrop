import { Capacitor } from '@capacitor/core';

// App configuration
export const APP_CONFIG = {
  // App info
  APP_NAME: 'SwiftDrop',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Fast and secure file sharing using WiFi Direct',
  
  // API configuration
  API_BASE_URL: 'https://api.swiftdrop.app', // Replace with your API URL
  API_TIMEOUT: 30000, // 30 seconds
  
  // File transfer settings
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  CHUNK_SIZE: 64 * 1024, // 64KB
  MAX_CONCURRENT_TRANSFERS: 3,
  
  // Discovery settings
  DISCOVERY_TIMEOUT: 10000, // 10 seconds
  DISCOVERY_INTERVAL: 30000, // 30 seconds
  
  // Connection settings
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 5000, // 5 seconds
  
  // UI settings
  TOAST_DURATION: 3000, // 3 seconds
  SNACKBAR_DURATION: 5000, // 5 seconds
  
  // Storage keys
  STORAGE_KEYS: {
    THEME_MODE: 'theme_mode',
    DEVICE_NAME: 'device_name',
    RECENT_DEVICES: 'recent_devices',
    TRANSFER_HISTORY: 'transfer_history',
    SETTINGS: 'app_settings',
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: false,
    ENABLE_CRASH_REPORTING: false,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_DARK_MODE: true,
  },
  
  // Platform-specific settings
  PLATFORM: {
    IS_WEB: !Capacitor.isNativePlatform(),
    IS_IOS: Capacitor.getPlatform() === 'ios',
    IS_ANDROID: Capacitor.getPlatform() === 'android',
    IS_DESKTOP: ['electron', 'web'].includes(Capacitor.getPlatform()),
  },
  
  // Default values
  DEFAULTS: {
    DEVICE_NAME: `My ${Capacitor.getPlatform() === 'ios' ? 'iPhone' : 'Device'}`,
    THEME: 'system', // 'light', 'dark', or 'system'
    LANGUAGE: 'en',
  },
} as const;

// Export types for the config
export type AppConfig = typeof APP_CONFIG;
export type StorageKeys = typeof APP_CONFIG.STORAGE_KEYS;
export type Features = typeof APP_CONFIG.FEATURES;
export type PlatformConfig = typeof APP_CONFIG.PLATFORM;

export default APP_CONFIG;
