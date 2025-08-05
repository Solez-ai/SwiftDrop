declare module '@capacitor/haptics' {
  export interface HapticsPlugin {
    /**
     * Trigger a haptics "impact" feedback
     */
    impact(options: { style: 'heavy' | 'medium' | 'light' }): Promise<void>;
    
    /**
     * Trigger a haptics "notification" feedback
     */
    notification(options: { type: 'success' | 'warning' | 'error' }): Promise<void>;
    
    /**
     * Vibrate the device
     */
    vibrate(options?: { duration: number }): Promise<void>;
    
    /**
     * Trigger a selection started haptic hint
     */
    selectionStart(): Promise<void>;
    
    /**
     * Trigger a selection changed haptic hint. If a selection was
     * started already, this will cause the device to provide haptic feedback
     */
    selectionChanged(): Promise<void>;
    
    /**
     * If selectionStart() was called, selectionEnd() "ends" the selection. For example,
     * call this when a user has lifted their finger from a control
     */
    selectionEnd(): Promise<void>;
  }

  const Haptics: HapticsPlugin;
  export { Haptics };
}
