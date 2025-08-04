import { useState, useCallback } from 'react';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { showError } from '../utils/notificationUtils';

interface UseFileSystemReturn {
  readFile: (path: string) => Promise<string | null>;
  writeFile: (path: string, data: string, directory?: Directory) => Promise<boolean>;
  deleteFile: (path: string) => Promise<boolean>;
  readDirectory: (path: string) => Promise<FileInfo[]>;
  createDirectory: (path: string, directory?: Directory) => Promise<boolean>;
  deleteDirectory: (path: string) => Promise<boolean>;
  getFileInfo: (path: string) => Promise<FileInfo | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to handle file system operations
 * @returns {UseFileSystemReturn} File system operations and state
 */
const useFileSystem = (): UseFileSystemReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const readFile = useCallback(async (path: string): Promise<string | null> => {
    if (!Capacitor.isNativePlatform()) {
      try {
        const response = await fetch(path);
        return await response.text();
      } catch (err) {
        console.error('Error reading file in web:', err);
        return null;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await Filesystem.readFile({
        path,
        directory: Directory.Data,
        encoding: 'utf8',
      });
      return data as string;
    } catch (err) {
      const errorMsg = `Error reading file: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const writeFile = useCallback(async (
    path: string, 
    data: string, 
    directory: Directory = Directory.Data
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('File writing is not supported in web mode');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await Filesystem.writeFile({
        path,
        data,
        directory,
        encoding: 'utf8',
      });
      return true;
    } catch (err) {
      const errorMsg = `Error writing file: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('File deletion is not supported in web mode');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data,
      });
      return true;
    } catch (err) {
      const errorMsg = `Error deleting file: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const readDirectory = useCallback(async (path: string): Promise<FileInfo[]> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Directory reading is not fully supported in web mode');
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const { files } = await Filesystem.readdir({
        path,
        directory: Directory.Data,
      });
      return files;
    } catch (err) {
      const errorMsg = `Error reading directory: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createDirectory = useCallback(async (
    path: string, 
    directory: Directory = Directory.Data
  ): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Directory creation is not supported in web mode');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await Filesystem.mkdir({
        path,
        directory,
        recursive: true,
      });
      return true;
    } catch (err) {
      const errorMsg = `Error creating directory: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDirectory = useCallback(async (path: string): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Directory deletion is not supported in web mode');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await Filesystem.rmdir({
        path,
        directory: Directory.Data,
        recursive: true,
      });
      return true;
    } catch (err) {
      const errorMsg = `Error deleting directory: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFileInfo = useCallback(async (path: string): Promise<FileInfo | null> => {
    if (!Capacitor.isNativePlatform()) {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (!response.ok) return null;
        
        return {
          name: path.split('/').pop() || '',
          type: 'file',
          size: parseInt(response.headers.get('content-length') || '0', 10),
          mtime: new Date(response.headers.get('last-modified') || '').getTime() / 1000,
          ctime: 0,
          uri: path,
        };
      } catch (err) {
        console.error('Error getting file info in web:', err);
        return null;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const fileInfo = await Filesystem.stat({
        path,
        directory: Directory.Data,
      });
      return fileInfo;
    } catch (err) {
      // Don't show error for non-existent files
      if (err.message?.includes('does not exist')) {
        return null;
      }
      const errorMsg = `Error getting file info: ${err}`;
      setError(errorMsg);
      await showError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    readFile,
    writeFile,
    deleteFile,
    readDirectory,
    createDirectory,
    deleteDirectory,
    getFileInfo,
    loading,
    error,
  };
};

export default useFileSystem;
