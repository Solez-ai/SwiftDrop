declare module '@capacitor/screen-orientation' {
  export type ScreenOrientationType = 
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';

  export interface ScreenOrientationInfo {
    type: ScreenOrientationType;
    angle: number;
  }

  export interface ScreenOrientationPlugin {
    /**
     * Lock the screen orientation.
     */
    lock(options: { type: ScreenOrientationType }): Promise<void>;
    
    /**
     * Unlock the screen orientation (allow rotation).
     */
    unlock(): Promise<void>;
    
    /**
     * Get the current screen orientation.
     */
    getCurrentOrientation(): Promise<ScreenOrientationInfo>;
    
    /**
     * Listen for screen orientation changes.
     */
    addListener(
      eventName: 'screenOrientationChange',
      listenerFunc: (orientation: ScreenOrientationInfo) => void
    ): PluginListenerHandle;
    
    /**
     * Remove all listeners for this plugin.
     */
    removeAllListeners(): void;
  }

  const ScreenOrientation: ScreenOrientationPlugin;
  export { ScreenOrientation };
  
  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }
}
