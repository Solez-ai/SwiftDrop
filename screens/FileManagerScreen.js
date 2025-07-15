import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, FlatList, Platform, NativeModules, Animated } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';

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

const { InstalledApps } = NativeModules;

export default function FileManagerScreen({ showToast }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // { uri, type }
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [apps, setApps] = useState([]); // Placeholder for installed apps
  const [installedApps, setInstalledApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const toggleAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (selectedCategory === 'apps') {
      NativeModules.InstalledAppsModule.getInstalledApps()
        .then(setInstalledApps)
        .catch(() => setInstalledApps([]));
    }
  }, [selectedCategory]);

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: viewMode === 'grid' ? 0 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [viewMode]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFiles(selectedFiles.includes(id)
      ? selectedFiles.filter(f => f !== id)
      : [...selectedFiles, id]);
    showToast('File selection updated', 'info', 'check');
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

  const fetchInstalledApps = async () => {
    setLoadingApps(true);
    try {
      const result = await InstalledApps.getInstalledApps();
      setApps(result);
    } catch (e) {
      setApps([]);
    }
    setLoadingApps(false);
  };

  useEffect(() => {
    fetchInstalledApps();
  }, []);

  const shareApk = async (apkPath) => {
    try {
      await Sharing.shareAsync(apkPath);
    } catch (e) {}
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
      <Modal visible transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View className="w-full max-w-md bg-whiteGlass rounded-2xl p-8 shadow-glass backdrop-blur-md border border-white/15 items-center">
            <MaterialCommunityIcons name="folder-lock" size={48} color="#4F46E5" className="mb-4" />
            <Text className="text-white text-lg font-poppins mb-4">Storage Permission Needed</Text>
            <Text className="text-white/70 text-base mb-6 text-center">To show your files, SwiftDrop needs access to your device storage and media. This is only used to display and send files.</Text>
            <TouchableOpacity className="bg-purple px-6 py-3 rounded-xl shadow-glow" onPress={async () => {
              const { status } = await MediaLibrary.requestPermissionsAsync();
              setHasPermission(status === 'granted');
              if (status === 'granted') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                showToast('Permission granted', 'success', 'check-circle');
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                showToast('Permission denied', 'error', 'alert-circle');
              }
            }} accessibilityRole="button" accessibilityLabel="Grant storage permission">
              <Text className="text-white font-poppins">Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View className="flex-1 bg-navy">
      {/* Subtle background gradient for depth */}
      <LinearGradient
        colors={["#1E293B", "#0F172A"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Category Tabs & View Toggle */}
      <View className="flex-row px-2 pt-4 pb-2 bg-navy/80 items-center z-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              className={`flex-row items-center px-4 py-2 mx-1 rounded-full transition-colors duration-400 ${selectedCategory === cat.key ? 'bg-purple shadow-glow' : 'bg-whiteGlass'}`}
              style={selectedCategory === cat.key ? { shadowColor: '#4F46E5', shadowOpacity: 0.5, shadowRadius: 12 } : {}}
              onPress={() => setSelectedCategory(cat.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedCategory === cat.key }}
            >
              <MaterialCommunityIcons name={cat.icon} size={18} color={selectedCategory === cat.key ? '#fff' : '#64748B'} className="mr-2" />
              <Text className={`font-poppins ml-1 ${selectedCategory === cat.key ? 'text-white' : 'text-white/70'}`}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Animated.View style={{
          marginLeft: 8,
          padding: 2,
          borderRadius: 9999,
          backgroundColor: '#ffffff18',
          shadowColor: '#22D3EE',
          shadowOpacity: toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
          shadowRadius: toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 16] }),
        }}>
          <TouchableOpacity
            className="rounded-full"
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            accessibilityRole="button"
            accessibilityLabel={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            <MaterialCommunityIcons name={viewMode === 'grid' ? 'view-list' : 'view-grid'} size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* File List */}
      {loading && <ActivityIndicator size="large" color="#4F46E5" className="mt-8" />}
      {error && <Text className="text-red-400 text-center mt-8">{error}</Text>}
      {!loading && !error && mediaFiles.length === 0 && (
        <Text className="text-white/60 text-center mt-8">No files found in this category.</Text>
      )}
      {!loading && !error && (
        selectedCategory === 'apps' ? (
          <FlatList
            data={installedApps}
            key={'apps'}
            numColumns={1}
            keyExtractor={item => item.packageName}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.packageName}
                className="flex-row items-center p-3 mb-2 rounded-xl bg-whiteGlass shadow-glass backdrop-blur-md border border-white/15"
                accessibilityRole="button"
                accessibilityLabel={`App: ${item.appName}`}
                onPress={() => {
                  // Use your existing send logic, e.g. open send screen with APK path
                  // navigation.navigate('Send', { fileUri: item.apkPath, fileName: item.appName + '.apk' });
                  alert('Ready to share APK: ' + item.appName);
                }}
              >
                <Image source={{ uri: item.icon }} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }} />
                <View>
                  <Text className="text-white font-poppins" numberOfLines={1}>{item.appName}</Text>
                  <Text className="text-white/60 text-xs" numberOfLines={1}>{item.packageName}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 8 }}
          />
        ) : (
          viewMode === 'grid' ? (
            <FlatList
              data={mediaFiles}
              key={'grid'}
              numColumns={3}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                let icon = 'file';
                let thumb = null;
                if (item.mediaType === 'photo') {
                  thumb = <Image source={{ uri: item.uri }} className="w-16 h-16 rounded-lg" accessibilityLabel={item.filename} />;
                } else if (item.mediaType === 'video') {
                  thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="video" size={32} color="#22D3EE" /></View>;
                } else if (item.mediaType === 'audio') {
                  thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="music" size={32} color="#22D3EE" /></View>;
                } else if (item.type === 'apk') {
                  thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="android" size={32} color="#22D3EE" /></View>;
                } else if (docExts.some(ext => (item.filename || '').toLowerCase().endsWith(ext))) {
                  thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="file-document" size={32} color="#22D3EE" /></View>;
                } else {
                  thumb = <View className="w-16 h-16 rounded-lg bg-black/40 items-center justify-center"><MaterialCommunityIcons name="file" size={32} color="#64748B" /></View>;
                }
                return (
                  <TouchableOpacity
                    key={item.id}
                    className={`m-1 p-2 rounded-xl bg-whiteGlass shadow-glass backdrop-blur-md ${selectedFiles.includes(item.id) ? 'border-2 border-purple shadow-glow' : ''}`}
                    accessibilityRole="button"
                    accessibilityLabel={`File: ${item.filename || item.name}`}
                    onLongPress={() => toggleSelect(item.id)}
                    onPress={() => {
                      if (item.mediaType === 'photo') setPreview({ uri: item.uri, type: 'image' });
                      else if (item.mediaType === 'video') setPreview({ uri: item.uri, type: 'video' });
                      else toggleSelect(item.id);
                    }}
                  >
                    {thumb}
                    <Text className="text-white font-poppins mt-2 text-xs w-16" numberOfLines={2}>{item.filename || item.name}</Text>
                    {selectedFiles.includes(item.id) && <MaterialCommunityIcons name="check-circle" size={20} color="#4F46E5" style={{ position: 'absolute', top: 4, right: 4 }} />}
                  </TouchableOpacity>
                );
              }}
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
                  className={`flex-row items-center p-3 mb-2 rounded-xl bg-whiteGlass shadow-glass backdrop-blur-md ${selectedFiles.includes(item.id) ? 'border-2 border-purple shadow-glow' : ''}`}
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
        )
      )}

      {/* Floating Send Button */}
      {selectedFiles.length > 0 && (
        <Animated.View style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: [{ translateX: -120 }, { scale: 1 + 0.05 * Math.sin(Date.now() / 300) }],
          zIndex: 20,
        }}>
          <TouchableOpacity
            className="bg-cyan px-8 py-4 rounded-full shadow-glowCyan"
            style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }}
            accessibilityRole="button"
            accessibilityLabel={`Send ${selectedFiles.length} files`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              showToast('Ready to send files', 'success', 'send');
            }}
          >
            <Text className="text-navy font-poppins text-lg">Send ({selectedFiles.length})</Text>
          </TouchableOpacity>
        </Animated.View>
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
          <TouchableOpacity className="mt-8 px-8 py-3 bg-purple rounded-full shadow-glow" onPress={() => setPreview(null)} accessibilityRole="button" accessibilityLabel="Close preview">
            <Text className="text-white font-poppins">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
} 