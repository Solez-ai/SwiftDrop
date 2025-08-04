import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { WifiP2P } from '@capacitor-community/wifi-p2p';
import Onboarding from './components/Onboarding';
import Home from './pages/Home';
import TransferPage from './pages/TransferPage';
import Settings from './pages/Settings';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import DeviceDiscovery from './components/DeviceDiscovery';
import ConnectionStatus from './components/ConnectionStatus';
import './App.css';

const themes = {
  white: createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
        paper: '#ffffff'
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        disabled: '#cccccc'
      },
      action: {
        active: '#000000',
        hover: '#333333',
        selected: '#000000',
        disabled: '#cccccc'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#000000',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#000000'
          }
        }
      }
    }
  }),
  black: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#000000',
        paper: '#000000'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        disabled: '#666666'
      },
      action: {
        active: '#ffffff',
        hover: '#cccccc',
        selected: '#ffffff',
        disabled: '#666666'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#ffffff'
          }
        }
      }
    }
  }),
  monospace: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#59534c',
        paper: '#59534c'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        disabled: '#888888'
      },
      action: {
        active: '#ffffff',
        hover: '#cccccc',
        selected: '#ffffff',
        disabled: '#888888'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#666666'
            }
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#ffffff'
          }
        }
      }
    }
  })
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeviceDiscovery, setShowDeviceDiscovery] = useState(false);
  const [themeMode, setThemeMode] = useState<'white' | 'black'>('white');
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const onboardedStatus = localStorage.getItem('onboarded');
        setOnboarded(onboardedStatus === 'true');

        const { devices } = await WifiP2P.getConnectedPeers();
        setIsConnected(devices && devices.length > 0);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to initialize WiFi P2P. Please restart the app.');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    const setupConnectionListener = async () => {
      try {
        const listener = await WifiP2P.addListener('onConnectionChanged', (connected: boolean) => {
          setIsConnected(connected);
          if (!connected) {
            // Handle disconnection
          }
        });
        return () => listener.remove();
      } catch (err) {
        console.error('Error setting up connection listener:', err);
      }
    };

    setupConnectionListener();
  }, []);

  const handleOnboardingComplete = () => {
    setOnboarded(true);
    localStorage.setItem('onboarded', 'true');
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'white' ? 'black' : 'white');
  };

  const handleDeviceSelect = async (device: any) => {
    try {
      setIsLoading(true);
      await WifiP2P.connect({ deviceAddress: device.deviceAddress });
      setIsConnected(true);
      setShowDeviceDiscovery(false);
    } catch (err) {
      console.error('Error connecting to device:', err);
      setError(`Failed to connect to ${device.deviceName || 'device'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await WifiP2P.disconnect();
      await WifiP2P.stopGroup();
      setIsConnected(false);
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={themes[themeMode]}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Routes>
            <Route path="/onboarding" element={
              !onboarded ? (
                <Onboarding onComplete={handleOnboardingComplete} />
              ) : (
                <Navigate to="/" replace />
              )
            } />
            <Route path="/" element={
              onboarded ? (
                <Layout onToggleTheme={toggleTheme} themeMode={themeMode}>
                  <Home onDiscoverDevices={() => setShowDeviceDiscovery(true)} />
                </Layout>
              ) : (
                <Navigate to="/onboarding" replace />
              )
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {onboarded && isConnected && (
            <ConnectionStatus onDisconnect={handleDisconnect} />
          )}

          {showDeviceDiscovery && (
            <DeviceDiscovery 
              onDeviceSelect={handleDeviceSelect}
              onClose={() => setShowDeviceDiscovery(false)}
            />
          )}

          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
