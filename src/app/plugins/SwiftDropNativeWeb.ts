import { WebPlugin } from '@capacitor/core';
import { SwiftDropNativePlugin, Device, TransferProgress } from './SwiftDropNative';

export class SwiftDropNativeWeb extends WebPlugin implements SwiftDropNativePlugin {
  async startBluetoothDiscovery(): Promise<void> {
    console.log('Web: Bluetooth discovery not supported in web environment');
  }

  async stopBluetoothDiscovery(): Promise<void> {
    console.log('Web: Bluetooth discovery not supported in web environment');
  }

  async connectToBluetooth(options: { deviceAddress: string }): Promise<{ success: boolean }> {
    console.log('Web: Bluetooth connection not supported');
    return { success: false };
  }

  async disconnectBluetooth(): Promise<void> {
    console.log('Web: Bluetooth disconnect not supported');
  }

  async startWifiDirectDiscovery(): Promise<void> {
    console.log('Web: WiFi Direct discovery not supported in web environment');
  }

  async stopWifiDirectDiscovery(): Promise<void> {
    console.log('Web: WiFi Direct discovery not supported in web environment');
  }

  async connectToWifiDirect(options: { deviceAddress: string }): Promise<{ success: boolean }> {
    console.log('Web: WiFi Direct connection not supported');
    return { success: false };
  }

  async disconnectWifiDirect(): Promise<void> {
    console.log('Web: WiFi Direct disconnect not supported');
  }

  async sendFile(options: { filePath: string; fileName: string; deviceAddress: string; connectionType: 'bluetooth' | 'wifi_direct' }): Promise<{ success: boolean; fileId: string }> {
    console.log('Web: File sending not supported in web environment');
    return { success: false, fileId: '' };
  }

  async receiveFile(options: { fileName: string; fileSize: number; deviceAddress: string; connectionType: 'bluetooth' | 'wifi_direct' }): Promise<{ success: boolean; filePath: string }> {
    console.log('Web: File receiving not supported in web environment');
    return { success: false, filePath: '' };
  }

  async isBluetoothEnabled(): Promise<{ enabled: boolean }> {
    return { enabled: false };
  }

  async isWifiDirectSupported(): Promise<{ supported: boolean }> {
    return { supported: false };
  }

  async requestPermissions(): Promise<{ granted: boolean }> {
    return { granted: false };
  }
}
