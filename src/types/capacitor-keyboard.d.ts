declare module '@capacitor/keyboard' {
  export interface KeyboardInfo {
    keyboardHeight: number;
  }

  export interface KeyboardStyleOptions {
    style: 'DARK' | 'LIGHT' | 'DEFAULT';
  }

  export interface KeyboardResizeOptions {
    mode: 'body' | 'ionic' | 'none';
  }

  export interface KeyboardPlugin {
    /**
     * Show the keyboard. This method is only supported on iOS.
     */
    show(): Promise<void>;
    
    /**
     * Hide the keyboard.
     */
    hide(): Promise<void>;
    
    /**
     * Set whether the accessory bar should be visible on the keyboard. This setting
     * persists globally. This method is only supported on iOS.
     */
    setAccessoryBarVisible(options: { isVisible: boolean }): Promise<void>;
    
    /**
     * Programmatically enable or disable the WebView scroll.
     */
    setScroll(options: { isDisabled: boolean }): Promise<void>;
    
    /**
     * Programmatically set the keyboard style. This method is only supported on iOS.
     */
    setStyle(options: KeyboardStyleOptions): Promise<void>;
    
    /**
     * Programmatically set the resize mode.
     */
    setResizeMode(options: KeyboardResizeOptions): Promise<void>;
    
    /**
     * Get the currently set resize mode.
     */
    getResizeMode(): Promise<{ mode: 'body' | 'ionic' | 'none' }>;
    
    /**
     * Listen for when the keyboard is about to be shown.
     */
    addListener(
      eventName: 'keyboardWillShow',
      listenerFunc: (info: KeyboardInfo) => void
    ): PluginListenerHandle;
    
    /**
     * Listen for when the keyboard is shown.
     */
    addListener(
      eventName: 'keyboardDidShow',
      listenerFunc: (info: KeyboardInfo) => void
    ): PluginListenerHandle;
    
    /**
     * Listen for when the keyboard is about to be hidden.
     */
    addListener(
      eventName: 'keyboardWillHide',
      listenerFunc: () => void
    ): PluginListenerHandle;
    
    /**
     * Listen for when the keyboard is hidden.
     */
    addListener(
      eventName: 'keyboardDidHide',
      listenerFunc: () => void
    ): PluginListenerHandle;
    
    /**
     * Remove all native listeners for this plugin.
     */
    removeAllListeners(): void;
  }

  const Keyboard: KeyboardPlugin;
  export { Keyboard };
  
  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }
}
