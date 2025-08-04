import { Plugin } from '@capacitor/core';

declare module '@capacitor/core' {
  interface PluginRegistry {
    WifiP2P: WifiP2PPlugin;
  }
}

export interface WifiP2PDevice {
  deviceName: string;
  deviceAddress: string;
  status: number;
  primaryDeviceType?: string;
  secondaryDeviceType?: string;
}

export interface WifiP2PPlugin {
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  getPeers(): Promise<{ devices: WifiP2PDevice[] }>;
  connect(options: { deviceAddress: string }): Promise<void>;
  disconnect(): Promise<void>;
  getConnectedPeers(): Promise<{ devices: WifiP2PDevice[] }>;
  stopGroup(): Promise<void>;
  onDeviceFound(callback: (device: WifiP2PDevice) => void): void;
  onDeviceLost(callback: (device: WifiP2PDevice) => void): void;
  onConnectionChanged(callback: (connected: boolean) => void): void;
}
