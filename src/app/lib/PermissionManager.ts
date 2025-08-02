'use client';

import { Camera } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';

export interface PermissionState {
  camera: boolean;
  storage: boolean;
  location: boolean;
  bluetooth: boolean;
}

class PermissionManager {
  private static instance: PermissionManager;
  private permissionState: PermissionState = {
    camera: false,
    storage: false,
    location: false,
    bluetooth: false
  };

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = await Camera.requestPermissions();
      this.permissionState.camera = permission.camera === 'granted';
      return this.permissionState.camera;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  async requestStoragePermission(): Promise<boolean> {
    try {
      // For web/capacitor, filesystem access is generally available
      // In production, this would use native permission APIs
      const testWrite = await Filesystem.writeFile({
        path: 'test.txt',
        data: 'test',
        directory: Directory.Documents
      });
      
      if (testWrite) {
        // Clean up test file
        await Filesystem.deleteFile({
          path: 'test.txt',
          directory: Directory.Documents
        });
        this.permissionState.storage = true;
      }
      
      return this.permissionState.storage;
    } catch (error) {
      console.error('Storage permission error:', error);
      return false;
    }
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      // This would use Geolocation API or native location services
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              this.permissionState.location = true;
              resolve(true);
            },
            () => {
              this.permissionState.location = false;
              resolve(false);
            }
          );
        });
      }
      return false;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async requestBluetoothPermission(): Promise<boolean> {
    try {
      // This would use native Bluetooth APIs through Capacitor plugin
      // For now, we'll simulate permission check
      this.permissionState.bluetooth = true;
      return true;
    } catch (error) {
      console.error('Bluetooth permission error:', error);
      return false;
    }
  }

  async checkAllPermissions(): Promise<PermissionState> {
    // Check current permission states without requesting
    return this.permissionState;
  }

  async requestAllPermissions(): Promise<PermissionState> {
    await Promise.all([
      this.requestCameraPermission(),
      this.requestStoragePermission(),
      this.requestLocationPermission(),
      this.requestBluetoothPermission()
    ]);

    return this.permissionState;
  }

  getPermissionState(): PermissionState {
    return { ...this.permissionState };
  }
}

export default PermissionManager;
