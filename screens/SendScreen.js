import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useBleSocket } from '../utils/BleSocketProvider';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Notifications from 'expo-notifications';

export default function SendScreen({ navigation }) {
  const [radarAnim] = useState(new Animated.Value(0));
  const [showQR, setShowQR] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef();

  const {
    devices,
    isScanning,
    startScanning,
    stopScanning,
    sendFile,
    error,
    transferProgress,
  } = useBleSocket();

  useEffect(() => {
    Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    startScanning();
    return stopScanning;
  }, []);

  const radarScale = radarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const radarOpacity = radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.type === 'success') {
      setSelectedFile(res);
    }
  };

  const getFileIcon = (name) => {
    if (!name) return 'file';
    const ext = name.split('.').pop().toLowerCase();
    if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) return 'image';
    if (["mp4","mov","avi","mkv","webm"].includes(ext)) return 'video';
    if (["mp3","wav","aac","ogg"].includes(ext)) return 'music';
    if (["pdf","doc","docx","xls","xlsx","txt","zip"].includes(ext)) return 'file-document';
    if (["apk"].includes(ext)) return 'android';
    return 'file';
  };

  const handleSend = async () => {
    if (!selectedDevice || !selectedFile) return;
    setSending(true);
    setProgress(0);
    try {
      await sendFile({
        ip: selectedDevice.ip,
        port: selectedDevice.port,
        fileUri: selectedFile.uri,
        onProgress: (sent, total) => setProgress(sent / total),
      });
      setSending(false);
      setProgress(1);
      setShowConfetti(true);
      Notifications.scheduleNotificationAsync({
        content: { title: 'SwiftDrop', body: 'File sent successfully!' },
        trigger: null,
      });
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (e) {
      setSending(false);
      setProgress(null);
      alert('Send failed: ' + e.message);
    }
  };

  if (showQR) {
    // Placeholder for QR send mode
    return (
      <View className="flex-1 bg-navy items-center justify-center">
        <Text className="text-white text-xl font-poppins mb-4">Send via QR</Text>
        <View className="w-64 h-64 bg-white/10 rounded-2xl items-center justify-center">
          <Text className="text-white/60">[Camera UI Placeholder]</Text>
        </View>
        <TouchableOpacity className="mt-8 px-8 py-3 bg-purple rounded-full" onPress={() => setShowQR(false)}>
          <Text className="text-white font-poppins">Back to Radar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy items-center justify-center">
      <Text className="text-white text-2xl font-poppins mb-4">Nearby Devices</Text>
      <View className="items-center justify-center mb-8">
        {/* Radar Animation */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: '#4F46E5',
            opacity: radarOpacity,
            transform: [{ scale: radarScale }],
            zIndex: 0,
          }}
        />
        <View className="w-80 h-80 rounded-full bg-white/10 items-center justify-center shadow-lg" style={{ zIndex: 1 }}>
          <MaterialCommunityIcons name="wifi" size={48} color="#22D3EE" style={{ marginTop: 32 }} />
          <Text className="text-white/70 mt-2">{isScanning ? 'Searching for devices...' : 'Scan stopped'}</Text>
          {/* Device Avatars */}
          <ScrollView className="absolute w-full h-full" contentContainerStyle={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} horizontal>
            {devices.map((dev, idx) => (
              <TouchableOpacity key={dev.id} onPress={() => setSelectedDevice(dev)} className="mx-4 items-center">
                <View className={`w-16 h-16 rounded-full ${selectedDevice && selectedDevice.id === dev.id ? 'border-4 border-cyan' : ''}`} style={{ backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOpacity: 0.7, shadowRadius: 12 }} />
                <Text className="text-white font-poppins text-xs mt-2" numberOfLines={1}>{dev.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      {/* File Picker and Send */}
      <TouchableOpacity className="mt-4 px-8 py-3 bg-cyan rounded-full flex-row items-center justify-center" onPress={pickFile}>
        {selectedFile && <MaterialCommunityIcons name={getFileIcon(selectedFile.name)} size={22} color="#4F46E5" style={{ marginRight: 8 }} />}
        <Text className="text-navy font-poppins">{selectedFile ? selectedFile.name : 'Pick File'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`mt-4 px-8 py-3 rounded-full ${selectedDevice && selectedFile ? 'bg-purple' : 'bg-white/20'}`}
        onPress={handleSend}
        disabled={!selectedDevice || !selectedFile || sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-poppins">Send</Text>
        )}
      </TouchableOpacity>
      {progress !== null && (
        <View className="w-64 h-2 bg-white/20 rounded-full mt-4">
          <View className="h-2 bg-cyan rounded-full" style={{ width: `${Math.round(progress * 100)}%` }} />
        </View>
      )}
      {error && <Text className="text-red-400 mt-4">{error}</Text>}
      {/* QR Toggle */}
      <TouchableOpacity className="mt-8 px-8 py-3 bg-cyan rounded-full" onPress={() => setShowQR(true)}>
        <Text className="text-navy font-poppins">Send via QR</Text>
      </TouchableOpacity>
      {showConfetti && <ConfettiCannon count={120} origin={{x: 200, y: 0}} fadeOut autoStart ref={confettiRef} />}
    </View>
  );
} 