import { WifiP2PPlugin } from '@capacitor-community/wifi-p2p';
import { Capacitor } from '@capacitor/core';

/**
 * Check if the device supports WiFi Direct
 * @returns {Promise<boolean>} True if WiFi Direct is supported
 */
export const isWifiDirectSupported = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }
  
  try {
    const { isSupported } = await WifiP2PPlugin.isSupported();
    return isSupported;
  } catch (error) {
    console.error('Error checking WiFi Direct support:', error);
    return false;
  }
};

/**
 * Get the current device's WiFi Direct information
 * @returns {Promise<{deviceName: string, deviceAddress: string} | null>} Device info or null if not available
 */
export const getDeviceInfo = async (): Promise<{deviceName: string, deviceAddress: string} | null> => {
  if (!Capacitor.isNativePlatform()) {
    return {
      deviceName: 'Web Browser',
      deviceAddress: 'browser',
    };
  }
  
  try {
    const info = await WifiP2PPlugin.getDeviceInfo();
    return {
      deviceName: info.deviceName || 'Unknown Device',
      deviceAddress: info.deviceAddress || '',
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
};

/**
 * Format a MAC address with colons
 * @param {string} mac - The MAC address to format
 * @returns {string} Formatted MAC address
 */
export const formatMacAddress = (mac: string): string => {
  if (!mac) return '';
  // Remove any non-alphanumeric characters
  const cleanMac = mac.replace(/[^0-9A-Fa-f]/g, '');
  // Add colons every 2 characters
  return cleanMac.match(/.{1,2}/g)?.join(':') || '';
};

/**
 * Check if the device is connected to a WiFi network
 * @returns {Promise<boolean>} True if connected to WiFi
 */
export const isConnectedToWifi = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return true; // Assume connected in web
  }
  
  try {
    const { connected } = await WifiP2PPlugin.isConnectedToWifi();
    return connected;
  } catch (error) {
    console.error('Error checking WiFi connection:', error);
    return false;
  }
};

/**
 * Get the current WiFi network SSID
 * @returns {Promise<string>} The SSID of the current WiFi network
 */
export const getCurrentSSID = async (): Promise<string> => {
  if (!Capacitor.isNativePlatform()) {
    return 'Web Browser';
  }
  
  try {
    const { ssid } = await WifiP2PPlugin.getCurrentSSID();
    return ssid || 'Unknown Network';
  } catch (error) {
    console.error('Error getting SSID:', error);
    return 'Unknown Network';
  }
};
