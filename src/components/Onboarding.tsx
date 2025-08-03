import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  onThemeSelect: (theme: 'white' | 'black' | 'monospace') => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onThemeSelect }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [theme, setTheme] = useState('white');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const steps = [
    {
      title: "Welcome to SwiftDrop",
      description: "The fastest way to share files between Android devices using Wi-Fi Direct",
      image: "welcome.png"
    },
    {
      title: "No Internet Needed",
      description: "Share files directly between devices without any internet connection",
      image: "offline.png"
    },
    {
      title: "Choose Your Theme",
      description: "Select your preferred theme for a personalized experience",
      image: "theme.png"
    }
  ];

  const handleThemeSelect = (selectedTheme: 'white' | 'black' | 'monospace') => {
    setTheme(selectedTheme);
    onThemeSelect(selectedTheme);
    localStorage.setItem('swift-drop-theme', selectedTheme);
    setCurrentStep(currentStep + 1);
  };

  const handlePermissionRequest = () => {
    // This will be implemented with Capacitor permissions
    setPermissionDialogOpen(true);
  };

  const handlePermissionResponse = (granted: boolean) => {
    setPermissionsGranted(granted);
    if (granted) {
      navigate('/home');
    }
    setPermissionDialogOpen(false);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4 
    }}>
      {currentStep < steps.length ? (
        <>
          <img 
            src={`/src/assets/onboarding/${steps[currentStep].image}`} 
            alt={steps[currentStep].title}
            style={{ maxWidth: '300px', marginBottom: '20px' }}
          />
          <Typography variant="h4" align="center" gutterBottom>
            {steps[currentStep].title}
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            {steps[currentStep].description}
          </Typography>
          {currentStep === 2 ? (
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleThemeSelect('white')}
                sx={{ flex: 1 }}
              >
                White Matte
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleThemeSelect('black')}
                sx={{ flex: 1 }}
              >
                Black Matte
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleThemeSelect('monospace')}
                sx={{ flex: 1 }}
              >
                Monospace
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => setCurrentStep(currentStep + 1)}
              sx={{ mt: 4 }}
            >
              Next
            </Button>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to Start!
          </Typography>
          <Button
            variant="contained"
            onClick={handlePermissionRequest}
            sx={{ mt: 4 }}
          >
            Grant Permissions
          </Button>
        </Box>
      )}

      <Dialog open={permissionDialogOpen} onClose={() => handlePermissionResponse(false)}>
        <DialogTitle>Required Permissions</DialogTitle>
        <DialogContent>
          <Typography>
            SwiftDrop needs the following permissions to function properly:
            <ul>
              <li>Location access (for WiFi Direct)</li>
              <li>Storage access (for file transfers)</li>
              <li>WiFi Direct access (for peer-to-peer communication)</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePermissionResponse(false)}>Cancel</Button>
          <Button onClick={() => handlePermissionResponse(true)} color="primary">
            Grant Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Onboarding;
