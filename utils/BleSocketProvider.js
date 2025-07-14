import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import TcpSocket from 'react-native-tcp-socket';
import * as Network from 'expo-network';
import * as FileSystem from 'expo-file-system';

const BleSocketContext = createContext();

export function BleSocketProvider({ children }) {
  const bleManager = useRef(new BleManager()).current;
  const [devices, setDevices] = useState([]); // {id, name, ip, port}
  const [isScanning, setIsScanning] = useState(false);
  const [server, setServer] = useState(null);
  const [client, setClient] = useState(null);
  const [transferProgress, setTransferProgress] = useState(null);
  const [receivedFile, setReceivedFile] = useState(null);
  const [error, setError] = useState(null);
  const [incomingConnection, setIncomingConnection] = useState(null); // {ip, port, fileName, fileSize}

  // BLE: Start advertising (broadcast this device as SwiftDrop with session info)
  const startAdvertising = async (sessionInfo) => {
    // BLE advertising is not supported on iOS in background, but we can use scan response
    // On Android, set device name to include session info (e.g., SwiftDrop-192.168.1.2-5001)
    try {
      if (Platform.OS === 'android' && sessionInfo) {
        // This requires native code or a custom dev client for full support
        // As a workaround, set device name via BLEManager (not always possible)
        // TODO: Use a native module or custom BLE advertiser for full support
        // For now, just document the session info for QR/manual entry
      }
    } catch (e) {
      setError('BLE advertising failed: ' + e.message);
    }
  };

  // BLE: Scan for nearby SwiftDrop devices
  const startScanning = async () => {
    setIsScanning(true);
    setDevices([]);
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
      bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
        if (error) {
          setError(error.message);
          setIsScanning(false);
          return;
        }
        // Filter for SwiftDrop devices (e.g., by name or service UUID)
        if (device && device.name && device.name.startsWith('SwiftDrop')) {
          // Parse session info from device name: SwiftDrop-192.168.1.2-5001
          let ip, port;
          const parts = device.name.split('-');
          if (parts.length === 3) {
            ip = parts[1];
            port = parseInt(parts[2], 10);
          }
          setDevices((prev) => {
            if (prev.find((d) => d.id === device.id)) return prev;
            return [...prev, { id: device.id, name: device.name, ip, port, ...device }];
          });
        }
      });
    } catch (e) {
      setError(e.message);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  // TCP: Start server to receive files, trigger onIncomingConnection
  const startServer = async (onFileReceived, onIncoming) => {
    const ip = (await Network.getIpAddressAsync()) || '0.0.0.0';
    const port = 5000 + Math.floor(Math.random() * 1000);
    const server = TcpSocket.createServer((socket) => {
      // On incoming connection, trigger callback for accept/deny
      setIncomingConnection({ ip: socket.remoteAddress, port: socket.remotePort });
      if (onIncoming) onIncoming({ ip: socket.remoteAddress, port: socket.remotePort });
      let fileUri = FileSystem.documentDirectory + `swiftdrop_${Date.now()}`;
      let fileStream = FileSystem.createWriteStream(fileUri);
      let receivedBytes = 0;
      socket.on('data', (data) => {
        fileStream.write(data);
        receivedBytes += data.length;
        setTransferProgress({ receivedBytes });
      });
      socket.on('end', () => {
        fileStream.close();
        setReceivedFile(fileUri);
        if (onFileReceived) onFileReceived(fileUri);
      });
      socket.on('error', (err) => setError(err.message));
    });
    server.listen({ port, host: ip }, () => {
      setServer(server);
    });
    // Start BLE advertising with session info
    startAdvertising({ ip, port });
    return { ip, port };
  };

  // TCP: Connect to peer and send file
  const sendFile = async ({ ip, port, fileUri, onProgress }) => {
    return new Promise(async (resolve, reject) => {
      const client = TcpSocket.createConnection({ port, host: ip }, async () => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          const fileStream = FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
          let sentBytes = 0;
          fileStream.then((base64) => {
            const buffer = Buffer.from(base64, 'base64');
            client.write(buffer, () => {
              sentBytes += buffer.length;
              if (onProgress) onProgress(sentBytes, fileInfo.size);
              client.end();
              resolve();
            });
          });
        } catch (e) {
          reject(e);
        }
      });
      client.on('error', (err) => reject(err));
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      bleManager.destroy();
      if (server) server.close();
      if (client) client.destroy();
    };
  }, []);

  return (
    <BleSocketContext.Provider
      value={{
        devices,
        isScanning,
        startScanning,
        stopScanning,
        startAdvertising,
        startServer,
        sendFile,
        transferProgress,
        receivedFile,
        error,
        incomingConnection,
      }}
    >
      {children}
    </BleSocketContext.Provider>
  );
}

export function useBleSocket() {
  return useContext(BleSocketContext);
} 