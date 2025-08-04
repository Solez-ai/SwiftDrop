import { PluginListenerHandle } from '@capacitor/core';
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
    startDiscovery(): Promise<void>;
    stopDiscovery(): Promise<void>;
    connect(options: {
        deviceAddress: string;
    }): Promise<void>;
    disconnect(): Promise<void>;
    getPeers(): Promise<{
        devices: WifiP2PDevice[];
    }>;
    getConnectedPeers(): Promise<{
        devices: WifiP2PDevice[];
    }>;
    stopGroup(): Promise<void>;
    addListener(eventName: 'onDeviceFound', listenerFunc: (device: WifiP2PDevice) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
    addListener(eventName: 'onDeviceLost', listenerFunc: (device: WifiP2PDevice) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
    addListener(eventName: 'onConnectionChanged', listenerFunc: (connected: boolean) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
    removeAllListeners(): Promise<void>;
}
declare const WifiP2P: WifiP2PPlugin;
export { WifiP2P };
//# sourceMappingURL=index.d.ts.map