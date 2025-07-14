import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useBleSocket } from '../utils/BleSocketProvider';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function QRReceiveScreen({ showToast }) {
  const { startServer } = useBleSocket();
  const [session, setSession] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const sessionInfo = await startServer();
        setSession(sessionInfo);
        setIsReady(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('QR code ready to scan', 'success', 'qrcode');
      } catch (e) {
        setError(e.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast('QR error: ' + e.message, 'error', 'alert-circle');
      }
    })();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-navy items-center justify-center px-6">
      <LinearGradient
        colors={["#1E293B", "#0F172A"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text className="text-white text-2xl font-poppins mb-4">Receive via QR</Text>
      <View className="w-64 h-64 bg-whiteGlass rounded-2xl items-center justify-center mb-6 shadow-glass backdrop-blur-md border border-white/15 overflow-hidden">
        {isReady && session ? (
          <>
            <QRCode
              value={JSON.stringify({ ip: session.ip, port: session.port })}
              size={220}
              color="#22D3EE"
              backgroundColor="transparent"
            />
            {/* Animated scan line */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                top: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [32, 192] }),
                height: 4,
                borderRadius: 2,
                backgroundColor: '#22D3EE',
                opacity: 0.7,
                shadowColor: '#22D3EE',
                shadowOpacity: 0.7,
                shadowRadius: 8,
              }}
            />
          </>
        ) : error ? (
          <Text className="text-red-400">{error}</Text>
        ) : (
          <ActivityIndicator size="large" color="#4F46E5" />
        )}
      </View>
      <Text className="text-white/70 text-center mb-8">Ask sender to scan this code</Text>
    </View>
  );
} 