import React from 'react';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import { Box, Typography, Button } from '@mui/material';

interface SuccessAnimationProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ open, onClose, message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        display: open ? 'block' : 'none'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckIcon sx={{ fontSize: 64, color: 'success.main' }} />
        </motion.div>
        <Typography variant="h6" gutterBottom>
          Success!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="outlined" onClick={onClose}>Close</Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default SuccessAnimation;
