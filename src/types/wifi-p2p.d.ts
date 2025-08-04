declare module '@capacitor-community/wifi-p2p' {
  export interface WifiP2PPlugin {
    // Core Methods
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    startDiscovery(): Promise<void>;
    stopDiscovery(): Promise<void>;
    stopPeerDiscovery?(): Promise<void>;
    
    // Connection Methods
    connect(options: { deviceAddress: string }): Promise<void>;
    connectToDevice(options: { deviceAddress: string }): Promise<void>;
    disconnect(): Promise<void>;
    stopGroup(): Promise<void>;
    
    // File Transfer
    sendFile(options: { filePath: string }): Promise<void>;
    receiveFile(): Promise<string>;
    
    // Device Management
    getDiscoveredDevices(): Promise<{ devices: WifiP2PDevice[] }>;
    getConnectedPeers(): Promise<{ devices: WifiP2PDevice[] }>;
    
    // Event Listeners
    addListener(
      eventName: 'deviceDiscovered', 
      listener: (event: { devices: WifiP2PDevice[] }) => void
    ): Promise<void>;
    
    addListener(
      eventName: 'connectionSuccess', 
      listener: (event: { isGroupOwner: boolean }) => void
    ): Promise<void>;
    
    addListener(
      eventName: 'connectionFailed', 
      listener: (event: { reason: string }) => void
    ): Promise<void>;
    
    addListener(
      eventName: 'transferProgress', 
      listener: (event: { progress: number }) => void
    ): Promise<void>;
    
    addListener(
      eventName: 'transferComplete', 
      listener: (event: { filePath: string }) => void
    ): Promise<void>;
    
    // Alias for backward compatibility
    on(eventName: string, listener: Function): Promise<void>;
    
    // Utility Methods
    removeAllListeners?(): Promise<void>;
  }

  export interface WifiP2PDevice {
    deviceAddress: string;
    deviceName: string;
    status: number;
    isGroupOwner?: boolean;
    isConnected?: boolean;
  }
  
  export const WifiP2P: WifiP2PPlugin;
  export default WifiP2P;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    WifiP2P: import('@capacitor-community/wifi-p2p').WifiP2PPlugin;
  }
}

export type WifiP2PDevice = import('@capacitor-community/wifi-p2p').WifiP2PDevice;
