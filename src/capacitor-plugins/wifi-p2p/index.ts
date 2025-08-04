import { registerPlugin } from '@capacitor/core';

export interface WifiP2PPlugin {
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  connectToDevice(options: { deviceAddress: string }): Promise<void>;
  getPeers(): Promise<{ peers: Array<{ deviceAddress: string; deviceName: string; isGroupOwner: boolean }> }>;
  stop(): Promise<void>;
}

export const WifiP2P = registerPlugin<WifiP2PPlugin>('WifiP2P');
