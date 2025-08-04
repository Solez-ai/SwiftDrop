import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { WifiP2P } from '@capacitor-community/wifi-p2p';
import { Directory, Filesystem } from '@capacitor/filesystem';

type TransferStatus = 'idle' | 'discovering' | 'connecting' | 'sending' | 'receiving' | 'completed' | 'error';

interface TransferFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'error';
  error?: string;
}

interface Transfer {
  id: string;
  peerId: string;
  peerName: string;
  files: TransferFile[];
  status: TransferStatus;
  direction: 'send' | 'receive';
  timestamp: number;
  error?: string;
}

interface TransferContextType {
  transfers: Transfer[];
  currentTransfer: Transfer | null;
  discoveredPeers: Array<{ deviceId: string; deviceName: string }>;
  isDiscovering: boolean;
  isConnected: boolean;
  connectedPeer: { id: string; name: string } | null;
  sendFiles: (files: FileList | File[], peerId?: string) => Promise<void>;
  startDiscovery: () => Promise<void>;
  stopDiscovery: () => Promise<void>;
  connectToPeer: (peerId: string, peerName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  clearTransfers: () => void;
  cancelTransfer: (transferId: string) => void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const TransferProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [currentTransfer, setCurrentTransfer] = useState<Transfer | null>(null);
  const [discoveredPeers, setDiscoveredPeers] = useState<Array<{ deviceId: string; deviceName: string }>>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeer, setConnectedPeer] = useState<{ id: string; name: string } | null>(null);
  
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Initialize WiFi P2P
  useEffect(() => {
    const initWifiP2P = async () => {
      try {
        // Initialize the WiFi P2P plugin
        await WifiP2P.initialize();
        
        // Set up event listeners
        WifiP2P.addListener('onPeersAvailable', handlePeersDiscovered);
        WifiP2P.addListener('onConnectionInfoAvailable', handleConnectionInfo);
        WifiP2P.addListener('onThisDeviceChanged', handleThisDeviceChanged);
        WifiP2P.addListener('onTransferUpdate', handleTransferUpdate);
        WifiP2P.addListener('onError', handleError);
        
        // Start discovery on mount
        await startDiscovery();
      } catch (error) {
        console.error('Failed to initialize WiFi P2P:', error);
        enqueueSnackbar('Failed to initialize WiFi Direct', { variant: 'error' });
      }
    };
    
    initWifiP2P();
    
    // Clean up on unmount
    return () => {
      WifiP2P.removeAllListeners();
    };
  }, []);

  const handlePeersDiscovered = useCallback((event: any) => {
    const peers = event.peers || [];
    setDiscoveredPeers(peers.map((peer: any) => ({
      deviceId: peer.deviceAddress,
      deviceName: peer.deviceName || 'Unknown Device',
    })));
  }, []);

  const handleConnectionInfo = useCallback((event: any) => {
    console.log('Connection info:', event);
    // Handle connection info updates
  }, []);

  const handleThisDeviceChanged = useCallback((event: any) => {
    console.log('This device changed:', event);
    // Handle this device changes
  }, []);

  const handleTransferUpdate = useCallback((event: any) => {
    console.log('Transfer update:', event);
    // Handle transfer updates
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('WiFi P2P Error:', error);
    enqueueSnackbar(`Error: ${error.message || 'Unknown error occurred'}`, { variant: 'error' });
  }, [enqueueSnackbar]);

  const startDiscovery = useCallback(async () => {
    try {
      setIsDiscovering(true);
      await WifiP2P.discoverPeers();
    } catch (error) {
      console.error('Failed to start discovery:', error);
      enqueueSnackbar('Failed to start device discovery', { variant: 'error' });
      setIsDiscovering(false);
    }
  }, [enqueueSnackbar]);

