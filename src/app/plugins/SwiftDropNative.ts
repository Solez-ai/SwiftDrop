'use client';

import { registerPlugin } from '@capacitor/core';

export interface Device {
  id: string;
  name: string;
  address: string;
  type: 'bluetooth' | 'wifi_direct';
  rssi?: number;
}

export interface TransferProgress {
  fileId: string;
  fileName: string;
  totalBytes: number;
  transferredBytes: number;
  progress: number;
  speed: number;
  estimatedTimeRemaining: number;
}

export interface SwiftDropNativePlugin {
  // Bluetooth operations
  startBluetoothDiscovery(): Promise<void>;
  stopBluetoothDiscovery(): Promise<void>;
  connectToBluetooth(options: { deviceAddress: string }): Promise<{ success: boolean }>;
  disconnectBluetooth(): Promise<void>;
  
  // WiFi Direct operations
  startWifiDirectDiscovery(): Promise<void>;
  stopWifiDirectDiscovery(): Promise<void>;
  connectToWifiDirect(options: { deviceAddress: string }): Promise<{ success: boolean }>;
  disconnectWifiDirect(): Promise<void>;
  
  // File operations
  sendFile(options: { 
    filePath: string; 
    fileName: string; 
    deviceAddress: string; 
    connectionType: 'bluetooth' | 'wifi_direct' 
  }): Promise<{ success: boolean; fileId: string }>;
  
  receiveFile(options: { 
    fileName: string; 
    fileSize: number; 
    deviceAddress: string;
    connectionType: 'bluetooth' | 'wifi_direct'
  }): Promise<{ success: boolean; filePath: string }>;
  
  // Utility methods
  isBluetoothEnabled(): Promise<{ enabled: boolean }>;
  isWifiDirectSupported(): Promise<{ supported: boolean }>;
  requestPermissions(): Promise<{ granted: boolean }>;
  
  // Event listeners
  addListener(eventName: 'deviceDiscovered', listenerFunc: (device: Device) => void): Promise<any>;
  addListener(eventName: 'deviceConnected', listenerFunc: (device: Device) => void): Promise<any>;
  addListener(eventName: 'deviceDisconnected', listenerFunc: (device: Device) => void): Promise<any>;
  addListener(eventName: 'transferProgress', listenerFunc: (progress: TransferProgress) => void): Promise<any>;
  addListener(eventName: 'transferComplete', listenerFunc: (result: { fileId: string; success: boolean; filePath?: string }) => void): Promise<any>;
  addListener(eventName: 'transferError', listenerFunc: (error: { fileId: string; message: string }) => void): Promise<any>;
  addListener(eventName: 'fileReceiveRequest', listenerFunc: (request: { deviceName: string; fileName: string; fileSize: number; requestId: string }) => void): Promise<any>;
}

const SwiftDropNative = registerPlugin<SwiftDropNativePlugin>('SwiftDropNative', {
  web: () => import('./SwiftDropNativeWeb').then(m => new m.SwiftDropNativeWeb()),
});

export default SwiftDropNative;
