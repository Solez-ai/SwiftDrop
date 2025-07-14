import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useBleSocket } from '../utils/BleSocketProvider';

export default function QRReceiveScreen() {
  const { startServer } = useBleSocket();
  const [session, setSession] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const sessionInfo = await startServer();
        setSession(sessionInfo);
        setIsReady(true);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <View className="flex-1 bg-navy items-center justify-center px-6">
      <Text className="text-white text-2xl font-poppins mb-4">Receive via QR</Text>
      <View className="w-64 h-64 bg-white/10 rounded-2xl items-center justify-center mb-6">
        {isReady && session ? (
          <QRCode
            value={JSON.stringify({ ip: session.ip, port: session.port })}
            size={220}
            color="#22D3EE"
            backgroundColor="transparent"
          />
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