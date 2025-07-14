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

  return (
    <BleSocketProvider>
      <SafeAreaProvider>
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
            <MainTabNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </BleSocketProvider>
  );
} 