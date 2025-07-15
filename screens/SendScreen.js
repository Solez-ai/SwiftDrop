import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, ScrollView, ActivityIndicator, Platform, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useBleSocket } from '../utils/BleSocketProvider';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Notifications from 'expo-notifications';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AdMobRewarded, setTestDeviceIDAsync } from 'expo-ads-admob';

export default function SendScreen({ navigation, showToast }) {
  const [radarAnim] = useState(new Animated.Value(0));
  const [showQR, setShowQR] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef();
  const [qrScanMode, setQrScanMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const [rewardedClosed, setRewardedClosed] = useState(false);

  const REWARDED_AD_UNIT_ID = 'ca-app-pub-6451544348873646/8276171104';
  const ADMOB_APP_ID = 'ca-app-pub-6451544348873646~5129195215';

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

  useEffect(() => {
    if (qrScanMode) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      })();
    }
  }, [qrScanMode]);

  useEffect(() => {
    AdMobRewarded.setAdUnitID(REWARDED_AD_UNIT_ID);
    setTestDeviceIDAsync('EMULATOR');
    AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => setRewardedLoaded(true));
    AdMobRewarded.addEventListener('rewardedVideoDidClose', () => {
      setShowRewardedAd(false);
      setRewardedClosed(true);
    });
    AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', () => setRewardedLoaded(false));
    return () => {
      AdMobRewarded.removeAllListeners();
    };
  }, []);

  const radarScale = radarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const radarOpacity = radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.type === 'success') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast(`File selected: ${res.name}`, 'success', 'file');
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    showToast('Sending file...', 'info', 'send');
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
      showToast('File sent successfully!', 'success', 'check-circle');
      Notifications.scheduleNotificationAsync({
        content: { title: 'SwiftDrop', body: 'File sent successfully!' },
        trigger: null,
      });
      setTimeout(() => setShowConfetti(false), 4000);
      // Show rewarded ad after confetti
      setTimeout(() => {
        setShowRewardedAd(true);
        setRewardedLoaded(false);
        setRewardedClosed(false);
        AdMobRewarded.requestAdAsync().catch(() => {});
      }, 4000);
    } catch (e) {
      setSending(false);
      setProgress(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Send failed: ' + e.message, 'error', 'alert-circle');
      alert('Send failed: ' + e.message);
    }
  };

  const handleQrScanned = ({ data }) => {
    try {
      const session = JSON.parse(data);
      if (session.ip && session.port) {
        setSelectedDevice({ id: 'qr', name: 'QR Session', ip: session.ip, port: session.port });
        setQrScanMode(false);
      }
    } catch (e) {
      alert('Invalid QR code');
    }
  };

  if (qrScanMode) {
    return (
      <View className="flex-1 bg-navy items-center justify-center">
        <Text className="text-white text-xl font-poppins mb-4">Scan Receiver QR</Text>
        {hasCameraPermission === null ? (
          <ActivityIndicator color="#4F46E5" />
        ) : hasCameraPermission === false ? (
          <Text className="text-red-400">Camera permission denied</Text>
        ) : (
          <BarCodeScanner
            onBarCodeScanned={handleQrScanned}
            style={{ width: 300, height: 300, borderRadius: 24, overflow: 'hidden' }}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            accessibilityLabel="QR code scanner"
          />
        )}
        <TouchableOpacity className="mt-8 px-8 py-3 bg-purple rounded-full" onPress={() => setQrScanMode(false)} accessibilityRole="button" accessibilityLabel="Back to Radar">
          <Text className="text-white font-poppins">Back to Radar</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      {/* Subtle background gradient for depth */}
      <LinearGradient
        colors={["#1E293B", "#0F172A"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text className="text-white text-2xl font-poppins mb-4">Nearby Devices</Text>
      <View className="items-center justify-center mb-8">
        {/* Radar Animation */}
        {/* Layered glowing radar pulses */}
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
            shadowColor: '#4F46E5',
            shadowOpacity: 0.5,
            shadowRadius: 32,
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: '#4F46E5',
            opacity: radarOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0] }),
            zIndex: 0,
            shadowColor: '#22D3EE',
            shadowOpacity: 0.3,
            shadowRadius: 24,
          }}
        />
        <View className="w-80 h-80 rounded-full bg-whiteGlass shadow-glass backdrop-blur-md items-center justify-center" style={{ zIndex: 1 }}>
          <MaterialCommunityIcons name="wifi" size={48} color="#22D3EE" style={{ marginTop: 32 }} />
          <Text className="text-white/70 mt-2">{isScanning ? 'Searching for devices...' : 'Scan stopped'}</Text>
          {/* Device Avatars */}
          <ScrollView className="absolute w-full h-full" contentContainerStyle={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} horizontal>
            {devices.map((dev, idx) => (
              <TouchableOpacity key={dev.id} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                showToast(`Selected device: ${dev.name}`, 'info', 'cellphone');
                setSelectedDevice(dev);
              }} className="mx-4 items-center" accessibilityRole="button" accessibilityLabel={`Device: ${dev.name}`}>
                <Animated.View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: selectedDevice && selectedDevice.id === dev.id ? '#22D3EE' : '#4F46E5',
                  borderWidth: selectedDevice && selectedDevice.id === dev.id ? 4 : 0,
                  borderColor: '#22D3EE',
                  shadowColor: selectedDevice && selectedDevice.id === dev.id ? '#22D3EE' : '#4F46E5',
                  shadowOpacity: 0.7,
                  shadowRadius: selectedDevice && selectedDevice.id === dev.id ? 24 : 12,
                  marginBottom: 4,
                }} />
                <Text className="text-white font-poppins text-xs mt-2" numberOfLines={1}>{dev.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      {/* File Picker and Send */}
      <TouchableOpacity className="mt-4 px-8 py-3 bg-cyan rounded-full flex-row items-center justify-center shadow-glowCyan" style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }} onPress={pickFile} accessibilityRole="button" accessibilityLabel="Pick file to send">
        {selectedFile && <MaterialCommunityIcons name={getFileIcon(selectedFile.name)} size={22} color="#4F46E5" style={{ marginRight: 8 }} />}
        <Text className="text-navy font-poppins">{selectedFile ? selectedFile.name : 'Pick File'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`mt-4 px-8 py-3 rounded-full ${selectedDevice && selectedFile ? 'bg-purple shadow-glow' : 'bg-white/20'}`}
        style={selectedDevice && selectedFile ? { shadowColor: '#4F46E5', shadowOpacity: 0.7, shadowRadius: 16 } : {}}
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
          <Animated.View className="h-2 bg-cyan rounded-full" style={{ width: `${Math.round(progress * 100)}%`, shadowColor: '#22D3EE', shadowOpacity: 0.5, shadowRadius: 8 }} />
        </View>
      )}
      {error && <Text className="text-red-400 mt-4">{error}</Text>}
      {/* QR Toggle */}
      <TouchableOpacity className="mt-8 px-8 py-3 bg-cyan rounded-full shadow-glowCyan" style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 16 }} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        showToast('Send via QR mode', 'info', 'qrcode');
        setQrScanMode(true);
      }} accessibilityRole="button" accessibilityLabel="Send via QR">
        <Text className="text-navy font-poppins">Send via QR</Text>
      </TouchableOpacity>
      {showConfetti && <ConfettiCannon count={120} origin={{x: 200, y: 0}} fadeOut autoStart ref={confettiRef} />}
      {/* Add modal for rewarded ad */}
      <Modal
        visible={showRewardedAd}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'rgba(30,41,59,0.95)', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.5, shadowRadius: 24 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 12 }}>Thanks for using SwiftDrop!</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Poppins', marginBottom: 16, textAlign: 'center' }}>
              Please watch this short ad to support us. You can close it after it finishes.
            </Text>
            {rewardedLoaded ? null : <ActivityIndicator color="#4F46E5" style={{ marginBottom: 16 }} />}
            {/* Show the rewarded ad */}
            {showRewardedAd && rewardedLoaded && !rewardedClosed && (
              AdMobRewarded.showAdAsync()
            )}
            {rewardedClosed && (
              <TouchableOpacity onPress={() => setShowRewardedAd(false)} style={{ marginTop: 16, backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontFamily: 'Poppins-Bold' }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
} 