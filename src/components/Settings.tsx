import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  ListItemSecondaryAction,
  FormControlLabel,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../contexts/ThemeContext';
import { useTransfer } from '../contexts/TransferContext';

const Settings: React.FC = () => {
  const theme = useTheme();
  const { themeMode, toggleThemeMode } = useThemeContext();
  const { clearTransfers } = useTransfer();
  const [deviceName, setDeviceName] = React.useState('My Device');

  const handleClearHistory = () => {
    clearTransfers();
    // Show success message or notification
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={2} sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemText 
              primary="Dark Mode" 
              secondary="Enable dark theme" 
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={themeMode === 'dark'}
                onChange={toggleThemeMode}
                inputProps={{ 'aria-labelledby': 'dark-mode-switch' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Device Name" 
              secondary="Change how your device appears to others" 
            />
            <TextField
              size="small"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              variant="outlined"
              sx={{ minWidth: 200 }}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Clear Transfer History" 
              secondary="Remove all transfer records" 
            />
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleClearHistory}
            >
              Clear
            </Button>
          </ListItem>
        </List>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          SwiftDrop v1.0.0
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          A fast and easy way to share files between devices using WiFi Direct
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          © {new Date().getFullYear()} SwiftDrop. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;
