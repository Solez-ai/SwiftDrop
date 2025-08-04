import { useState, useCallback, useEffect } from 'react';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useWifiP2P } from './useWifiP2P';
import { showError, showSuccess, showInfo } from '../utils/notificationUtils';

interface TransferProgress {
  fileName: string;
  progress: number;
  speed: number; // in KB/s
  transferred: number; // in bytes
  total: number; // in bytes
  status: 'idle' | 'preparing' | 'transferring' | 'completed' | 'error' | 'cancelled';
  error?: string;
  startTime?: number;
  lastUpdate?: number;
}

interface TransferQueueItem {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  status: 'queued' | 'in-progress' | 'completed' | 'error' | 'cancelled';
  progress: number;
  error?: string;
}

const useFileTransfer = () => {
  const [activeTransfers, setActiveTransfers] = useState<Record<string, TransferProgress>>({});
  const [transferQueue, setTransferQueue] = useState<TransferQueueItem[]>([]);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const { isConnected, sendFile, transferStatus } = useWifiP2P();

  // Process the transfer queue
  const processQueue = useCallback(async () => {
    if (isTransferring || transferQueue.length === 0 || !isConnected) return;

    const nextTransfer = transferQueue.find(item => item.status === 'queued');
    if (!nextTransfer) return;

    setIsTransferring(true);

    // Update transfer status
    setTransferQueue(prevQueue =>
      prevQueue.map(item =>
        item.id === nextTransfer.id
          ? { ...item, status: 'in-progress' }
          : item
      )
    );

    // Start the transfer
    try {
      const success = await sendFile(
        nextTransfer.filePath,
        nextTransfer.fileName,
        nextTransfer.fileSize
      );

      // Update transfer status
      setTransferQueue(prevQueue =>
        prevQueue.map(item =>
          item.id === nextTransfer.id
            ? {
                ...item,
                status: success ? 'completed' : 'error',
                progress: success ? 100 : 0,
                error: success ? undefined : 'Transfer failed',
              }
            : item
        )
      );

      if (success) {
        showSuccess(`Successfully sent ${nextTransfer.fileName}`);
      } else {
        showError(`Failed to send ${nextTransfer.fileName}`);
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      setTransferQueue(prevQueue =>
        prevQueue.map(item =>
          item.id === nextTransfer.id
            ? {
                ...item,
                status: 'error',
                progress: 0,
                error: error.message || 'Transfer error',
              }
            : item
        )
      );
      showError(`Error sending ${nextTransfer.fileName}: ${error.message}`);
    } finally {
      setIsTransferring(false);
      // Process next transfer in queue
      setTimeout(processQueue, 100);
    }
  }, [isTransferring, transferQueue, isConnected, sendFile]);

  // Handle transfer status updates
  useEffect(() => {
    if (!transferStatus) return;

    setActiveTransfers(prev => {
      const existing = prev[transferStatus.deviceAddress] || {
        fileName: transferStatus.fileName,
        progress: 0,
        speed: 0,
        transferred: 0,
        total: transferStatus.fileSize,
        status: 'idle',
        startTime: Date.now(),
        lastUpdate: Date.now(),
      };

      const now = Date.now();
      const timeDiff = (now - (existing.lastUpdate || now)) / 1000; // in seconds
      const transferredDiff = transferStatus.transferredBytes - (existing.transferred || 0);
      
      // Calculate speed in KB/s
      const speed = timeDiff > 0 ? (transferredDiff / 1024) / timeDiff : 0;

      return {
        ...prev,
        [transferStatus.deviceAddress]: {
          ...existing,
          progress: transferStatus.progress,
          speed,
          transferred: transferStatus.transferredBytes,
          status: transferStatus.status.toLowerCase(),
          lastUpdate: now,
          error: transferStatus.error,
        },
      };
    });
  }, [transferStatus]);

  // Add files to transfer queue
  const queueFiles = useCallback((files: File[] | FileList) => {
    if (!isConnected) {
      showError('Not connected to any device');
      return [];
    }

    const fileArray = Array.isArray(files) ? files : Array.from(files);
    const newTransfers: TransferQueueItem[] = [];

    fileArray.forEach(file => {
      const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      newTransfers.push({
        id: transferId,
        filePath: '', // Will be set when preparing the file
        fileName: file.name,
        fileSize: file.size,
        status: 'queued',
        progress: 0,
      });

      // Prepare the file for transfer (copy to app directory)
      prepareFileForTransfer(file, transferId);
    });

    setTransferQueue(prevQueue => [...prevQueue, ...newTransfers]);
    showInfo(`Added ${newTransfers.length} file(s) to transfer queue`);
    
    // Start processing the queue if not already doing so
    if (!isTransferring) {
      processQueue();
    }

    return newTransfers.map(t => t.id);
  }, [isConnected, isTransferring, processQueue]);

  // Prepare file for transfer (copy to app directory)
  const prepareFileForTransfer = async (file: File, transferId: string) => {
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileName = file.name;
      const filePath = `transfers/${Date.now()}_${fileName}`;
      
      // Write to app directory
      await Filesystem.writeFile({
        path: filePath,
        data: arrayBuffer as any, // TypeScript workaround
        directory: Directory.Data,
        recursive: true,
      });

      // Update the transfer with the file path
      setTransferQueue(prevQueue =>
        prevQueue.map(item =>
          item.id === transferId
            ? { ...item, filePath: `${Directory.Data}/${filePath}`, status: 'queued' as const }
            : item
        )
      );

      // Process the queue if not already doing so
      if (!isTransferring) {
        processQueue();
      }
    } catch (error) {
      console.error('Error preparing file for transfer:', error);
      
      // Update transfer status with error
      setTransferQueue(prevQueue =>
        prevQueue.map(item =>
          item.id === transferId
            ? {
                ...item,
                status: 'error',
                error: 'Failed to prepare file for transfer',
              }
            : item
        )
      );
      
      showError(`Failed to prepare ${file.name} for transfer`);
    }
  };

  // Cancel a transfer
  const cancelTransfer = useCallback((transferId: string) => {
    setTransferQueue(prevQueue =>
      prevQueue.map(item =>
        item.id === transferId
          ? { ...item, status: 'cancelled', progress: 0 }
          : item
      )
    );
    showInfo('Transfer cancelled');
    
    // If this was the active transfer, process the next one
    if (isTransferring) {
      setIsTransferring(false);
      processQueue();
    }
  }, [isTransferring, processQueue]);

  // Clear completed transfers
  const clearCompletedTransfers = useCallback(() => {
    setTransferQueue(prevQueue => prevQueue.filter(item => item.status !== 'completed'));
  }, []);

  // Get transfer by ID
  const getTransfer = useCallback((transferId: string) => {
    return transferQueue.find(item => item.id === transferId);
  }, [transferQueue]);

  // Get active transfer
  const getActiveTransfer = useCallback(() => {
    return transferQueue.find(item => item.status === 'in-progress');
  }, [transferQueue]);

  return {
    // State
    activeTransfers,
    transferQueue,
    isTransferring,
    
    // Methods
    queueFiles,
    cancelTransfer,
    clearCompletedTransfers,
    getTransfer,
    getActiveTransfer,
    processQueue,
  };
};

export default useFileTransfer;
