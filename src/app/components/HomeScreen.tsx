'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, HardDrive, SdCard } from 'lucide-react';
import SendMode from './SendMode';
import ReceiveMode from './ReceiveMode';
import TransferEngine from '../lib/TransferEngine';

interface StorageInfo {
  internal: { used: number; total: number };
  external: { used: number; total: number } | null;
}

export default function HomeScreen() {
  const [mode, setMode] = useState<'home' | 'send' | 'receive'>('home');
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    internal: { used: 0, total: 0 },
    external: null
  });
  const transferEngine = TransferEngine.getInstance();

  useEffect(() => {
    loadStorageInfo();
    transferEngine.setProgressCallback(handleTransferProgress);
    transferEngine.setFileReceivedCallback(handleFileReceived);
  }, []);

  const handleTransferProgress = (progress: any) => {
    console.log('Transfer Progress:', progress);
  };

  const handleFileReceived = (file: File) => {
    console.log('File Received:', file);
    // Prompt user to download
    transferEngine.downloadFile(file);
  };

  const loadStorageInfo = async () => {
    try {
      setStorageInfo({
        internal: { used: 25600, total: 64000 },
        external: { used: 8500, total: 32000 }
      });
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const formatStorage = (used: number, total: number) => {
    const usedGB = (used / 1000).toFixed(1);
    const totalGB = (total / 1000).toFixed(1);
    const percentage = Math.round((used / total) * 100);
    return { usedGB, totalGB, percentage };
  };

  if (mode === 'send') {
    return <SendMode onBack={() => setMode('home')} />;
  }

  if (mode === 'receive') {
    return <ReceiveMode onBack={() => setMode('home')} />;
  }

  const internalStorage = formatStorage(storageInfo.internal.used, storageInfo.internal.total);
  const externalStorage = storageInfo.external 
    ? formatStorage(storageInfo.external.used, storageInfo.external.total)
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold font-poppins mb-2">SwiftDrop</h1>
        <p className="text-dark-400 text-sm">Fast, secure file sharing</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col space-y-6 mb-12"
      >
        <motion.button
          onClick={() => setMode('send')}
          className="flex items-center justify-center space-x-3 w-64 h-16 bg-primary text-white rounded-2xl font-semibold text-lg shadow-lg glow hover:scale-105 active:scale-95 transition-all duration-200"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={24} />
          <span>Send Files</span>
        </motion.button>

        <motion.button
          onClick={() => setMode('receive')}
          className="flex items-center justify-center space-x-3 w-64 h-16 bg-secondary text-white rounded-2xl font-semibold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)'
          }}
        >
          <Download size={24} />
          <span>Receive Files</span>
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-md space-y-4"
      >
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center space-x-3 mb-3">
            <HardDrive size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Internal Storage</h3>
          </div>
          <div className="w-full bg-dark-300 rounded-full h-3 mb-2">
            <motion.div 
              className="bg-primary h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${internalStorage.percentage}%` }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          <p className="text-sm text-dark-400">
            {internalStorage.usedGB} GB used of {internalStorage.totalGB} GB ({internalStorage.percentage}%)
          </p>
        </div>

        {externalStorage && (
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <SdCard size={20} className="text-secondary" />
              <h3 className="text-lg font-semibold">SD Card</h3>
            </div>
            <div className="w-full bg-dark-300 rounded-full h-3 mb-2">
              <motion.div 
                className="bg-secondary h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${externalStorage.percentage}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
            <p className="text-sm text-dark-400">
              {externalStorage.usedGB} GB used of {externalStorage.totalGB} GB ({externalStorage.percentage}%)
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
