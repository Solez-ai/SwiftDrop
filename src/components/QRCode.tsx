import React from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import QRCode from 'qrcode.react';
import { WifiP2PPlugin } from '../types/wifi-p2p';

interface QRCodeProps {
  open: boolean;
  onClose: () => void;
  deviceAddress: string;
}

const QRCodeDialog: React.FC<QRCodeProps> = ({ open, onClose, deviceAddress }) => {
  const qrValue = `swift-drop://${deviceAddress}`;

  const handleScan = async (address: string) => {
    try {
      await WifiP2PPlugin.connectToDevice({ deviceAddress: address });
      onClose();
    } catch (error) {
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
          <QRCode
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
