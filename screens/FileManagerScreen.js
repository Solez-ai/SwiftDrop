import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, FlatList, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const categories = [
  { key: 'all', label: 'All Files', icon: 'folder-multiple' },
  { key: 'photos', label: 'Photos', icon: 'image' },
  { key: 'videos', label: 'Videos', icon: 'video' },
  { key: 'music', label: 'Music', icon: 'music' },
  { key: 'documents', label: 'Documents', icon: 'file-document' },
  { key: 'apks', label: 'APKs', icon: 'android' },
  { key: 'apps', label: 'Apps', icon: 'application' },
];

const mediaTypeMap = {
  photos: MediaLibrary.MediaType.photo,
  videos: MediaLibrary.MediaType.video,
  music: MediaLibrary.MediaType.audio,
  documents: null, // handled separately
  apks: null, // handled separately
  apps: null, // handled separately
};

const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'];
const apkExt = '.apk';

export default function FileManagerScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // { uri, type }
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [apps, setApps] = useState([]); // Placeholder for installed apps

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission, selectedCategory]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedCategory === 'all' || mediaTypeMap[selectedCategory]) {
        let mediaType = mediaTypeMap[selectedCategory];
        let assets = [];
        if (mediaType) {
          const res = await MediaLibrary.getAssetsAsync({ mediaType, first: 100 });
          assets = res.assets;
        } else if (selectedCategory === 'all') {
          const res = await MediaLibrary.getAssetsAsync({ first: 100 });
          assets = res.assets;
        }
        setMediaFiles(assets);
      } else if (selectedCategory === 'documents') {
        const res = await MediaLibrary.getAssetsAsync({ first: 200 });
        setMediaFiles(res.assets.filter(a => docExts.some(ext => a.filename.toLowerCase().endsWith(ext))));
      } else if (selectedCategory === 'apks') {
        const apkFiles = await findFilesWithExtension(FileSystem.documentDirectory, apkExt);
        setMediaFiles(apkFiles);
      } else if (selectedCategory === 'apps') {
        // Installed apps listing is not available in Expo/React Native for security reasons
        setApps([]); // Placeholder: could show APKs as fallback
        setMediaFiles([]);
      }
    } catch (e) {
      setError('Failed to load files.');
    }
    setLoading(false);
  };

  // Helper to find files by extension (for APKs, etc.)
  const findFilesWithExtension = async (dir, ext) => {
    let results = [];
    try {
      const files = await FileSystem.readDirectoryAsync(dir);
      for (const file of files) {
        const path = dir + file;
        const info = await FileSystem.getInfoAsync(path);
        if (info.isDirectory) {
          results = results.concat(await findFilesWithExtension(path + '/', ext));
        } else if (file.toLowerCase().endsWith(ext)) {
          results.push({ id: path, filename: file, uri: path, type: 'apk' });
        }
      }
    } catch (e) {}
    return results;
  };

  const toggleSelect = (id) => {
    setSelectedFiles(selectedFiles.includes(id)
      ? selectedFiles.filter(f => f !== id)
      : [...selectedFiles, id]);
  };

  const renderFileItem = ({ item: file }) => {
    let icon = 'file';
    let thumb = null;
    if (file.mediaType === 'photo') {
      thumb = <Image source={{ uri: file.uri }} className="w-16 h-16 rounded-lg" accessibilityLabel={file.filename} />;
    } else if (file.mediaType === 'video') {
      thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="video" size={32} color="#22D3EE" /></View>;
    } else if (file.mediaType === 'audio') {
      thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="music" size={32} color="#22D3EE" /></View>;
    } else if (file.type === 'apk') {
      thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="android" size={32} color="#22D3EE" /></View>;
    } else if (docExts.some(ext => (file.filename || '').toLowerCase().endsWith(ext))) {
      thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="file-document" size={32} color="#22D3EE" /></View>;
    } else {
      thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="file" size={32} color="#64748B" /></View>;
    }
    return (
      <TouchableOpacity
        key={file.id}
        className={`m-1 p-2 rounded-xl bg-white/10 ${selectedFiles.includes(file.id) ? 'border-2 border-purple' : ''}`}
        accessibilityRole="button"
        accessibilityLabel={`File: ${file.filename || file.name}`}
        onLongPress={() => toggleSelect(file.id)}
        onPress={() => {
          if (file.mediaType === 'photo') setPreview({ uri: file.uri, type: 'image' });
          else if (file.mediaType === 'video') setPreview({ uri: file.uri, type: 'video' });
          else toggleSelect(file.id);
        }}
      >
        {thumb}
        <Text className="text-white font-poppins mt-2 text-xs w-16" numberOfLines={2}>{file.filename || file.name}</Text>
        {selectedFiles.includes(file.id) && <MaterialCommunityIcons name="check-circle" size={20} color="#4F46E5" style={{ position: 'absolute', top: 4, right: 4 }} />}
      </TouchableOpacity>
    );
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-white/70 mt-4">Checking permissions...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <Text className="text-white text-lg font-poppins mb-4">Storage Permission Needed</Text>
        <Text className="text-white/70 text-base mb-6 text-center">To show your files, SwiftDrop needs access to your device storage and media. This is only used to display and send files.</Text>
        <TouchableOpacity className="bg-purple px-6 py-3 rounded-xl" onPress={async () => {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        }}>
          <Text className="text-white font-poppins">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy">
      {/* Category Tabs & View Toggle */}
      <View className="flex-row px-2 pt-4 pb-2 bg-navy/80 items-center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              className={`flex-row items-center px-4 py-2 mx-1 rounded-full ${selectedCategory === cat.key ? 'bg-purple' : 'bg-white/10'}`}
              onPress={() => setSelectedCategory(cat.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedCategory === cat.key }}
            >
              <MaterialCommunityIcons name={cat.icon} size={18} color={selectedCategory === cat.key ? '#fff' : '#64748B'} className="mr-2" />
              <Text className={`font-poppins ml-1 ${selectedCategory === cat.key ? 'text-white' : 'text-white/70'}`}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          className="ml-2 p-2 rounded-full bg-white/10"
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          accessibilityRole="button"
          accessibilityLabel={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        >
          <MaterialCommunityIcons name={viewMode === 'grid' ? 'view-list' : 'view-grid'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* File List */}
      {loading && <ActivityIndicator size="large" color="#4F46E5" className="mt-8" />}
      {error && <Text className="text-red-400 text-center mt-8">{error}</Text>}
      {!loading && !error && mediaFiles.length === 0 && (
        <Text className="text-white/60 text-center mt-8">No files found in this category.</Text>
      )}
      {!loading && !error && (
        viewMode === 'grid' ? (
          <FlatList
            data={mediaFiles}
            key={'grid'}
            numColumns={3}
            keyExtractor={item => item.id}
            renderItem={renderFileItem}
            contentContainerStyle={{ padding: 8 }}
          />
        ) : (
          <FlatList
            data={mediaFiles}
            key={'list'}
            numColumns={1}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center p-3 mb-2 rounded-xl bg-white/10 ${selectedFiles.includes(item.id) ? 'border-2 border-purple' : ''}`}
                accessibilityRole="button"
                accessibilityLabel={`File: ${item.filename || item.name}`}
                onLongPress={() => toggleSelect(item.id)}
                onPress={() => {
                  if (item.mediaType === 'photo') setPreview({ uri: item.uri, type: 'image' });
                  else if (item.mediaType === 'video') setPreview({ uri: item.uri, type: 'video' });
                  else toggleSelect(item.id);
                }}
              >
                {renderFileItem({ item })}
                <Text className="text-white font-poppins flex-1 ml-4" numberOfLines={1}>{item.filename || item.name}</Text>
                {selectedFiles.includes(item.id) && <MaterialCommunityIcons name="check-circle" size={20} color="#4F46E5" />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 8 }}
          />
        )
      )}

      {/* Floating Send Button */}
      {selectedFiles.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-cyan px-8 py-4 rounded-full shadow-lg"
          style={{ shadowColor: '#22D3EE', shadowOpacity: 0.6, shadowRadius: 16 }}
          accessibilityRole="button"
          accessibilityLabel={`Send ${selectedFiles.length} files`}
        >
          <Text className="text-navy font-poppins text-lg">Send ({selectedFiles.length})</Text>
        </TouchableOpacity>
      )}

      {/* Preview Modal */}
      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View className="flex-1 bg-black/80 items-center justify-center">
          {preview?.type === 'image' && (
            <Image source={{ uri: preview.uri }} className="w-80 h-96 rounded-2xl" resizeMode="contain" accessibilityLabel="Image preview" />
          )}
          {preview?.type === 'video' && (
            <Video source={{ uri: preview.uri }} useNativeControls style={{ width: 320, height: 400, borderRadius: 16 }} resizeMode="contain" accessibilityLabel="Video preview" />
          )}
          <TouchableOpacity className="mt-8 px-8 py-3 bg-purple rounded-full" onPress={() => setPreview(null)} accessibilityRole="button" accessibilityLabel="Close preview">
            <Text className="text-white font-poppins">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
} 