declare module '@capacitor/toast' {
  export interface ShowOptions {
    text: string;
    duration?: 'short' | 'long';
    position?: 'top' | 'center' | 'bottom';
  }

  export interface ToastPlugin {
    show(options: ShowOptions): Promise<void>;
  }

  const Toast: ToastPlugin;
  export { Toast };
}
