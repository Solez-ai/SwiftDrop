import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swiftdrop.app',
  appName: 'SwiftDrop',
  webDir: 'out',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Filesystem: {
      directory: 'DOCUMENTS'
    }
  }
};

export default config;
