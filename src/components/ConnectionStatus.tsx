import React, { useEffect, useState } from 'react';
import { WifiP2P } from '@capacitor-community/wifi-p2p';
import { IonChip, IonIcon, IonLabel } from '@ionic/react';
import { wifi, closeCircle, checkmarkCircle, sync } from 'ionicons/icons';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  onDisconnect: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<{
    name: string;
    address: string;
  } | null>(null);

  useEffect(() => {
    // Set up connection change listener
    const setupConnectionListener = async () => {
      try {
        const listener = await WifiP2P.addListener('onConnectionChanged', (connected: boolean) => {
          setIsConnected(connected);
          if (!connected) {
            setConnectedDevice(null);
            onDisconnect();
          }
        });

        // Check initial connection status
        const { devices } = await WifiP2P.getConnectedPeers();
        if (devices && devices.length > 0) {
          const device = devices[0];
          setConnectedDevice({
            name: device.deviceName || 'Unknown Device',
            address: device.deviceAddress
          });
          setIsConnected(true);
        }

        return () => {
          listener.remove();
        };
      } catch (error) {
        console.error('Error setting up connection listener:', error);
      }
    };

    setupConnectionListener();
  }, [onDisconnect]);

  const handleDisconnect = async () => {
    try {
      setIsConnecting(true);
      await WifiP2P.disconnect();
      await WifiP2P.stopGroup();
      setConnectedDevice(null);
      setIsConnected(false);
      onDisconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="connection-status">
      <IonChip color={isConnected ? 'success' : 'medium'}>
        <IonIcon icon={isConnected ? checkmarkCircle : closeCircle} />
        <IonLabel>
          {connectedDevice 
            ? `Connected to ${connectedDevice.name}`
            : isConnecting 
              ? 'Connecting...' 
              : 'Disconnected'}
        </IonLabel>
        {isConnected && (
          <IonIcon 
            icon={isConnecting ? sync : closeCircle} 
            className={isConnecting ? 'spin' : ''}
            onClick={handleDisconnect}
          />
        )}
      </IonChip>
    </div>
  );
};

export default ConnectionStatus;
