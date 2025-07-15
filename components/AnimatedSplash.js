import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, StyleSheet } from 'react-native';

export default function AnimatedSplash({ onFinish }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(600),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/splash.png')}
        style={[
          styles.logo,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
        resizeMode="contain"
        accessibilityLabel="SwiftDrop Splash Logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
}); 