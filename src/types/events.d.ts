declare module 'events' {
  interface EventEmitterOptions {
    captureRejections?: boolean;
  }

  interface NodeEventTarget {
    once(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  interface DOMEventTarget {
    addEventListener(event: string, listener: (...args: any[]) => void, opts?: { once: boolean }): any;
  }

  interface StaticEventEmitter {
    new (): EventEmitter;
  }

  export class EventEmitter {
    constructor(options?: EventEmitterOptions);
    
    static once(emitter: NodeEventTarget, event: string | symbol): Promise<any[]>;
    static once(emitter: DOMEventTarget, event: string): Promise<any[]>;
    
    static on(emitter: EventEmitter, event: string): AsyncIterableIterator<any>;
    
    static getEventListeners(emitter: EventEmitter | DOMEventTarget, name: string | symbol): Function[];
    
    static listenerCount(emitter: EventEmitter, event: string | symbol): number;
    
    static defaultMaxListeners: number;
    
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    
    removeAllListeners(event?: string | symbol): this;
    
    setMaxListeners(n: number): this;
    
    getMaxListeners(): number;
    
    listeners(event: string | symbol): Function[];
    
    rawListeners(event: string | symbol): Function[];
    
    emit(event: string | symbol, ...args: any[]): boolean;
    
    listenerCount(event: string | symbol): number;
    
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    
    eventNames(): Array<string | symbol>;
  }

  export interface EventEmitter {
    [EventEmitter.captureRejectionSymbol]?(error: Error, event: string, ...args: any[]): void;
  }

  export namespace EventEmitter {
    function once(emitter: NodeEventTarget, event: string | symbol): Promise<any[]>;
    function once(emitter: DOMEventTarget, event: string): Promise<any[]>;
    
    const captureRejectionSymbol: unique symbol;
    
    function captureRejections(value: boolean): void;
    function captureRejections(): boolean;
    
    function on(emitter: EventEmitter, event: string): AsyncIterableIterator<any>;
    
    function getEventListeners(emitter: EventEmitter | DOMEventTarget, name: string | symbol): Function[];
    
    function listenerCount(emitter: EventEmitter, event: string | symbol): number;
    
    let defaultMaxListeners: number;
  }

  export default EventEmitter;
}
