import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  useMediaQuery,
  useTransition,
  styled,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WifiP2PPlugin } from '@capacitor-community/wifi-p2p';
import { Filesystem } from '@capacitor/filesystem';
import QRCodeDialog from './QRCode';
import Radar from './Radar';
import FilePicker from './FilePicker';
import SuccessAnimation from './SuccessAnimation';
import { formatStorage } from '../utils/fileUtils';
import { theme } from '../theme';

// Styled components for better control
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  transition: theme.transitions.create(['box-shadow', 'transform']),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 600,
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2]
  }
}));

const DeviceItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  transition: theme.transitions.create(['background-color', 'transform']),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)'
  }
}));

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [isRadarVisible, setIsRadarVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [radarTransition, setRadarTransition] = useTransition(isRadarVisible, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 280, friction: 40 }
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
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      <Box sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
      }}>
        <Typography variant="h4" component="h1">
          {mode === 'send' ? 'Send Files' : 'Receive Files'}
        </Typography>
        <ActionButton
          variant="outlined"
          onClick={() => setMode(prev => prev === 'send' ? 'receive' : 'send')}
        >
          Switch to {mode === 'send' ? 'Receive' : 'Send'}
        </ActionButton>
      </Box>

      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 3
      }}>
        {mode === 'send' ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledPaper>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="h6">
                    Storage Info
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: 300 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(storageInfo.used / storageInfo.total) * 100}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">
                      Used: {formatStorage(storageInfo.used)}
                    </Typography>
                    <Typography variant="body2">
                      Free: {formatStorage(storageInfo.free)}
                    </Typography>
                  </Box>
                </Box>
              </StyledPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledPaper>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6">
                    Select Files
                  </Typography>
                  <ActionButton
                    variant="contained"
                    fullWidth
                    onClick={() => setFilePickerOpen(true)}
                  >
                    Choose Files
                  </ActionButton>
                  <Box sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    height: 200,
                    overflow: 'auto'
                  }}>
                    {selectedFiles.map((file, index) => (
                      <Typography key={index} variant="body2">
                        {file}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </StyledPaper>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledPaper>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6">
                    Nearby Devices
                  </Typography>
                  {isDiscovering ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box>
                      {discoveredDevices.map((device) => (
                        <DeviceItem
                          key={device.deviceAddress}
                          onClick={() => handleDeviceSelect(device.deviceAddress)}
                        >
                          <Typography variant="body1">
                            {device.deviceName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {device.deviceAddress}
                          </Typography>
                        </DeviceItem>
                      ))}
                    </Box>
                  )}
                </Box>
              </StyledPaper>
            </Grid>

            <Grid item xs={12}>
              <ActionButton
                variant="contained"
                fullWidth
                disabled={!selectedDevice || !selectedFiles.length}
                onClick={handleSendFiles}
              >
                Send Files
              </ActionButton>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 3
          }}>
            <Typography variant="h4" component="h1" align="center">
              Ready to Receive Files
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Connect with a nearby device to start receiving files
            </Typography>
            <ActionButton
              variant="outlined"
              size="large"
              onClick={() => setQRDialogOpen(true)}
            >
              Show QR Code
            </ActionButton>
          </Box>
        )}

        {radarTransition((style, item) => (
          item && (
            <Box
              ref={containerRef}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              <Radar
                style={style}
                onClose={() => setIsRadarVisible(false)}
              />
            </Box>
          )
        ))}

        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}
            sx={{ width: '100%', bgcolor: 'background.paper' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Dialog
          open={qrDialogOpen}
          onClose={() => setQRDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 16,
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <DialogTitle>Share QR Code</DialogTitle>
          <DialogContent>
            <QRCodeDialog onClose={() => setQRDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog
          open={filePickerOpen}
          onClose={() => setFilePickerOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 16,
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <DialogTitle>Select Files</DialogTitle>
          <DialogContent>
            <FilePicker onClose={() => setFilePickerOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog
          open={successAnimationOpen}
          onClose={() => setSuccessAnimationOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 16,
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <SuccessAnimation onClose={() => setSuccessAnimationOpen(false)} />
        </Dialog>
      </Box>
    </Box>
  );
};

export default Home;
