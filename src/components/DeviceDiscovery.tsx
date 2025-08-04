import React, { useState, useEffect } from 'react';
import { WifiP2P, WifiP2PDevice } from '@capacitor-community/wifi-p2p';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSpinner, IonAlert } from '@ionic/react';
import { wifi, refresh, close, checkmark } from 'ionicons/icons';
import './DeviceDiscovery.css';

interface DeviceDiscoveryProps {
  onDeviceSelect: (device: WifiP2PDevice) => void;
  onClose: () => void;
}

const DeviceDiscovery: React.FC<DeviceDiscoveryProps> = ({ onDeviceSelect, onClose }) => {
  const [devices, setDevices] = useState<WifiP2PDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<WifiP2PDevice | null>(null);

  useEffect(() => {
    startDiscovery();
    return () => {
      stopDiscovery();
    };
  }, []);

  const startDiscovery = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      // Set up event listeners
      const foundListener = await WifiP2P.addListener('onDeviceFound', (device: WifiP2PDevice) => {
        setDevices(prevDevices => {
          const exists = prevDevices.some(d => d.deviceAddress === device.deviceAddress);
          return exists ? prevDevices : [...prevDevices, device];
        });
      });

      const lostListener = await WifiP2P.addListener('onDeviceLost', (device: WifiP2PDevice) => {
        setDevices(prevDevices => 
          prevDevices.filter(d => d.deviceAddress !== device.deviceAddress)
        );
      });

      // Start discovery
      await WifiP2P.startDiscovery();
      
      return () => {
        foundListener.remove();
        lostListener.remove();
        stopDiscovery();
      };
    } catch (err) {
      console.error('Error starting discovery:', err);
      setError('Failed to start device discovery. Please check your WiFi and location settings.');
      setIsScanning(false);
    }
  };

  const stopDiscovery = async () => {
    try {
      await WifiP2P.stopDiscovery();
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping discovery:', err);
    }
  };

  const handleRefresh = async () => {
    setDevices([]);
    await startDiscovery();
  };

  const handleDeviceSelect = (device: WifiP2PDevice) => {
    setSelectedDevice(device);
  };

  const confirmConnection = () => {
    if (selectedDevice) {
      onDeviceSelect(selectedDevice);
      onClose();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Available Devices</IonTitle>
          <IonButton slot="end" onClick={onClose} fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="discovery-controls">
          <IonButton 
            onClick={handleRefresh} 
            disabled={isScanning}
            fill="outline"
            className="refresh-button"
          >
            <IonIcon icon={refresh} slot="start" />
            {isScanning ? 'Scanning...' : 'Refresh'}
          </IonButton>
          {isScanning && <IonSpinner name="crescent" className="spinner" />}
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {devices.length === 0 && !isScanning && !error && (
          <div className="no-devices">
            <IonIcon icon={wifi} className="wifi-icon" />
            <p>No devices found</p>
            <p>Make sure the other device is nearby and has WiFi Direct enabled</p>
          </div>
        )}

        <IonList lines="full" className="device-list">
          {devices.map((device) => (
            <IonItem 
              key={device.deviceAddress} 
              button 
              onClick={() => handleDeviceSelect(device)}
              className={selectedDevice?.deviceAddress === device.deviceAddress ? 'selected' : ''}
            >
              <IonLabel>
                <h2>{device.deviceName || 'Unknown Device'}</h2>
                <p>{device.deviceAddress}</p>
              </IonLabel>
              {selectedDevice?.deviceAddress === device.deviceAddress && (
                <IonIcon icon={checkmark} color="success" slot="end" />
              )}
            </IonItem>
          ))}
        </IonList>

        <div className="action-buttons">
          <IonButton 
            expand="block" 
            onClick={confirmConnection}
            disabled={!selectedDevice}
            className="connect-button"
          >
            Connect to Selected Device
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DeviceDiscovery;
