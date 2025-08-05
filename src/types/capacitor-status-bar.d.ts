declare module '@capacitor/status-bar' {
  export interface StatusBarInfo {
    visible: boolean;
    style?: StatusBarStyle;
    color?: string;
    overlay?: boolean;
  }

  export type StatusBarStyle = 'DARK' | 'LIGHT' | 'DEFAULT';

  export interface StatusBarPlugin {
    setStyle(options: { style: StatusBarStyle }): Promise<void>;
    setBackgroundColor(options: { color: string }): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    getInfo(): Promise<StatusBarInfo>;
    setOverlaysWebView(options: { overlay: boolean }): Promise<void>;
  }

  const StatusBar: StatusBarPlugin;
  export { StatusBar };
}
