declare module 'https' {
  import * as tls from 'tls';
  import * as http from 'http';
  import { URL } from 'url';

  export interface ServerOptions extends tls.SecureContextOptions, tls.TlsOptions {
    IncomingMessage?: typeof http.IncomingMessage;
    ServerResponse?: typeof http.ServerResponse;
    maxHeaderSize?: number;
    insecureHTTPParser?: boolean;
  }

  export interface RequestOptions extends http.RequestOptions, tls.SecureContextOptions {
    rejectUnauthorized?: boolean;
    servername?: string;
  }

  export interface AgentOptions extends http.AgentOptions, tls.ConnectionOptions {
    rejectUnauthorized?: boolean;
    maxCachedSessions?: number;
  }

  export class Agent extends http.Agent {
    constructor(options?: AgentOptions);
    options: AgentOptions;
  }

  export let globalAgent: Agent;

  export function createServer(
    options: ServerOptions,
    requestListener?: http.RequestListener
  ): Server;

  export function request(
    options: RequestOptions | string | URL,
    callback?: (res: http.IncomingMessage) => void
  ): http.ClientRequest;
  
  export function request(
    url: string | URL,
    options: RequestOptions,
    callback?: (res: http.IncomingMessage) => void
  ): http.ClientRequest;

  export function get(
    options: RequestOptions | string | URL,
    callback?: (res: http.IncomingMessage) => void
  ): http.ClientRequest;
  
  export function get(
    url: string | URL,
    options: RequestOptions,
    callback?: (res: http.IncomingMessage) => void
  ): http.ClientRequest;

  export class Server extends http.Server {
    constructor(requestListener?: http.RequestListener);
    constructor(options: ServerOptions, requestListener?: http.RequestListener);
    
    setTimeout(callback: () => void): this;
    setTimeout(msecs?: number, callback?: () => void): this;
    maxHeadersCount: number | null;
    timeout: number;
    keepAliveTimeout: number;
    close(callback?: (err?: Error) => void): this;
  }
}
