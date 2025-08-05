declare module '@capacitor/network' {
  export interface ConnectionStatus {
    connected: boolean;
    connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  }

  export interface NetworkPlugin {
    getStatus(): Promise<ConnectionStatus>;
    addListener(
      eventName: 'networkStatusChange',
      listener: (status: ConnectionStatus) => void
    ): Promise<PluginListenerHandle> & PluginListenerHandle;
  }

  const Network: NetworkPlugin;
  export { Network };
  
  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }
}
