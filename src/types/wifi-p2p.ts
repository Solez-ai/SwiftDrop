export interface Device {
  deviceAddress: string;
  deviceName: string;
  isGroupOwner: boolean;
}

export interface WifiP2PPlugin {
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  connectToDevice(options: { deviceAddress: string }): Promise<void>;
  getPeers(): Promise<{ peers: Device[] }>;
  stop(): Promise<void>;
}
