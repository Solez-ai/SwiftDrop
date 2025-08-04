import { Capacitor } from '@capacitor/core';
import { APP_CONFIG } from '../config';
import { storageService } from './storage.service';

type EventName = 
  | 'app_launch'
  | 'app_foreground'
  | 'app_background'
  | 'device_connected'
  | 'device_disconnected'
  | 'file_sent'
  | 'file_received'
  | 'transfer_started'
  | 'transfer_completed'
  | 'transfer_failed'
  | 'error_occurred'
  | 'settings_updated';

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private enabled: boolean = false;
  private sessionId: string | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private lastEventTime: number = 0;
  private queue: Array<{ event: string; properties: EventProperties }> = [];
  private flushInterval: any = null;
  private readonly FLUSH_INTERVAL = 10 * 1000; // 10 seconds
  private readonly MAX_QUEUE_SIZE = 50;

  private constructor() {
    this.init();
  }

  /**
   * Get the singleton instance of AnalyticsService
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize the analytics service
   */
  private async init(): Promise<void> {
    try {
      // Check if analytics is enabled in config
      this.enabled = APP_CONFIG.FEATURES.ENABLE_ANALYTICS;
      
      if (!this.enabled) {
        console.log('Analytics is disabled');
        return;
      }

      // Initialize session
      await this.startNewSession();
      
      // Set up periodic flush
      this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
      
      // Track app launch
      this.track('app_launch');
      
      // Set up visibility change listener for session management
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
      }
      
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Error initializing analytics:', error);
      this.enabled = false;
    }
  }

  /**
   * Start a new analytics session
   */
  private async startNewSession(): Promise<void> {
    this.sessionId = this.generateSessionId();
    this.lastEventTime = Date.now();
    
    // Store session start time
    await storageService.set('analytics_session_start', Date.now());
    
    console.log('New analytics session started:', this.sessionId);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle visibility changes to manage sessions
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // App came to foreground
      const now = Date.now();
      const timeSinceLastEvent = now - this.lastEventTime;
      
      // If it's been more than the session timeout, start a new session
      if (timeSinceLastEvent > this.SESSION_TIMEOUT) {
        this.startNewSession();
      }
      
      this.track('app_foreground');
    } else {
      // App went to background
      this.track('app_background');
      // Flush any pending events
      this.flush();
    }
  };

  /**
   * Track an event
   */
  public track(event: EventName, properties: EventProperties = {}): void {
    if (!this.enabled) return;
    
    try {
      // Update last event time
      this.lastEventTime = Date.now();
      
      // Add common properties
      const eventData = {
        event,
        properties: {
          ...properties,
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
          platform: Capacitor.getPlatform(),
          app_version: APP_CONFIG.APP_VERSION,
        },
      };
      
      // Add to queue
      this.queue.push(eventData);
      
      // Flush if queue is getting large
      if (this.queue.length >= this.MAX_QUEUE_SIZE) {
        this.flush();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track an error
   */
  public trackError(error: Error, context: Record<string, any> = {}): void {
    this.track('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Flush queued events to the server
   */
  public async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const eventsToSend = [...this.queue];
    this.queue = [];
    
    try {
      // In a real app, you would send these events to your analytics backend
      // For example:
      // await apiService.post('/analytics/events', { events: eventsToSend });
      
      console.log(`Flushed ${eventsToSend.length} analytics events`);
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      
      // If there was an error, put the events back in the queue (except if it's a client error)
      const isClientError = error instanceof Error && 
                         'message' in error && 
                         typeof error.message === 'string' && 
                         error.message.includes('4');
      
      if (!isClientError) {
        this.queue.unshift(...eventsToSend);
      }
    }
  }

  /**
   * Set a user property
   */
  public async setUserProperty(key: string, value: string | number | boolean): Promise<void> {
    if (!this.enabled) return;
    
    try {
      // In a real app, you would send this to your analytics backend
      // For example:
      // await apiService.post('/analytics/user-properties', { [key]: value });
      
      console.log(`Set user property: ${key} = ${value}`);
    } catch (error) {
      console.error('Error setting user property:', error);
    }
  }

  /**
   * Identify the current user
   */
  public identify(userId: string, traits: Record<string, any> = {}): void {
    if (!this.enabled) return;
    
    try {
      // In a real app, you would send this to your analytics backend
      // For example:
      // await apiService.post('/analytics/identify', { userId, traits });
      
      console.log(`Identified user: ${userId}`, traits);
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  /**
   * Enable or disable analytics
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled && APP_CONFIG.FEATURES.ENABLE_ANALYTICS;
    
    if (this.enabled) {
      console.log('Analytics has been enabled');
      this.flush(); // Flush any queued events
    } else {
      console.log('Analytics has been disabled');
    }
    
    // Persist the setting
    storageService.set('analytics_enabled', this.enabled);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    // Flush any remaining events
    this.flush();
    
    console.log('Analytics service cleaned up');
  }
}

// Export a singleton instance
export const analyticsService = AnalyticsService.getInstance();

export default analyticsService;
