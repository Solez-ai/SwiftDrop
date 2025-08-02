import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import QrScanner from 'qr-scanner';

interface Props {
  onBack: () => void;
}

export default function ReceiveMode({ onBack }: Props) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => console.log('QR code scanned:', result)
      );
      qrScanner.start();

      return () => qrScanner.stop();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <h2 className="text-2xl font-bold mb-4">Receive Mode</h2>
      <div className="flex space-x-4 mb-8">
        <motion.div
          className="rounded-lg bg-dark-500 p-8 border border-primary hover:scale-105 transition-all duration-150"
        >
          <video ref={videoRef} className="w-48 h-48" />
        </motion.div>
      </div>
      <motion.button
        onClick={onBack}
        className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary-dark transition-all"
      >
        Back
      </motion.button>
    </div>
  );
}

