declare module 'crypto' {
  import { TransformOptions } from 'stream';

  export interface Hash extends NodeJS.ReadWriteStream {
    update(data: string | Buffer): Hash;
    digest(): Buffer;
    digest(encoding: 'hex' | 'base64'): string;
  }

  export interface Hmac extends NodeJS.ReadWriteStream {
    update(data: string | Buffer): Hmac;
    digest(): Buffer;
    digest(encoding: 'hex' | 'base64'): string;
  }

  export function createHash(algorithm: string): Hash;
  export function createHmac(algorithm: string, key: string | Buffer): Hmac;
  
  export function randomBytes(size: number): Buffer;
  export function randomBytes(size: number, callback: (err: Error | null, buf: Buffer) => void): void;
  
  export function pbkdf2(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string,
    callback: (err: Error | null, derivedKey: Buffer) => void
  ): void;
  
  export function pbkdf2Sync(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string
  ): Buffer;
  
  export function createCipher(algorithm: string, password: string | Buffer): Cipher;
  export function createDecipher(algorithm: string, password: string | Buffer): Decipher;
  
  export interface Cipher extends NodeJS.ReadWriteStream {
    update(data: string | Buffer): Buffer;
    update(data: string, input_encoding: string): Buffer;
    update(data: Buffer, input_encoding: any, output_encoding: 'hex' | 'base64'): string;
    final(): Buffer;
    final(output_encoding: 'hex' | 'base64'): string;
  }
  
  export interface Decipher extends NodeJS.ReadWriteStream {
    update(data: string | Buffer): Buffer;
    update(data: string, input_encoding: 'hex' | 'base64'): Buffer;
    update(data: Buffer, input_encoding: any, output_encoding: string): string;
    final(): Buffer;
    final(output_encoding: string): string;
  }
  
  export function createSign(algorithm: string): Signer;
  export function createVerify(algorithm: string): Verify;
  
  export interface Signer extends NodeJS.WritableStream {
    update(data: string | Buffer): void;
    sign(private_key: string | { key: string; passphrase?: string }, output_format: 'hex' | 'base64'): string;
  }
  
  export interface Verify extends NodeJS.WritableStream {
    update(data: string | Buffer): void;
    verify(public_key: string, signature: string, signature_format?: 'hex' | 'base64'): boolean;
  }
  
  export function createDiffieHellman(prime_length: number, generator?: number | Buffer): DiffieHellman;
  
  export class DiffieHellman {
    generateKeys(): Buffer;
    computeSecret(other_public_key: Buffer): Buffer;
    getPrime(): Buffer;
    getGenerator(): Buffer;
    getPublicKey(): Buffer;
    getPrivateKey(): Buffer;
  }
  
  export function getDiffieHellman(group_name: string): DiffieHellman;
  
  export function randomInt(max: number): number;
  export function randomInt(min: number, max: number): number;
  
  export function randomUUID(): string;
  
  export function getHashes(): string[];
  export function getCiphers(): string[];
  export function getCurves(): string[];
  
  export function timingSafeEqual(a: Buffer, b: Buffer): boolean;
}
