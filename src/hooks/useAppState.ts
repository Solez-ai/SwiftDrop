import { useState, useEffect, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useWifiP2P } from './useWifiP2P';
import { useFileSystem } from './useFileSystem';
import { showError, showInfo } from '../utils/notificationUtils';

interface AppState {
  isInitialized: boolean;
  isActive: boolean;
  isOnline: boolean;
  lastError: string | null;
  appVersion: string;
  deviceInfo: {
    platform: string;
    model: string;
    osVersion: string;
    appVersion: string;
  };
}

const useAppState = () => {
  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    isActive: true,
    isOnline: navigator.onLine,
    lastError: null,
    appVersion: '1.0.0',
    deviceInfo: {
      platform: 'web',
      model: 'browser',
      osVersion: 'unknown',
      appVersion: '1.0.0',
    },
  });

  const { isSupported: isWifiP2PSupported } = useWifiP2P();
  const { getFileInfo } = useFileSystem();

  // Initialize app state
  useEffect(() => {
    const initApp = async () => {
      try {
        // Get device info
        let deviceInfo = {
          platform: 'web',
          model: 'browser',
          osVersion: 'unknown',
          appVersion: '1.0.0',
        };

        if (Capacitor.isNativePlatform()) {
          const { platform } = await Capacitor.getPlatformInfo();
          const { appVersion } = await Capacitor.getAppInfo();
          
          deviceInfo = {
            platform,
            model: (await Capacitor.getDeviceInfo()).model,
            osVersion: (await Capacitor.getPlatformInfo()).osVersion || 'unknown',
            appVersion: appVersion || '1.0.0',
          };

          // Set status bar style
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1976d2' });
        }

        setAppState(prev => ({
          ...prev,
          isInitialized: true,
          deviceInfo,
          appVersion: deviceInfo.appVersion,
        }));
      } catch (error) {
        console.error('Error initializing app:', error);
        setAppState(prev => ({
          ...prev,
          isInitialized: true,
          lastError: error.message,
        }));
        showError(`Initialization error: ${error.message}`);
      }
    };

    initApp();

    // Set up app state change listeners
    const handleOnline = () => setAppState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setAppState(prev => ({ ...prev, online: false }));
    const handleAppStateChange = (isActive: boolean) => {
      setAppState(prev => ({ ...prev, isActive }));
      if (isActive) {
        showInfo('App resumed');
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        handleAppStateChange(isActive);
      });
    }

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, []);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      showInfo('App updates are handled by your browser');
      return false;
    }

    try {
      const { appVersion } = await Capacitor.getAppInfo();
      // Here you would typically call your API to check for updates
      // For now, we'll just compare with the current version
      const updateAvailable = false; // Replace with actual update check
      
      if (updateAvailable) {
        showInfo('Update available! Please update the app.');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }, []);

  // Clear app data
  const clearAppData = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
      return false;
    }

    try {
      // Clear local storage
      localStorage.clear();
      
      // Clear file system data (if needed)
      // This is a placeholder - implement actual data clearing logic
      
      showInfo('App data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing app data:', error);
      showError('Failed to clear app data');
      return false;
    }
  }, []);

  // Check storage status
  const checkStorageStatus = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return {
        totalSpace: 0,
        usedSpace: 0,
        freeSpace: 0,
        isLowSpace: false,
      };
    }

    try {
      const { totalBytes, freeBytes } = await Filesystem.getFreeDiskStorage();
      const usedBytes = totalBytes - freeBytes;
      
      return {
        totalSpace: totalBytes,
        usedSpace: usedBytes,
        freeSpace: freeBytes,
        isLowSpace: freeBytes < 100 * 1024 * 1024, // Less than 100MB free
      };
    } catch (error) {
      console.error('Error checking storage status:', error);
      return null;
    }
  }, []);

  // Check permissions
  const checkPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return {
        hasStoragePermission: true,
        hasLocationPermission: true,
        hasCameraPermission: true,
      };
    }

    try {
      // Check storage permission
      const storagePermission = await Filesystem.checkPermissions();
      
      // Note: You'll need to implement your own permission checks for other permissions
      // as the Capacitor APIs for permissions vary by platform
      
      return {
        hasStoragePermission: storagePermission === 'granted',
        hasLocationPermission: true, // Implement actual check
        hasCameraPermission: true,   // Implement actual check
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return null;
    }
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      // Request storage permission
      const storagePermission = await Filesystem.requestPermissions();
      
      // Request other permissions as needed
      
      return storagePermission === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }, []);

  return {
    ...appState,
    isWifiP2PSupported,
    checkForUpdates,
    clearAppData,
    checkStorageStatus,
    checkPermissions,
    requestPermissions,
  };
};

export default useAppState;
