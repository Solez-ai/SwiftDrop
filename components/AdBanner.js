import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export function HomeBanner1() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId="ca-app-pub-6451544348873646/3269604047"
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

export function HomeBanner2() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId="ca-app-pub-6451544348873646/8190758235"
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
}); 