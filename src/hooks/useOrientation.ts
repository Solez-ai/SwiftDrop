import { useState, useEffect } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

type OrientationType = 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

interface OrientationState {
  type: OrientationType;
  angle: number;
}

/**
 * Hook to track and control device orientation
 * @returns {Object} Current orientation state and utility functions
 */
const useOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationState>({
    type: 'portrait',
    angle: 0
  });

  // Lock the screen orientation
  const lockOrientation = async (type: 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary' | 'any' | 'natural') => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await ScreenOrientation.lock({ orientation: type });
    } catch (error) {
      console.error('Error locking orientation:', error);
    }
  };

  // Unlock the screen orientation
  const unlockOrientation = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await ScreenOrientation.unlock();
    } catch (error) {
      console.error('Error unlocking orientation:', error);
    }
  };

  // Get the current orientation
  const getCurrentOrientation = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const { type, angle } = await ScreenOrientation.orientation();
      setOrientation({ type, angle });
    } catch (error) {
      console.error('Error getting orientation:', error);
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Get initial orientation
    getCurrentOrientation();

    // Listen for orientation changes
    const listener = ScreenOrientation.addListener('screenOrientationChange', (orientation) => {
      setOrientation({
        type: orientation.type as OrientationType,
        angle: orientation.angle
      });
    });

    return () => {
      listener.remove();
    };
  }, []);

  return {
    ...orientation,
    isPortrait: orientation.type.includes('portrait'),
    isLandscape: orientation.type.includes('landscape'),
    lockOrientation,
    unlockOrientation,
    getCurrentOrientation
  };
};

export default useOrientation;
