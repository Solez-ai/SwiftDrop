import { Filesystem, Directory, FilesystemEncoding } from '@capacitor/filesystem';
import { WifiP2PPlugin } from '@capacitor-community/wifi-p2p';

export const getFileSize = async (path: string): Promise<number> => {
  try {
    const fileInfo = await Filesystem.stat({ path });
    return fileInfo.size || 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

export const formatFileSize = (size: number): string => {
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const getAvailableSpace = async (): Promise<number> => {
  try {
    const stats = await Filesystem.getFreeStorage();
    return stats.freeBytes;
  } catch (error) {
    console.error('Error getting available space:', error);
    return 0;
  }
};

export const formatStorage = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  return `${bytes.toFixed(1)} ${units[unitIndex]}`;
};

export const validateFile = async (path: string): Promise<boolean> => {
  try {
    const fileInfo = await Filesystem.stat({ path });
    return fileInfo.exists && fileInfo.size > 0;
  } catch (error) {
    console.error('Error validating file:', error);
    return false;
  }
};

export const installAPK = async (path: string): Promise<void> => {
  try {
    await WifiP2PPlugin.installAPK({ filePath: path });
  } catch (error) {
    console.error('Error installing APK:', error);
    throw new Error('Failed to install APK');
  }
};

export const checkStorageSpace = async (files: string[]): Promise<boolean> => {
  try {
    const totalSize = await Promise.all(files.map(getFileSize));
    const requiredSpace = totalSize.reduce((a, b) => a + b, 0);
    const availableSpace = await getAvailableSpace();
    
    return availableSpace >= requiredSpace;
  } catch (error) {
    console.error('Error checking storage space:', error);
    return false;
  }
};
