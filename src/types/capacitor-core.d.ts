declare module '@capacitor/core' {
  export interface PluginListenerHandle {
    /**
     * Remove the listener (stop listening to events)
     */
    remove: () => Promise<void>;
  }

  export interface PluginResultData {
    [key: string]: any;
  }

  export interface PluginResultError {
    message: string;
  }

  export interface PluginResult {
    data?: PluginResultData;
    error?: PluginResultError;
  }

  export interface PluginConfig {
    [key: string]: any;
  }

  export interface PluginBase {
    /**
     * The name of the plugin.
     */
    pluginName: string;
    
    /**
     * The platforms this plugin supports.
     */
    platforms: string[];
    
    /**
     * The plugin's configuration.
     */
    config?: PluginConfig;
  }

  export interface WebPlugin extends PluginBase {
    /**
     * The web implementation of the plugin.
     */
    web: any;
    
    /**
     * The web implementation of the plugin's config.
     */
    webConfig?: any;
  }

  export interface PluginRegistry {
    [pluginName: string]: {
      [prop: string]: any;
    };
  }

  export interface CapacitorGlobal {
    isNative: boolean;
    platform: string;
    isPluginAvailable: (name: string) => boolean;
    pluginName: string;
    Plugins: PluginRegistry;
    getPlatform: () => string;
    isNativePlatform: () => boolean;
    handleError: (error: Error) => void;
  }

  export const Capacitor: CapacitorGlobal;
  
  export function registerPlugin<T>(name: string, plugin?: T): T;
  
  export function registerWebPlugin(plugin: WebPlugin): void;
}
