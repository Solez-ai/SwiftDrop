import React, { useEffect, useCallback, useState } from 'react';
import { Button, Alert } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';

const rewarded = RewardedAd.createForAdRequest(
  'ca-app-pub-6451544348873646/8276171104',
  { requestNonPersonalizedAdsOnly: true }
);

export default function RewardedAdButton({ onReward }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setLoaded(true);
      }
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        if (onReward) onReward(reward);
        Alert.alert('Thank you!', 'You earned a reward!');
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setLoaded(false);
        rewarded.load();
      }
    );

    // Load the first ad
    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [onReward]);

  const showAd = useCallback(() => {
    if (loaded) {
      rewarded.show();
    } else {
      Alert.alert('Ad not ready', 'Please try again in a moment.');
    }
  }, [loaded]);

  return (
    <Button title="Watch Ad" onPress={showAd} />
  );
} 