declare namespace Capacitor {
  interface PluginRegistry {
    WifiP2PPlugin: WifiP2PPlugin;
  }
}

export interface WifiP2PPlugin {
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  connectToDevice(options: { deviceAddress: string }): Promise<void>;
  sendFile(options: { filePath: string }): Promise<void>;
  receiveFile(): Promise<string>;
  getDiscoveredDevices(): Promise<{ devices: Device[] }>;
  
  on(eventName: 'deviceDiscovered', listener: (event: { devices: Device[] }) => void): Promise<void>;
  on(eventName: 'connectionSuccess', listener: (event: { isGroupOwner: boolean }) => void): Promise<void>;
  on(eventName: 'connectionFailed', listener: (event: { reason: string }) => void): Promise<void>;
  on(eventName: 'transferProgress', listener: (event: { progress: number }) => void): Promise<void>;
  on(eventName: 'transferComplete', listener: (event: { filePath: string }) => void): Promise<void>;
}

export interface Device {
  deviceAddress: string;
  deviceName: string;
  status: number;
}
