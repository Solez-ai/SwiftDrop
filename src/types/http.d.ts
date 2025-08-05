declare module 'http' {
  import * as net from 'net';
  import * as stream from 'stream';
  import { EventEmitter } from 'events';
  import { Socket } from 'net';

  export interface IncomingMessage extends stream.Readable {
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    complete: boolean;
    connection: Socket;
    headers: { [key: string]: string | string[] | undefined };
    rawHeaders: string[];
    trailers: { [key: string]: string | undefined };
    rawTrailers: string[];
    setTimeout(msecs: number, callback?: () => void): this;
    method?: string;
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    socket: Socket;
    destroy(error?: Error): void;
  }

  export interface ServerResponse extends stream.Writable {
    statusCode: number;
    statusMessage: string;
    sendDate: boolean;
    finished: boolean;
    headersSent: boolean;
    getHeader(name: string): number | string | string[] | undefined;
    getHeaderNames(): string[];
    getHeaders(): { [key: string]: number | string | string[] | undefined };
    hasHeader(name: string): boolean;
    removeHeader(name: string): void;
    setHeader(name: string, value: number | string | string[]): this;
    writeHead(
      statusCode: number,
      statusMessage?: string,
      headers?: { [key: string]: number | string | string[] | undefined }
    ): this;
    write(chunk: any, encoding?: string, callback?: (err: Error) => void): boolean;
    end(cb?: () => void): void;
    end(chunk: any, cb?: () => void): void;
    end(chunk: any, encoding: string, cb?: () => void): void;
  }

  export interface Server extends EventEmitter {
    setTimeout(callback: () => void): this;
    setTimeout(msecs?: number, callback?: () => void): this;
    maxHeadersCount: number;
    timeout: number;
    close(callback?: (err?: Error) => void): this;
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    address(): string | { port: number; family: string; address: string; };
  }

  export interface RequestOptions {
    protocol?: string;
    host?: string;
    hostname?: string;
    family?: number;
    port?: number | string;
    localAddress?: string;
    socketPath?: string;
    method?: string;
    path?: string;
    headers?: { [key: string]: any };
    auth?: string;
    agent?: Agent | boolean;
    timeout?: number;
  }

  export class Agent {
    maxFreeSockets: number;
    maxSockets: number;
    readonly sockets: { [key: string]: net.Socket[] };
    readonly requests: { [key: string]: IncomingMessage[] };
  }

  export let globalAgent: Agent;
  
  export function createServer(requestListener?: (req: IncomingMessage, res: ServerResponse) => void): Server;
  
  export function request(options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void): ClientRequest;
  
  export function get(options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void): ClientRequest;
  
  export class ClientRequest extends stream.Writable {
    constructor(url: string | URL | RequestOptions, cb?: (res: IncomingMessage) => void);
    
    method: string;
    path: string;
    protocol: string;
    readonly aborted: boolean;
    readonly host: string;
    readonly finished: boolean;
    readonly headersSent: boolean;
    readonly maxHeadersCount: number;
    
    abort(): void;
    setHeader(name: string, value: string | string[]): this;
    getHeader(name: string): string | string[] | undefined;
    removeHeader(name: string): void;
    write(chunk: any, encoding?: string, callback?: (err: Error) => void): boolean;
    end(cb?: () => void): void;
    end(chunk: any, cb?: () => void): void;
    end(chunk: any, encoding: string, cb?: () => void): void;
  }
  
  export const METHODS: string[];
  
  export const STATUS_CODES: {
    [errorCode: number]: string | undefined;
    [errorCode: string]: string | undefined;
  };
}
