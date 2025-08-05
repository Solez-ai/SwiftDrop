declare module 'tls' {
  import * as net from 'net';
  import * as stream from 'stream';
  import * as crypto from 'crypto';
  import * as dns from 'dns';

  export interface TlsOptions {
    host?: string;
    port?: number;
    path?: string;
    socket?: net.Socket;
    pfx?: string | Buffer | Array<string | Buffer | Object>;
    key?: string | string[] | Buffer | Buffer[] | Object[];
    passphrase?: string;
    cert?: string | string[] | Buffer | Buffer[];
    ca?: string | string[] | Buffer | Buffer[];
    ciphers?: string;
    honorCipherOrder?: boolean;
    ecdhCurve?: string;
    clientCertEngine?: string;
    crl?: string | string[] | Buffer | Buffer[];
    dhparam?: string | Buffer;
    secureProtocol?: string;
    secureOptions?: number;
    sessionIdContext?: string;
    minDHSize?: number;
    highWaterMark?: number;
    encoding?: string;
  }

  export interface SecureContextOptions {
    pfx?: string | Buffer | Array<string | Buffer | Object>;
    key?: string | string[] | Buffer | Buffer[] | Object[];
    passphrase?: string;
    cert?: string | string[] | Buffer | Buffer[];
    ca?: string | string[] | Buffer | Buffer[];
    ciphers?: string;
    honorCipherOrder?: boolean;
    ecdhCurve?: string;
    clientCertEngine?: string;
    crl?: string | string[] | Buffer | Buffer[];
    dhparam?: string | Buffer;
    secureProtocol?: string;
    secureOptions?: number;
    sessionIdContext?: string;
    ticketKeys?: Buffer;
    sessionTimeout?: number;
    minVersion?: string;
    maxVersion?: string;
  }

  export interface CommonConnectionOptions {
    secureContext?: SecureContext;
    session?: Buffer;
    requestCert?: boolean;
    rejectUnauthorized?: boolean;
    NPNProtocols?: string[] | Buffer | Uint8Array;
    ALPNProtocols?: string[] | Buffer | Uint8Array;
    requestOCSP?: boolean;
  }

  export interface TlsOptions extends SecureContextOptions, CommonConnectionOptions {
    host?: string;
    port?: number;
    path?: string;
    socket?: net.Socket;
    checkServerIdentity?: typeof checkServerIdentity;
    servername?: string;
    session?: Buffer;
    minDHSize?: number;
    secureContext?: SecureContext;
    lookup?: (hostname: string, options: dns.LookupOneOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => void;
  }

  export interface ConnectionOptions extends SecureContextOptions, CommonConnectionOptions {
    host?: string;
    port?: number;
    path?: string;
    socket?: net.Socket;
    rejectUnauthorized?: boolean;
    NPNProtocols?: string[] | Buffer | Uint8Array;
    ALPNProtocols?: string[] | Buffer | Uint8Array;
    checkServerIdentity?: typeof checkServerIdentity;
    servername?: string;
    session?: Buffer;
    minDHSize?: number;
    secureContext?: SecureContext;
    lookup?: (hostname: string, options: dns.LookupOneOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => void;
  }

  export interface SecureContext {
    context: any;
  }

  export function createSecureContext(options?: SecureContextOptions): SecureContext;
  
  export function createServer(options: TlsOptions, secureConnectionListener?: (socket: TLSSocket) => void): Server;
  
  export function connect(options: ConnectionOptions, callback?: () => void): TLSSocket;
  export function connect(port: number, host?: string, options?: ConnectionOptions, secureConnectListener?: () => void): TLSSocket;
  export function connect(port: number, options?: ConnectionOptions, secureConnectListener?: () => void): TLSSocket;
  
  export function createSecurePair(credentials?: crypto.Credentials, isServer?: boolean, requestCert?: boolean, rejectUnauthorized?: boolean): any;
  
  export function getCiphers(): string[];
  
  export function checkServerIdentity(host: string, cert: any): Error | undefined;
  
  export const CLIENT_RENEG_LIMIT: number;
  export const CLIENT_RENEG_WINDOW: number;
  
  export class TLSSocket extends net.Socket {
    constructor(socket: net.Socket, options?: TlsOptions);
    
    authorized: boolean;
    authorizationError: Error;
    encrypted: boolean;
    alpnProtocol?: string;
    getPeerCertificate(detailed?: boolean): any;
    getSession(): any;
    getTLSTicket(): any;
    getCipher(): { name: string; version: string; };
    getEphemeralKeyInfo(): any;
    getProtocol(): string | null;
    renegotiate(options: { rejectUnauthorized?: boolean, requestCert?: boolean }, callback: (err: Error | null) => void): any;
    setMaxSendFragment(size: number): boolean;
    enableTrace(): void;
    disableRenegotiation(): void;
    exportKeyingMaterial(length: number, label: string, context: Buffer): Buffer;
    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: 'secureConnect', listener: () => void): this;
    addListener(event: 'session', listener: (session: any) => void): this;
    addListener(event: 'keylog', listener: (line: Buffer) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: 'secureConnect'): boolean;
    emit(event: 'session', session: any): boolean;
    emit(event: 'keylog', line: Buffer): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: 'secureConnect', listener: () => void): this;
    on(event: 'session', listener: (session: any) => void): this;
    on(event: 'keylog', listener: (line: Buffer) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    once(event: 'secureConnect', listener: () => void): this;
    once(event: 'session', listener: (session: any) => void): this;
    once(event: 'keylog', listener: (line: Buffer) => void): this;
    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: 'secureConnect', listener: () => void): this;
    prependListener(event: 'session', listener: (session: any) => void): this;
    prependListener(event: 'keylog', listener: (line: Buffer) => void): this;
    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: 'secureConnect', listener: () => void): this;
    prependOnceListener(event: 'session', listener: (session: any) => void): this;
    prependOnceListener(event: 'keylog', listener: (line: Buffer) => void): this;
  }
  
  export interface TlsOptions extends SecureContextOptions, CommonConnectionOptions {
    requestCert?: boolean;
    rejectUnauthorized?: boolean;
    NPNProtocols?: string[] | Buffer | Uint8Array;
    ALPNProtocols?: string[] | Buffer | Uint8Array;
    SNICallback?: (servername: string, cb: (err: Error | null, ctx: SecureContext) => void) => void;
    sessionTimeout?: number;
    ticketKeys?: Buffer;
    pskCallback?: (hint: string | null) => { psk: any, identity: string } | null;
    pskIdentityHint?: string;
  }
  
  export class Server extends net.Server {
    constructor(secureConnectionListener?: (socket: TLSSocket) => void);
    constructor(options: TlsOptions, secureConnectionListener?: (socket: TLSSocket) => void);
    
    addContext(hostName: string, credentials: SecureContextOptions): void;
    getTicketKeys(): Buffer;
    setTicketKeys(keys: Buffer): void;
    
    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: 'tlsClientError', listener: (err: Error, tlsSocket: TLSSocket) => void): this;
    addListener(event: 'newSession', listener: (sessionId: any, sessionData: any, callback: (err: Error, resp: Buffer) => void) => void): this;
    addListener(event: 'resumeSession', listener: (sessionId: any, callback: (err: Error, sessionData: any) => void) => void): this;
    addListener(event: 'secureConnection', listener: (tlsSocket: TLSSocket) => void): this;
    addListener(event: 'keylog', listener: (line: Buffer, tlsSocket: TLSSocket) => void): this;
    
    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: 'tlsClientError', err: Error, tlsSocket: TLSSocket): boolean;
    emit(event: 'newSession', sessionId: any, sessionData: any, callback: (err: Error, resp: Buffer) => void): boolean;
    emit(event: 'resumeSession', sessionId: any, callback: (err: Error, sessionData: any) => void): boolean;
    emit(event: 'secureConnection', tlsSocket: TLSSocket): boolean;
    emit(event: 'keylog', line: Buffer, tlsSocket: TLSSocket): boolean;
    
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: 'tlsClientError', listener: (err: Error, tlsSocket: TLSSocket) => void): this;
    on(event: 'newSession', listener: (sessionId: any, sessionData: any, callback: (err: Error, resp: Buffer) => void) => void): this;
    on(event: 'resumeSession', listener: (sessionId: any, callback: (err: Error, sessionData: any) => void) => void): this;
    on(event: 'secureConnection', listener: (tlsSocket: TLSSocket) => void): this;
    on(event: 'keylog', listener: (line: Buffer, tlsSocket: TLSSocket) => void): this;
    
    once(event: string, listener: (...args: any[]) => void): this;
    once(event: 'tlsClientError', listener: (err: Error, tlsSocket: TLSSocket) => void): this;
    once(event: 'newSession', listener: (sessionId: any, sessionData: any, callback: (err: Error, resp: Buffer) => void) => void): this;
    once(event: 'resumeSession', listener: (sessionId: any, callback: (err: Error, sessionData: any) => void) => void): this;
    once(event: 'secureConnection', listener: (tlsSocket: TLSSocket) => void): this;
    once(event: 'keylog', listener: (line: Buffer, tlsSocket: TLSSocket) => void): this;
    
    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: 'tlsClientError', listener: (err: Error, tlsSocket: TLSSocket) => void): this;
    prependListener(event: 'newSession', listener: (sessionId: any, sessionData: any, callback: (err: Error, resp: Buffer) => void) => void): this;
    prependListener(event: 'resumeSession', listener: (sessionId: any, callback: (err: Error, sessionData: any) => void) => void): this;
    prependListener(event: 'secureConnection', listener: (tlsSocket: TLSSocket) => void): this;
    prependListener(event: 'keylog', listener: (line: Buffer, tlsSocket: TLSSocket) => void): this;
    
    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: 'tlsClientError', listener: (err: Error, tlsSocket: TLSSocket) => void): this;
    prependOnceListener(event: 'newSession', listener: (sessionId: any, sessionData: any, callback: (err: Error, resp: Buffer) => void) => void): this;
    prependOnceListener(event: 'resumeSession', listener: (sessionId: any, callback: (err: Error, sessionData: any) => void) => void): this;
    prependOnceListener(event: 'secureConnection', listener: (tlsSocket: TLSSocket) => void): this;
    prependOnceListener(event: 'keylog', listener: (line: Buffer, tlsSocket: TLSSocket) => void): this;
  }
  
  export function checkServerIdentity(hostname: string, cert: any): Error | undefined;
  
  export interface CipherNameAndProtocol {
    name: string;
    version: string;
  }
  
  export interface PeerCertificate {
    subject: Certificate;
    issuer: Certificate;
    subjectaltname: string;
    infoAccess: { [key: string]: string[] | undefined };
    modulus: string;
    exponent: string;
    valid_from: string;
    valid_to: string;
    fingerprint: string;
    ext_key_usage?: string[];
    serialNumber: string;
    raw: Buffer;
  }
  
  export interface DetailedPeerCertificate extends PeerCertificate {
    issuerCertificate: DetailedPeerCertificate;
  }
  
  export interface Certificate {
    C: string;
    ST: string;
    L: string;
    O: string;
    OU: string;
    CN: string;
  }
  
  export interface PxfObject {
    buf: string | Buffer;
    passphrase?: string;
  }
  
  export interface SecurePair {
    encrypted: any;
    cleartext: any;
  }
  
  export type SecureVersion = 'TLSv1.3' | 'TLSv1.2' | 'TLSv1.1' | 'TLSv1';
  
  export interface SecureContextOptions {
    pfx?: string | Buffer | Array<string | Buffer | PxfObject>;
    key?: string | Buffer | Array<Buffer | KeyObject>;
    passphrase?: string;
    cert?: string | string[] | Buffer | Buffer[];
    ca?: string | string[] | Buffer | Buffer[];
    ciphers?: string;
    honorCipherOrder?: boolean;
    ecdhCurve?: string | string[];
    clientCertEngine?: string;
    crl?: string | string[] | Buffer | Buffer[];
    dhparam?: string | Buffer;
    secureOptions?: number;
    secureProtocol?: string;
    sessionIdContext?: string;
    ticketKeys?: Buffer;
    sessionTimeout?: number;
    minVersion?: SecureVersion;
    maxVersion?: SecureVersion;
  }
  
  export interface KeyObject {
    pem: string | Buffer;
    passphrase?: string;
  }
  
  export interface SecureContext {
    context: any;
  }
}
