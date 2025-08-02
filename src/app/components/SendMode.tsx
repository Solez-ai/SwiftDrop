'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Smartphone, QrCode, Radar } from 'lucide-react';
import { generateQRCode } from '../utils/qrCodeUtil';
import PermissionManager from '../lib/PermissionManager';
import TransferEngine from '../lib/TransferEngine';

interface Props {
  onBack: () => void;
}

interface Device {
  id: string;
  name: string;
  distance: number;
  angle: number;
}

export default function SendMode({ onBack }: Props) {
  const [mode, setMode] = useState<'radar' | 'qr'>('radar');
  const [devices, setDevices] = useState<Device[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [permissions, setPermissions] = useState({ bluetooth: false, location: false });
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    checkPermissions();
    if (mode === 'radar') {
      startDeviceScanning();
    } else {
      generateConnectionQR();
    }
  }, [mode]);

  const checkPermissions = async () => {
    const permissionManager = PermissionManager.getInstance();
    const bluetooth = await permissionManager.requestBluetoothPermission();
    const location = await permissionManager.requestLocationPermission();
    setPermissions({ bluetooth, location });
  };

  const startDeviceScanning = () => {
    setScanning(true);
    
    // Use TransferEngine for real device discovery
    const transferEngine = TransferEngine.getInstance();
    transferEngine.setPeerDiscoveredCallback((peer) => {
      setDevices(prev => [...prev, {
        id: peer.id,
        name: peer.name,
        distance: Math.random() * 150,
        angle: Math.random() * 360
      }]);
    });
    
    transferEngine.startDeviceDiscovery();
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        console.log('Selected files:', files);
        // Here you would typically send the files to a selected device
        // For demo, let's show an alert
        alert(`Selected ${files.length} file(s). Click on a device to send.`);
      }
    };
    input.click();
  };

  const handleDeviceClick = async (device: Device) => {
    const transferEngine = TransferEngine.getInstance();
    try {
      await transferEngine.connectToPeer(device.id, device.name);
      console.log('Connected to device:', device.name);
      
      // For demo, create a test file
      const testFile = new File(['Hello from SwiftDrop!'], 'test.txt', { type: 'text/plain' });
      await transferEngine.sendFile(testFile, device.id);
      
      alert(`File sent to ${device.name}!`);
    } catch (error) {
      console.error('Failed to send file:', error);
      alert('Failed to send file. Please try again.');
    }
  };

  const generateConnectionQR = async () => {
    try {
      const connectionData = {
        sessionId: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        deviceName: 'SwiftDrop Device'
      };
      const qrDataUrl = await generateQRCode(JSON.stringify(connectionData));
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const getDevicePosition = (distance: number, angle: number) => {
    const centerX = 128; // Half of radar width (256px)
    const centerY = 128;
    const maxRadius = 100; // Maximum radar radius
    const radius = (distance / 150) * maxRadius; // Scale distance to radar

    const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

    return { x, y };
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-dark-400 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold">Send Files</h1>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="glass p-1 rounded-full">
          <button
            onClick={() => setMode('radar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              mode === 'radar' ? 'bg-primary text-white' : 'text-dark-400 hover:text-foreground'
            }`}
          >
            <Radar size={16} />
            <span>Radar</span>
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              mode === 'qr' ? 'bg-primary text-white' : 'text-dark-400 hover:text-foreground'
            }`}
          >
            <QrCode size={16} />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1">
        <AnimatePresence mode="wait">
          {mode === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              {/* Radar Display */}
              <div className="relative w-64 h-64 rounded-full bg-dark-100/20 border-2 border-primary/30 overflow-hidden">
                {/* Radar Sweep */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 340deg, rgba(79, 70, 229, 0.6) 360deg)'
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Radar Rings */}
                <div className="absolute inset-0 rounded-full border border-primary/20" />
                <div className="absolute inset-4 rounded-full border border-primary/20" />
                <div className="absolute inset-8 rounded-full border border-primary/20" />
                <div className="absolute inset-12 rounded-full border border-primary/20" />

                {/* Center Device */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                </div>

                {/* Detected Devices */}
                {devices.map((device) => {
                  const position = getDevicePosition(device.distance, device.angle);
                  return (
                    <motion.div
                      key={device.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: position.x, top: position.y }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => console.log('Connect to:', device.name)}
                    >
                      <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-dark-100 px-2 py-1 rounded">
                        {device.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Status */}
              <div className="text-center mt-6">
                <p className="text-dark-400 mb-2">
                  {scanning ? 'Scanning for nearby devices...' : 'Scan complete'}
                </p>
                <p className="text-sm">
                  Found {devices.length} device{devices.length !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.div>
          )}

          {mode === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              {qrCode && (
                <div className="glass p-6 rounded-2xl">
                  <img src={qrCode} alt="Connection QR Code" className="w-48 h-48 mx-auto" />
                  <p className="text-dark-400 mt-4">Ask the receiver to scan this code</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Permission Warnings */}
      {(!permissions.bluetooth || !permissions.location) && (
        <div className="fixed bottom-20 left-4 right-4 glass p-4 rounded-lg">
          <p className="text-sm text-center text-yellow-400">
            {!permissions.bluetooth && 'Bluetooth permission required for device discovery. '}
            {!permissions.location && 'Location permission required for nearby device scanning.'}
          </p>
        </div>
      )}
    </div>
  );
}
