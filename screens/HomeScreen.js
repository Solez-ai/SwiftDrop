import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AdMobBanner } from 'expo-ads-admob';

export default function HomeScreen({ navigation, showToast }) {
  // Animated pulse for buttons
  const sendPulse = useRef(new Animated.Value(1)).current;
  const receivePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sendPulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(sendPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(receivePulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(receivePulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-navy">
      {/* Subtle radial gradient background for depth */}
      <LinearGradient
        colors={["#1E293B", "#0F172A", "#0F172A"]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center px-6 pt-16">
          {/* Send & Receive Buttons */}
          <View className="flex-row space-x-6 mb-10">
            <Animated.View style={{ flex: 1, transform: [{ scale: sendPulse }] }}>
              <TouchableOpacity
                className="items-center justify-center rounded-2xl bg-purple/80 shadow-glow py-8 mx-2"
                style={{ shadowColor: '#4F46E5', shadowOpacity: 0.7, shadowRadius: 24 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showToast('Send mode activated', 'success', 'send');
                  navigation.navigate('Send');
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Send files"
              >
                <MaterialCommunityIcons name="send-circle" size={64} color="#fff" style={{ textShadowColor: '#4F46E5', textShadowRadius: 12 }} />
                <Text className="text-white text-xl font-poppins mt-2">Send</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ flex: 1, transform: [{ scale: receivePulse }] }}>
              <TouchableOpacity
                className="items-center justify-center rounded-2xl bg-cyan/80 shadow-glowCyan py-8 mx-2"
                style={{ shadowColor: '#22D3EE', shadowOpacity: 0.7, shadowRadius: 24 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showToast('Ready to receive files', 'info', 'download');
                  navigation.navigate('Receive');
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Receive files"
              >
                <MaterialCommunityIcons name="download-circle" size={64} color="#fff" style={{ textShadowColor: '#22D3EE', textShadowRadius: 12 }} />
                <Text className="text-white text-xl font-poppins mt-2">Receive</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Storage Summary Cards */}
          <View className="w-full flex-row space-x-4 mb-8">
            <View className="flex-1 bg-whiteGlass rounded-2xl p-4 shadow-glass backdrop-blur-md border border-white/15">
              <Text className="text-white text-base font-poppins mb-1">Internal Storage</Text>
              <View className="h-2 w-full bg-white/20 rounded-full mb-1">
                <View className="h-2 bg-purple rounded-full" style={{ width: '60%' }} />
              </View>
              <Text className="text-xs text-white/70">60 GB / 128 GB</Text>
            </View>
            <View className="flex-1 bg-whiteGlass rounded-2xl p-4 shadow-glass backdrop-blur-md border border-white/15">
              <Text className="text-white text-base font-poppins mb-1">SD Card</Text>
              <View className="h-2 w-full bg-white/20 rounded-full mb-1">
                <View className="h-2 bg-cyan rounded-full" style={{ width: '32%' }} />
              </View>
              <Text className="text-xs text-white/70">16 GB / 64 GB</Text>
            </View>
          </View>

          {/* Ad Container */}
          <View className="w-full bg-whiteGlass rounded-xl p-4 mt-4 items-center justify-center border border-white/15 shadow-glass backdrop-blur-md">
            <Text className="text-white/70 text-xs mb-2">Thanks for supporting this app</Text>
            <View className="w-32 h-16 bg-white/20 rounded-lg items-center justify-center mb-2">
              {/* Banner 1 */}
              <AdMobBanner
                bannerSize="SMART_BANNER"
                adUnitID="ca-app-pub-6451544348873646/3269604047"
                servePersonalizedAds
                onDidFailToReceiveAdWithError={err => console.log('Banner 1 error', err)}
                style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: 'transparent' }}
              />
            </View>
            <View className="w-32 h-16 bg-white/20 rounded-lg items-center justify-center">
              {/* Banner 2 */}
              <AdMobBanner
                bannerSize="SMART_BANNER"
                adUnitID="ca-app-pub-6451544348873646/8190758235"
                servePersonalizedAds
                onDidFailToReceiveAdWithError={err => console.log('Banner 2 error', err)}
                style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: 'transparent' }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 