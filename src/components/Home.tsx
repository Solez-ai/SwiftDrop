import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
  LinearProgress,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WifiP2PPlugin } from '@capacitor-community/wifi-p2p';
import { Filesystem } from '@capacitor/filesystem';
import QRCodeDialog from './QRCode';
import Radar from './Radar';
import FilePicker from './FilePicker';
import SuccessAnimation from './SuccessAnimation';
import { formatStorage } from '../utils/fileUtils';

interface Device {
  deviceAddress: string;
  deviceName: string;
  status: number;
  isGroupOwner?: boolean;
}

interface TransferProgressEvent {
  progress: number;
}

interface TransferCompleteEvent {
  filePath: string;
}

interface ConnectionFailedEvent {
  reason: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [transferProgress, setTransferProgress] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [successAnimationOpen, setSuccessAnimationOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState({
    total: 0,
    used: 0,
    free: 0
  });

  useEffect(() => {
    initializeWifiP2P();
    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 30000);
    return () => {
      cleanupWifiP2P();
      clearInterval(interval);
    };
  }, []);

  const updateStorageInfo = async () => {
    try {
      const stats = await Filesystem.getFreeStorage();
      const total = stats.totalBytes;
      const used = total - stats.freeBytes;
      const free = stats.freeBytes;
      setStorageInfo({ total, used, free });
    } catch (error) {
      console.error('Error getting storage info:', error);
    }
  };

  const initializeWifiP2P = useCallback(async () => {
    try {
      await WifiP2PPlugin.initialize();
      
      // Listen for device discovery
      WifiP2PPlugin.addListener('deviceDiscovered', (event: { devices: Device[] }) => {
        setDiscoveredDevices(event.devices);
      });

      // Listen for connection status
      WifiP2PPlugin.addListener('connectionSuccess', (event: { isGroupOwner: boolean }) => {
        setIsConnected(true);
        setIsGroupOwner(event.isGroupOwner);
      });

      // Listen for transfer progress
      WifiP2PPlugin.addListener('transferProgress', (event: TransferProgressEvent) => {
        setTransferProgress(event.progress);
      });

      // Listen for transfer complete
      WifiP2PPlugin.addListener('transferComplete', (event: TransferCompleteEvent) => {
        setSuccessAnimationOpen(true);
        setTimeout(() => setSuccessAnimationOpen(false), 3000);
      });

      // Listen for connection failed
      WifiP2PPlugin.addListener('connectionFailed', (event: ConnectionFailedEvent) => {
        setSnackbarMessage(`Connection failed: ${event.reason}`);
        setShowSnackbar(true);
      });
    } catch (error) {
      console.error('Error initializing WiFi P2P:', error);
      setSnackbarMessage(`Initialization error: ${error.message}`);
      setShowSnackbar(true);
    }
  }, []);

  const cleanupWifiP2P = useCallback(async () => {
    try {
      await WifiP2PPlugin.cleanup();
    } catch (error) {
      console.error('Error cleaning up WiFi P2P:', error);
    }
  }, []);

  const handleSendClick = async () => {
    if (!isConnected) {
      setIsDiscovering(true);
      try {
        await WifiP2PPlugin.startDiscovery();
      } catch (error) {
        console.error('Error starting discovery:', error);
        setIsDiscovering(false);
      }
    }
  };

  const handleReceiveClick = async () => {
    try {
      await WifiP2PPlugin.startDiscovery();
      setIsConnected(true);
    } catch (error) {
      console.error('Error starting receive mode:', error);
    }
  };

  const handleDeviceSelect = async (deviceAddress: string) => {
    try {
      await WifiP2PPlugin.connectToDevice({ deviceAddress });
      setSelectedDevice(deviceAddress);
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };

  const handleFileSelect = async (files: string[]) => {
    setSelectedFiles(files);
  };

  const handleSendFiles = async () => {
    try {
      if (selectedFiles.length === 0) {
        throw new Error('No files selected');
      }

      if (!selectedDevice) {
        throw new Error('No device selected');
      }

      setSnackbarMessage('Sending files...');
      setShowSnackbar(true);

      for (const file of selectedFiles) {
        const fileInfo = await Filesystem.stat({ path: file });
        if (!fileInfo.exists) {
          throw new Error(`File not found: ${file}`);
        }
        
        await WifiP2PPlugin.sendFile({ filePath: file });
      }

      setSnackbarMessage('Files sent successfully!');
      setShowSnackbar(true);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error sending files:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setShowSnackbar(true);
    }
  };

  const handleStop = async () => {
    try {
      await WifiP2PPlugin.stopDiscovery();
      setIsDiscovering(false);
      setIsConnected(false);
      setSelectedDevice(null);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setMode('send')}
          sx={{ flex: 1 }}
        >
          Send Files
        </Button>
        <Button
          variant="contained"
          onClick={() => setMode('receive')}
          sx={{ flex: 1 }}
        >
          Receive Files
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {mode === 'send' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Available Storage: {formatStorage(storageInfo.free)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(storageInfo.used / storageInfo.total) * 100}
              sx={{ height: 4 }}
            />
          </Box>
        )}
        {mode === 'send' ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleSendClick}
                disabled={isDiscovering}
                startIcon={isDiscovering ? <CircularProgress size={20} /> : undefined}
              >
                {isDiscovering ? 'Discovering...' : 'Discover Devices'}
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setFilePickerOpen(true)}
                disabled={selectedDevice === null}
              >
                Select Files
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleSendFiles}
                disabled={selectedDevice === null || selectedFiles.length === 0}
              >
                Send Files
              </Button>
            </Box>

            {selectedDevice && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Selected Device: {selectedDevice}
                </Typography>
              </Box>
            )}

            {selectedFiles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Selected Files: {selectedFiles.length}
                </Typography>
              </Box>
            )}

            {discoveredDevices.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Discovered Devices:</Typography>
                <Grid container spacing={2}>
                  {discoveredDevices.map((device) => (
                    <Grid item xs={12} sm={6} md={4} key={device.deviceAddress}>
                      <Paper
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleDeviceSelect(device.deviceAddress)}
                      >
                        <Typography variant="h6" gutterBottom>
                          {device.deviceName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {device.deviceAddress}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {device.status}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {transferProgress > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Transfer Progress:</Typography>
                <LinearProgress variant="determinate" value={transferProgress} />
              </Box>
            )}
          </>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleReceiveClick}
                disabled={isConnected}
              >
                {isConnected ? 'Receiving...' : 'Start Receiving'}
              </Button>
            </Box>

            {isConnected && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Waiting for files...
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      <QRCodeDialog
        open={qrDialogOpen}
        onClose={() => setQRDialogOpen(false)}
        deviceAddress={selectedDevice || ''}
      />

      <FilePicker
        open={filePickerOpen}
        onClose={() => setFilePickerOpen(false)}
        onFilesSelected={handleFileSelect}
        storageInfo={storageInfo}
      />

      <SuccessAnimation
        open={successAnimationOpen}
        onClose={() => setSuccessAnimationOpen(false)}
      />

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
