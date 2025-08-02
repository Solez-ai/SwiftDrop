import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swiftdrop.app',
  appName: 'SwiftDrop',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
