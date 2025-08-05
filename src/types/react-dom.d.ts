declare module 'react-dom' {
  import * as React from 'react';
  
  // Core APIs
  export function render(
    element: React.ReactElement | null,
    container: Element | Document | DocumentFragment | null,
    callback?: () => void
  ): void;
  
  export function hydrate(
    element: React.ReactElement | null,
    container: Element | Document | DocumentFragment | null,
    callback?: () => void
  ): void;
  
  export function unmountComponentAtNode(container: Element | Document | DocumentFragment | null): boolean;
  
  export function findDOMNode(instance: React.Component | Element | null | undefined): Element | Text | null;
  
  export function createPortal(
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: string | null
  ): React.ReactPortal;
  
  export const version: string;
  
  // Batched updates
  export function flushSync<R>(fn: () => R): R;
  
  export function unstable_batchedUpdates<A, R>(callback: (a: A) => R, a: A): R;
  export function unstable_batchedUpdates<R>(callback: () => R): R;
  
  // Legacy APIs
  export function unstable_renderSubtreeIntoContainer<T>(
    parentComponent: React.Component<any, any>,
    element: React.ReactElement<T>,
    container: Element,
    callback?: (component: T) => void
  ): T | null;
  
  export function unstable_createPortal(
    children: React.ReactNode,
    container: Element,
    key?: string | null
  ): React.ReactPortal;
  
  // Concurrent Mode
  export const unstable_ConcurrentMode: React.ExoticComponent<{
    children?: React.ReactNode;
    unstable_expectedLoadTime?: number;
  }>;
  
  export const unstable_StrictMode: React.ExoticComponent<{
    children?: React.ReactNode;
  }>;
  
  export const unstable_SuspenseList: React.ExoticComponent<{
    children?: React.ReactNode;
    revealOrder?: 'forwards' | 'backwards' | 'together';
    tail?: 'collapsed' | 'hidden';
  }>;
  
  export const unstable_withSuspenseConfig: <Props>(
    Component: React.ComponentType<Props>,
    config?: {
      timeoutMs: number;
      busyDelayMs?: number;
      busyMinDurationMs?: number;
    } | null
  ) => React.ComponentType<Props>;
  
  // Scheduler
  export function unstable_scheduleHydration(target: Element | Document | DocumentFragment): void;
  
  export const unstable_UserBlockingPriority: number;
  export const unstable_NormalPriority: number;
  export const unstable_ImmediatePriority: number;
  
  export function unstable_runWithPriority<T>(
    priority: number,
    callback: () => T
  ): T;
  
  export function unstable_wrapCallback(callback: () => void): () => void;
  export function unstable_cancelCallback(callback: () => void): void;
  export function unstable_shouldYield(): boolean;
  export function unstable_requestPaint(): void;
  export function unstable_continueExecution(): void;
  export function unstable_pauseExecution(): void;
  export function unstable_getFirstCallbackNode(): any;
  export function unstable_cancelScheduledWork(callbackNode: any): void;
  export function unstable_now(): number;
  export function unstable_forceFrameRate(fps: number): void;
  
  export function unstable_scheduleCallback(
    priorityLevel: 0 | 1 | 2,
    callback: () => any,
    options?: { delay?: number; timeout?: number }
  ): any;
  
  // Profiling
  export const unstable_Profiling: {
    startLoggingProfilingEvents(): void;
    stopLoggingProfilingEvents(): { [key: string]: any } | null;
  } | null;
  
  // Internal
  export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    usingClientEntryPoint: boolean;
    Events: Array<[
      string,
      {
        phasedRegistrationNames: {
          bubbled: string;
          captured: string;
        };
      }
    ]>;
  };
}
