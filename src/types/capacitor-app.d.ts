declare module '@capacitor/app' {
  export interface AppState {
    isActive: boolean;
  }

  export interface AppUrlOpen {
    url: string;
    iosSourceApplication?: any;
    iosOpenInPlace?: boolean;
  }

  export interface AppRestoredResult {
    pluginId: string;
    methodName: string;
    data?: any;
    success: boolean;
    error?: {
      message: string;
    };
  }

  export interface AppPlugin {
    /**
     * Force exit the app. This should only be used in conjunction with the `backButton` handler for Android to
     * exit the app when navigation is complete.
     *
     * For example, if navigation is complete and the app is still at the root, call this method to exit the app.
     */
    exitApp(): never;
    
    /**
     * Check if an app can be opened with the given URL.
     */
    canOpenUrl(options: { url: string }): Promise<{ value: boolean }>;
    
    /**
     * Open the current app with the given URL.
     */
    openUrl(options: { url: string }): Promise<{ completed: boolean }>;
    
    /**
     * Gets the current app state.
     */
    getState(): Promise<AppState>;
    
    /**
     * Get the URL the app was originally launched with. Note that if the app was not opened with a URL,
     * the result will be an empty string.
     */
    getLaunchUrl(): Promise<{ url: string } | undefined>;
    
    /**
     * Listen for when the app state changes between active/inactive.
     */
    addListener(eventName: 'appStateChange', listenerFunc: (state: AppState) => void): PluginListenerHandle;
    
    /**
     * Listen for when the app is opened with a URL.
     */
    addListener(eventName: 'appUrlOpen', listenerFunc: (data: AppUrlOpen) => void): PluginListenerHandle;
    
    /**
     * Listen for when the app is restored from a saved plugin call.
     */
    addListener(eventName: 'appRestoredResult', listenerFunc: (data: AppRestoredResult) => void): PluginListenerHandle;
    
    /**
     * Remove all native listeners for this plugin.
     */
    removeAllListeners(): void;
  }

  const App: AppPlugin;
  export { App };
  
  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }
}
