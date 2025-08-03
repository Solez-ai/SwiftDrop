import React from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { QRCode as QRCodeComponent } from 'qrcode.react';
import type { WifiP2PPlugin } from '../types/wifi-p2p';

interface QRCodeProps {
  open: boolean;
  onClose: () => void;
  deviceAddress: string;
  onConnect?: (address: string) => void;
}

const QRCodeDialog: React.FC<QRCodeProps> = ({ open, onClose, deviceAddress, onConnect }) => {
  const qrValue = `swift-drop://${deviceAddress}`;

  const handleScan = async (address: string) => {
    try {
      // TODO: Implement actual WiFi P2P connection logic
      onConnect?.(address);
      onClose();
    } catch (error: unknown) {
      console.error('Error connecting via QR:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Connection</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" align="center">
            Scan this QR code to connect with another device
          </Typography>
          <QRCodeComponent
            value={qrValue}
            size={256}
            level="H"
            includeMargin
          />
          <Typography variant="caption" align="center">
            {deviceAddress}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleScan(deviceAddress)}
            sx={{ mt: 2 }}
          >
            Connect with this device
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
