import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface WifiP2PDevice {
  deviceName: string;
  deviceAddress: string;
  status: number;
  primaryDeviceType?: string;
  secondaryDeviceType?: string;
  isGroupOwner?: boolean;
  isServiceDiscoveryCapable?: boolean;
}

export interface WifiP2PPlugin {
  // Start discovering WiFi P2P peers
  startDiscovery(): Promise<void>;
  
  // Stop discovering WiFi P2P peers
  stopDiscovery(): Promise<void>;
  
  // Connect to a specific device
  connect(options: { deviceAddress: string }): Promise<void>;
  
  // Disconnect from the current connection
  disconnect(): Promise<void>;
  
  // Get list of available peers
  getPeers(): Promise<{ devices: WifiP2PDevice[] }>;
  
  // Get list of connected peers
  getConnectedPeers(): Promise<{ devices: WifiP2PDevice[] }>;
  
  // Stop the current P2P group
  stopGroup(): Promise<void>;
  
  // Event listeners
  addListener(
    eventName: 'onDeviceFound',
    listenerFunc: (device: WifiP2PDevice) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'onDeviceLost',
    listenerFunc: (device: WifiP2PDevice) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'onConnectionChanged',
    listenerFunc: (connected: boolean) => void,
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  // Remove all listeners
  removeAllListeners(): Promise<void>;
}

const WifiP2P = registerPlugin<WifiP2PPlugin>('WifiP2P');

export { WifiP2P };
