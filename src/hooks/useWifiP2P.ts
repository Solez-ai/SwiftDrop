import { useState, useEffect, useCallback } from 'react';
import { WifiP2PPlugin } from '@capacitor-community/wifi-p2p';
import { Capacitor } from '@capacitor/core';
import { showError, showSuccess, showInfo } from '../utils/notificationUtils';

interface DeviceInfo {
  deviceName: string;
  deviceAddress: string;
  isGroupOwner?: boolean;
  isConnected?: boolean;
}

interface ConnectionInfo {
  groupOwnerAddress: string;
  groupOwnerHostAddress: string;
  isGroupOwner: boolean;
  networkName: string;
  clients: DeviceInfo[];
}

interface TransferUpdate {
  deviceAddress: string;
  status: 'STARTED' | 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS' | 'CANCELLED';
  progress: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  transferredBytes: number;
  error?: string;
}

const useWifiP2P = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [transferStatus, setTransferStatus] = useState<TransferUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize WiFi P2P
  useEffect(() => {
    const initWifiP2P = async () => {
      if (!Capacitor.isNativePlatform()) {
        console.warn('WiFi P2P is only available on native platforms');
        return;
      }

      try {
        // Initialize the plugin
        await WifiP2PPlugin.initialize();
        const { isSupported: supported } = await WifiP2PPlugin.isSupported();
        setIsSupported(supported);

        if (supported) {
          // Set up event listeners
          WifiP2PPlugin.addListener('onPeersAvailable', handlePeersDiscovered);
          WifiP2PPlugin.addListener('onConnectionInfoAvailable', handleConnectionInfo);
          WifiP2PPlugin.addListener('onTransferUpdate', handleTransferUpdate);
          WifiP2PPlugin.addListener('onError', handleError);

          // Start discovery
          await startDiscovery();
        }
      } catch (err) {
        console.error('Error initializing WiFi P2P:', err);
        setError(`Initialization failed: ${err.message}`);
      }
    };

    initWifiP2P();

    // Clean up event listeners on unmount
    return () => {
      if (Capacitor.isNativePlatform()) {
        WifiP2PPlugin.removeAllListeners();
      }
    };
  }, []);

  // Handle discovered peers
  const handlePeersDiscovered = useCallback((event: any) => {
    const peers = event.peers || [];
    setDevices(peers.map((peer: any) => ({
      deviceName: peer.deviceName || 'Unknown Device',
      deviceAddress: peer.deviceAddress,
      isGroupOwner: peer.isGroupOwner,
    })));
  }, []);

  // Handle connection info updates
  const handleConnectionInfo = useCallback((info: ConnectionInfo) => {
    setConnectionInfo(info);
    setIsConnected(!!info);
  }, []);

  // Handle transfer updates
  const handleTransferUpdate = useCallback((update: TransferUpdate) => {
    setTransferStatus(update);
    
    // Show notifications for important status updates
    switch (update.status) {
      case 'SUCCESS':
        showSuccess(`Transfer completed: ${update.fileName}`);
        break;
      case 'FAILURE':
        showError(`Transfer failed: ${update.error || 'Unknown error'}`);
        break;
      case 'CANCELLED':
        showInfo('Transfer cancelled');
        break;
    }
  }, []);

  // Handle errors
  const handleError = useCallback((error: any) => {
    console.error('WiFi P2P Error:', error);
    setError(error.message || 'An error occurred');
    showError(`WiFi P2P Error: ${error.message || 'Unknown error'}`);
  }, []);

  // Start device discovery
  const startDiscovery = useCallback(async () => {
    if (!isSupported) return;

    try {
      setIsDiscovering(true);
      await WifiP2PPlugin.discoverPeers();
    } catch (err) {
      console.error('Error starting discovery:', err);
      setError(`Discovery failed: ${err.message}`);
      showError('Failed to start device discovery');
    } finally {
      setIsDiscovering(false);
    }
  }, [isSupported]);

  // Connect to a peer
  const connectToPeer = useCallback(async (deviceAddress: string) => {
    if (!isSupported) return false;

    try {
      await WifiP2PPlugin.connect({ deviceAddress });
      showInfo('Connected to peer');
      return true;
    } catch (err) {
      console.error('Error connecting to peer:', err);
      setError(`Connection failed: ${err.message}`);
      showError('Failed to connect to device');
      return false;
    }
  }, [isSupported]);

  // Disconnect from current connection
  const disconnect = useCallback(async () => {
    if (!isConnected) return;

    try {
      await WifiP2PPlugin.disconnect();
      setIsConnected(false);
      setConnectionInfo(null);
      showInfo('Disconnected');
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError(`Disconnection failed: ${err.message}`);
      showError('Failed to disconnect');
    }
  }, [isConnected]);

  // Send a file to the connected peer
  const sendFile = useCallback(async (filePath: string, fileName: string, fileSize: number) => {
    if (!isConnected) {
      showError('Not connected to any device');
      return false;
    }

    try {
      await WifiP2PPlugin.sendFile({
        filePath,
        fileName,
        fileSize,
      });
      return true;
    } catch (err) {
      console.error('Error sending file:', err);
      setError(`File transfer failed: ${err.message}`);
      showError('Failed to send file');
      return false;
    }
  }, [isConnected]);

  // Cancel current transfer
  const cancelTransfer = useCallback(async () => {
    try {
      await WifiP2PPlugin.cancelTransfer();
      showInfo('Transfer cancelled');
    } catch (err) {
      console.error('Error cancelling transfer:', err);
      setError(`Failed to cancel transfer: ${err.message}`);
      showError('Failed to cancel transfer');
    }
  }, []);

  // Get current device info
  const getDeviceInfo = useCallback(async (): Promise<DeviceInfo | null> => {
    if (!isSupported) return null;

    try {
      const info = await WifiP2PPlugin.getDeviceInfo();
      return {
        deviceName: info.deviceName || 'Unknown Device',
        deviceAddress: info.deviceAddress,
        isGroupOwner: info.isGroupOwner,
      };
    } catch (err) {
      console.error('Error getting device info:', err);
      return null;
    }
  }, [isSupported]);

  return {
    // State
    isSupported,
    isDiscovering,
    isConnected,
    devices,
    connectionInfo,
    transferStatus,
    error,
    
    // Methods
    startDiscovery,
    connectToPeer,
    disconnect,
    sendFile,
    cancelTransfer,
    getDeviceInfo,
  };
};

export default useWifiP2P;
