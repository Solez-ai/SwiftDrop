import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useBleSocket } from '../utils/BleSocketProvider';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function ReceiveScreen({ showToast }) {
  const [step, setStep] = useState('waiting');
  const [session, setSession] = useState(null);
  const [fileUri, setFileUri] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const confettiRef = useRef();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { startServer, transferProgress, receivedFile, error, incomingConnection } = useBleSocket();

  useEffect(() => {
    (async () => {
      const sessionInfo = await startServer((uri) => {
        setFileUri(uri);
        setStep('success');
        setShowConfetti(true);
        Notifications.scheduleNotificationAsync({
          content: { title: 'SwiftDrop', body: 'File received successfully!' },
          trigger: null,
        });
        setTimeout(() => setShowConfetti(false), 4000);
      });
      setSession(sessionInfo);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (transferProgress && fileSize) {
      setProgress(transferProgress.receivedBytes / fileSize);
      Animated.timing(progressAnim, {
        toValue: transferProgress.receivedBytes / fileSize,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [transferProgress, fileSize]);

  useEffect(() => {
    if (incomingConnection && step === 'waiting') {
      setStep('incoming');
    }
  }, [incomingConnection]);

  useEffect(() => {
    if (step === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('File received successfully!', 'success', 'check-circle');
    }
  }, [step]);

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast('Receiving file...', 'info', 'download');
    setStep('downloading');
  };

  const handleDeny = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showToast('Transfer denied', 'warning', 'close-circle');
    setStep('denied');
  };

  const handleOpenFile = async () => {
    if (fileUri) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('Opening file...', 'info', 'file');
      const ext = fileUri.split('.').pop().toLowerCase();
      if (Platform.OS === 'android' && ext === 'apk') {
        try {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: 'file://' + fileUri,
            flags: 1,
            type: 'application/vnd.android.package-archive',
          });
        } catch (e) {
          setShowInstallGuide(true);
        }
      } else {
        await FileSystem.getContentUriAsync(fileUri).then(uri => {
          Alert.alert('File saved', uri);
        });
      }
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

  if (!isReady) {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-white/70 mt-4">Preparing to receive...</Text>
        {error && <Text className="text-red-400 mt-4">{error}</Text>}
      </View>
    );
  }

  if (step === 'waiting') {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="bg-whiteGlass rounded-xl p-6 mb-4 shadow-glass backdrop-blur-md border border-white/15 items-center w-full max-w-md">
          <Text className="text-white text-xl font-poppins mb-2">Ready to receive</Text>
          <Text className="text-white/70 mb-2">Share this session info with sender:</Text>
          <View className="bg-blackGlass rounded-xl p-4 mb-4 w-full">
            <Text className="text-cyan font-poppins">IP: {session?.ip}</Text>
            <Text className="text-cyan font-poppins">Port: {session?.port}</Text>
          </View>
          <Text className="text-white/70 mb-2">Waiting for incoming file...</Text>
          {error && <Text className="text-red-400 mt-4">{error}</Text>}
        </View>
      </View>
    );
  }

  if (step === 'incoming') {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="bg-whiteGlass rounded-xl p-6 shadow-glass backdrop-blur-md border border-white/15 items-center w-full max-w-md">
          <Text className="text-white text-xl font-poppins mb-2">Incoming file</Text>
          <Text className="text-white/70 mb-4">A sender wants to send you a file. Accept?</Text>
          <View className="flex-row w-full mt-4 space-x-4">
            <TouchableOpacity className="flex-1 bg-cyan py-3 rounded-xl items-center shadow-glowCyan" style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }} onPress={handleAccept} accessibilityRole="button" accessibilityLabel="Accept incoming file">
              <Text className="text-navy font-poppins">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-whiteGlass py-3 rounded-xl items-center shadow-glass" style={{ shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8 }} onPress={handleDeny} accessibilityRole="button" accessibilityLabel="Deny incoming file">
              <Text className="text-white font-poppins">Deny</Text>
            </TouchableOpacity>
          </View>
          {error && <Text className="text-red-400 mt-4">{error}</Text>}
        </View>
      </View>
    );
  }

  if (step === 'downloading') {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="bg-whiteGlass rounded-xl p-6 shadow-glass backdrop-blur-md border border-white/15 items-center w-full max-w-md">
          <Text className="text-white text-xl font-poppins mb-4">Receiving file...</Text>
          <View className="w-64 h-2 bg-white/20 rounded-full mt-4 mb-4 overflow-hidden">
            <Animated.View className="h-2 bg-cyan rounded-full" style={{ width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), shadowColor: '#22D3EE', shadowOpacity: 0.5, shadowRadius: 8 }} />
          </View>
          <ActivityIndicator size="large" color="#4F46E5" className="mt-4" />
          {error && <Text className="text-red-400 mt-4">{error}</Text>}
        </View>
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="bg-whiteGlass rounded-xl p-6 shadow-glass backdrop-blur-md border border-white/15 items-center w-full max-w-md">
          <Text className="text-white text-2xl font-poppins mb-4">Transfer Complete!</Text>
          <MaterialCommunityIcons name={getFileIcon(fileUri)} size={48} color="#22D3EE" className="mb-2" />
          <MaterialCommunityIcons name="check-circle" size={64} color="#22D3EE" className="mb-4" />
          <Text className="text-white/70 mb-4">File received and saved.</Text>
          <View className="flex-row w-full mt-4 space-x-4">
            <TouchableOpacity className="flex-1 bg-cyan py-3 rounded-xl items-center shadow-glowCyan" style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }} onPress={handleOpenFile} accessibilityRole="button" accessibilityLabel="Open received file">
              <Text className="text-navy font-poppins">Open File</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-whiteGlass py-3 rounded-xl items-center shadow-glass" style={{ shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 8 }} onPress={() => setStep('waiting')} accessibilityRole="button" accessibilityLabel="Go Home">
              <Text className="text-white font-poppins">Go Home</Text>
            </TouchableOpacity>
          </View>
          {showConfetti && <ConfettiCannon count={120} origin={{x: 200, y: 0}} fadeOut autoStart ref={confettiRef} />}
          {error && <Text className="text-red-400 mt-4">{error}</Text>}
        </View>
      </View>
    );
  }

  if (step === 'denied') {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="bg-whiteGlass rounded-xl p-6 shadow-glass backdrop-blur-md border border-white/15 items-center w-full max-w-md">
          <Text className="text-white text-xl font-poppins mb-4">You declined the transfer.</Text>
          <MaterialCommunityIcons name="close-circle" size={64} color="#EF4444" className="mb-4" />
          <Text className="text-white/70 mb-4">The sender has been notified.</Text>
          <TouchableOpacity className="mt-4 px-8 py-3 bg-cyan rounded-full shadow-glowCyan" style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }} onPress={() => setStep('waiting')} accessibilityRole="button" accessibilityLabel="Back">
            <Text className="text-navy font-poppins">Back</Text>
          </TouchableOpacity>
          {error && <Text className="text-red-400 mt-4">{error}</Text>}
        </View>
      </View>
    );
  }

  if (showInstallGuide) {
    return (
      <View className="flex-1 bg-navy items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="bg-whiteGlass rounded-xl p-6 shadow-glass backdrop-blur-md border border-white/15 items-center w-full max-w-md">
          <Text className="text-white text-xl font-poppins mb-4">Install APK</Text>
          <Text className="text-white/70 mb-4 text-center">To install this app, you may need to allow installation from unknown sources in your device settings.</Text>
          <View className="w-64 h-40 bg-white/10 rounded-2xl items-center justify-center mb-4">
            <MaterialCommunityIcons name="android" size={64} color="#22D3EE" />
          </View>
          <TouchableOpacity className="mt-4 px-8 py-3 bg-cyan rounded-full shadow-glowCyan" style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }} onPress={() => Linking.openSettings()} accessibilityRole="button" accessibilityLabel="Open Settings">
            <Text className="text-navy font-poppins">Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mt-4 px-8 py-3 bg-purple rounded-full shadow-glow" onPress={() => setShowInstallGuide(false)} accessibilityRole="button" accessibilityLabel="Back">
            <Text className="text-white font-poppins">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
} 