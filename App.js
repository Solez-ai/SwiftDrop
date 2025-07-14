import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "nativewind/tailwind.css";
import MainTabNavigator from './navigation/MainTabNavigator';
import { BleSocketProvider } from './utils/BleSocketProvider';
import GlassyToast from './components/GlassyToast';
import * as Haptics from 'expo-haptics';

// Ignore warnings for demo purposes (remove in production)
LogBox.ignoreLogs(["Require cycle:"]);

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins: require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    Inter: require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-navy">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const [toast, setToast] = useState({ visible: false, message: '', icon: 'information', type: 'info' });
  const showToast = (message, type = 'info', icon = 'information') => {
    setToast({ visible: true, message, icon, type });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const hideToast = () => setToast(t => ({ ...t, visible: false }));

  return (
    <BleSocketProvider>
      <SafeAreaProvider>
        <View className="flex-1 bg-navy">
          {/* Subtle radial gradient background for depth */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            backgroundColor: 'transparent',
          }} pointerEvents="none">
            {/* You can use expo-linear-gradient or a custom SVG for a radial effect if desired */}
          </View>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer theme={{
              dark: true,
              colors: {
                background: '#0F172A',
                card: '#1E293B',
                text: '#fff',
                border: '#334155',
                primary: '#4F46E5',
                notification: '#22D3EE',
              },
            }}>
              <MainTabNavigator showToast={showToast} />
              <StatusBar style="light" backgroundColor="#0F172A" />
              <GlassyToast {...toast} onHide={hideToast} />
            </NavigationContainer>
          </QueryClientProvider>
        </View>
      </SafeAreaProvider>
    </BleSocketProvider>
  );
} 