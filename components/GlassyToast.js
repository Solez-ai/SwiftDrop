import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GlassyToast({ visible, message, icon = 'information', type = 'info', onHide }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      if (onHide) {
        const timer = setTimeout(onHide, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  let color = '#22D3EE';
  if (type === 'error') color = '#EF4444';
  if (type === 'success') color = '#22C55E';
  if (type === 'warning') color = '#FACC15';

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        zIndex: 100,
        alignItems: 'center',
        transform: [{ translateY: slideAnim }],
      }}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View className="flex-row items-center px-6 py-3 bg-whiteGlass rounded-2xl shadow-glass backdrop-blur-md border border-white/15" style={{ minWidth: 220, maxWidth: 340 }}>
        <MaterialCommunityIcons name={icon} size={22} color={color} style={{ marginRight: 12 }} />
        <Text className="text-white font-poppins flex-1" style={{ color }}>{message}</Text>
      </View>
    </Animated.View>
  );
} 