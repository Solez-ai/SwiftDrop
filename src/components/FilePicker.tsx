import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem as MuiListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface FilePickerProps {
  onFilesSelected: (files: string[]) => void;
  onClose: () => void;
}

interface FileItem {
  path: string;
  name: string;
  isDirectory: boolean;
  size?: number;
  type?: string;
  mimeType?: string;
}

const FilePicker: React.FC<FilePickerProps> = ({ onFilesSelected, onClose }) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  React.useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await Filesystem.readdir({
        path: currentPath,
        directory: Directory.ExternalStorage
      });
      const files = result.files || [];

      const fileItems = files.files.map(file => ({
        path: `${currentPath}/${file.name}`,
        name: file.name,
        isDirectory: file.type === 'directory',
        size: file.size,
        type: getFileType(file.name),
        mimeType: getFileMimeType(file.name)
      }));
      
      setFiles(fileItems);
    } catch (error: unknown) {
      console.error('Error loading files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSnackbarMessage(`Error loading files: ${errorMessage}`);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (!extension) return 'document';
    if (extension === 'apk') return 'apk';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['mp4', 'avi', 'mkv'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'aac'].includes(extension)) return 'audio';
    return 'document';
  };

  const getFileMimeType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes = {
      apk: 'application/vnd.android.package-archive',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const handleFileSelect = (file: FileItem) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
    } else {
      if (selectedFiles.includes(file.path)) {
        setSelectedFiles(selectedFiles.filter(f => f !== file.path));
      } else {
        setSelectedFiles([...selectedFiles, file.path]);
      }
    }
  };

  const handleBack = () => {
    if (currentPath === '') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(parentPath);
  };

  const handleConfirm = () => {
    onFilesSelected(selectedFiles);
    onClose();
  };

  const renderFileSize = (size: number) => {
    if (!size) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (file: FileItem) => {
    if (file.isDirectory) return <FolderIcon />;
    switch (file.type) {
      case 'apk':
        return <FileIcon sx={{ color: 'primary.main' }} />;
      case 'image':
        return <FileIcon sx={{ color: 'secondary.main' }} />;
      case 'video':
        return <FileIcon sx={{ color: 'error.main' }} />;
      case 'audio':
        return <FileIcon sx={{ color: 'warning.main' }} />;
      default:
        return <FileIcon />;
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} disabled={currentPath === ''}>
            <FolderIcon />
          </IconButton>
          <Typography variant="h6">
            {currentPath || 'File System'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {files.map((file) => (
              <MuiListItem
                key={file.path}
                component="div"
                button
                onClick={() => handleFileSelect(file)}
                sx={{ backgroundColor: selectedFiles.includes(file.path) ? 'action.selected' : 'transparent' }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {file.isDirectory ? <FolderIcon /> : <FileIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={file.name}
                  secondary={file.isDirectory ? null : `${renderFileSize(file.size || 0)} • ${file.type.toUpperCase()}`}
                />
              </MuiListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedFiles.length === 0}
        >
          Select {selectedFiles.length} Files
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePicker;
