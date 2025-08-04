import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

type ToastPosition = 'top' | 'center' | 'bottom';

declare global {
  interface Window {
    CapacitorToast?: {
      show: (options: { text: string; duration?: string; position?: string }) => void;
    };
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} [position='bottom'] - Position of the toast ('top' | 'center' | 'bottom')
 * @param {number} [duration=2000] - Duration in milliseconds
 */
export const showToast = async (
  message: string, 
  position: ToastPosition = 'bottom',
  duration: number = 2000
): Promise<void> => {
  if (!message) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: duration.toString(),
        position: position
      });
    } else if (window.CapacitorToast) {
      // For web with Capacitor
      window.CapacitorToast.show({
        text: message,
        duration: duration.toString(),
        position: position
      });
    } else {
      // Fallback for web without Capacitor
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.position = 'fixed';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.padding = '12px 24px';
      toast.style.background = 'rgba(0, 0, 0, 0.7)';
      toast.style.color = 'white';
      toast.style.borderRadius = '4px';
      toast.style.zIndex = '10000';
      
      switch (position) {
        case 'top':
          toast.style.top = '20px';
          break;
        case 'center':
          toast.style.top = '50%';
          toast.style.transform = 'translate(-50%, -50%)';
          break;
        default: // bottom
          toast.style.bottom = '20px';
      }
      
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, duration);
    }
  } catch (error) {
    console.error('Error showing toast:', error);
    // Fallback to console if all else fails
    console.log(`[Toast ${position}]: ${message}`);
  }
};

/**
 * Provide haptic feedback
 * @param {ImpactStyle} [style=ImpactStyle.Medium] - The style of haptic feedback
 */
export const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptics not available:', error);
    }
  }
};

/**
 * Show a success notification with haptic feedback
 * @param {string} message - The success message to display
 */
export const showSuccess = async (message: string): Promise<void> => {
  await showToast(message, 'bottom');
  await hapticFeedback(ImpactStyle.Light);
};

/**
 * Show an error notification with haptic feedback
 * @param {string} message - The error message to display
 */
export const showError = async (message: string): Promise<void> => {
  await showToast(`Error: ${message}`, 'bottom');
  await hapticFeedback(ImpactStyle.Heavy);
};

/**
 * Show a warning notification with haptic feedback
 * @param {string} message - The warning message to display
 */
export const showWarning = async (message: string): Promise<void> => {
  await showToast(`Warning: ${message}`, 'bottom');
  await hapticFeedback(ImpactStyle.Medium);
};

/**
 * Show an informational notification
 * @param {string} message - The info message to display
 */
export const showInfo = async (message: string): Promise<void> => {
  await showToast(`Info: ${message}`, 'bottom');
};
