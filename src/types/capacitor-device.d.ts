declare module '@capacitor/device' {
  export interface DeviceInfo {
    /**
     * The name of the device. For example: "iPhone" or "HTC"
     */
    name: string;
    
    /**
     * The device model. For example: "iPhone 13" or "Pixel 5"
     */
    model: string;
    
    /**
     * The device platform (lowercase).
     */
    platform: 'ios' | 'android' | 'web';
    
    /**
     * The operating system of the device as a string.
     */
    operatingSystem: string;
    
    /**
     * The version of the device OS.
     */
    osVersion: string;
    
    /**
     * The manufacturer of the device.
     */
    manufacturer: string;
    
    /**
     * Whether the app is running in a simulator/emulator.
     */
    isVirtual: boolean;
    
    /**
     * UUID of the device if available, or a random UUID if not
     * available. This ID is not guaranteed to be stable and may
     * change after app uninstall or reset.
     */
    uuid: string;
    
    /**
     * The current battery level of the device, if available.
     */
    batteryLevel?: number;
    
    /**
     * Whether the device is charging.
     */
    isCharging?: boolean;
  }

  export interface DevicePlugin {
    /**
     * Return information about the underlying device/platform.
     */
    getInfo(): Promise<DeviceInfo>;
    
    /**
     * Return a unique identifier for the device.
     */
    getId(): Promise<{ identifier: string }>;
    
    /**
     * Return the device's language code.
     */
    getLanguageCode(): Promise<{ value: string }>;
    
    /**
     * Return the device's current battery level.
     */
    getBatteryInfo(): Promise<{ batteryLevel?: number; isCharging: boolean }>;
  }

  const Device: DevicePlugin;
  export { Device };
}
