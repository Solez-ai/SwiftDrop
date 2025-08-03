import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { WifiP2PPlugin, Device } from '../types/wifi-p2p';

interface RadarProps {
  devices: Device[];
}

const Radar: React.FC<RadarProps> = ({ devices }) => {
  const container = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const animateScan = async () => {
      setIsScanning(true);
      await controls.start({
        rotate: [0, 360],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }
      });
    };

    animateScan();

    return () => {
      controls.stop();
      setIsScanning(false);
    };
  }, [controls]);

  const renderDevice = (device: Device, index: number) => {
    const angle = (index / devices.length) * 360;
    const radius = 150;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;

    return (
      <motion.div
        key={device.deviceAddress}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
          position: 'absolute',
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            minWidth: 120,
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <Typography variant="body2" noWrap>
            {device.deviceName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Signal: {device.status}
          </Typography>
        </Paper>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <motion.div
        ref={container}
        style={{
          width: 300,
          height: 300,
          position: 'relative',
          borderRadius: '50%'
        }}
        animate={controls}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress
            size={40}
            sx={{ color: 'primary.main' }}
          />
        </Box>
      </motion.div>
      {devices.map((device, index) => renderDevice(device, index))}
    </Box>
  );
};

export default Radar;