  const stopDiscovery = useCallback(async () => {
    try {
      await WifiP2P.stopPeerDiscovery();
      setDiscoveredPeers([]);
      setIsDiscovering(false);
    } catch (error) {
      console.error('Failed to stop discovery:', error);
      enqueueSnackbar('Failed to stop device discovery', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const connectToPeer = useCallback(async (peerId: string, peerName: string) => {
    try {
      await WifiP2P.connect({ deviceAddress: peerId });
      setIsConnected(true);
      setConnectedPeer({ id: peerId, name: peerName });
      enqueueSnackbar(`Connected to ${peerName}`, { variant: 'success' });
      navigate('/transfer');
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      enqueueSnackbar('Failed to connect to device', { variant: 'error' });
    }
  }, [enqueueSnackbar, navigate]);

  const disconnect = useCallback(async () => {
    try {
      await WifiP2P.disconnect();
      setIsConnected(false);
      setConnectedPeer(null);
      enqueueSnackbar('Disconnected', { variant: 'info' });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      enqueueSnackbar('Failed to disconnect', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const sendFiles = useCallback(async (files: FileList | File[], peerId?: string) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    
    if (fileArray.length === 0) {
      enqueueSnackbar('No files selected', { variant: 'warning' });
      return;
    }

    const transferId = uuidv4();
    const transferFiles: TransferFile[] = fileArray.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      uri: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));

    const newTransfer: Transfer = {
      id: transferId,
      peerId: peerId || connectedPeer?.id || '',
      peerName: connectedPeer?.name || 'Unknown Device',
      files: transferFiles,
      status: 'sending',
      direction: 'send',
      timestamp: Date.now(),
    };

    setTransfers(prev => [newTransfer, ...prev]);
    setCurrentTransfer(newTransfer);

    try {
      // Here you would implement the actual file transfer logic
      // This is a simplified example
      for (let i = 0; i < transferFiles.length; i++) {
        const file = transferFiles[i];
        const fileBuffer = await file.arrayBuffer();
        // Simulate file transfer progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          updateFileProgress(transferId, file.id, progress);
        }
        updateFileStatus(transferId, file.id, 'completed');
      }
      
      updateTransferStatus(transferId, 'completed');
      enqueueSnackbar('Files sent successfully', { variant: 'success' });
    } catch (error) {
      console.error('File transfer failed:', error);
      updateTransferStatus(transferId, 'error', 'Transfer failed');
      enqueueSnackbar('Failed to send files', { variant: 'error' });
    }
  }, [connectedPeer, enqueueSnackbar]);

  const updateFileProgress = (transferId: string, fileId: string, progress: number) => {
    setTransfers(prev =>
      prev.map(transfer =>
        transfer.id === transferId
          ? {
              ...transfer,
              files: transfer.files.map(file =>
                file.id === fileId
                  ? { ...file, progress, status: 'transferring' as const }
                  : file
              ),
            }
          : transfer
      )
    );
  };

  const updateFileStatus = (transferId: string, fileId: string, status: 'pending' | 'transferring' | 'completed' | 'error', error?: string) => {
    setTransfers(prev =>
      prev.map(transfer =>
        transfer.id === transferId
          ? {
              ...transfer,
              files: transfer.files.map(file =>
                file.id === fileId
                  ? { ...file, status, error }
                  : file
              ),
            }
          : transfer
      )
    );
  };

  const updateTransferStatus = (transferId: string, status: TransferStatus, error?: string) => {
    setTransfers(prev =>
      prev.map(transfer =>
        transfer.id === transferId
          ? { ...transfer, status, error }
          : transfer
      )
    );
    
    setCurrentTransfer(prev => 
      prev?.id === transferId 
        ? { ...prev, status, error } 
        : prev
    );
  };

  const clearTransfers = useCallback(() => {
    setTransfers([]);
  }, []);

  const cancelTransfer = useCallback((transferId: string) => {
    // Here you would implement the actual cancellation logic
    // For now, we'll just update the status
    updateTransferStatus(transferId, 'error', 'Transfer cancelled');
    enqueueSnackbar('Transfer cancelled', { variant: 'info' });
  }, [enqueueSnackbar]);

  return (
    <TransferContext.Provider
      value={{
        transfers,
        currentTransfer,
        discoveredPeers,
        isDiscovering,
        isConnected,
        connectedPeer,
        sendFiles,
        startDiscovery,
        stopDiscovery,
        connectToPeer,
        disconnect,
        clearTransfers,
        cancelTransfer,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = (): TransferContextType => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};

export default TransferContext;
