declare module 'util' {
  export interface InspectOptions {
    showHidden?: boolean;
    depth?: number | null;
    colors?: boolean;
    customInspect?: boolean;
    showProxy?: boolean;
    maxArrayLength?: number | null;
    maxStringLength?: number | null;
    breakLength?: number;
    compact?: boolean | number;
    sorted?: boolean | ((a: string, b: string) => number);
    getters?: 'get' | 'set' | boolean;
  }

  export type Style = 'special' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'null' | 'string' | 'symbol' | 'date' | 'regexp' | 'module';

  export type CustomInspectFunction = (depth: number, options: InspectOptions) => string;

  export function format(format: any, ...param: any[]): string;
  export function formatWithOptions(inspectOptions: InspectOptions, format: string, ...param: any[]): string;
  export function inspect(object: any, showHidden?: boolean, depth?: number | null, color?: boolean): string;
  export function inspect(object: any, options: InspectOptions): string;
  export function isDeepStrictEqual(val1: any, val2: any): boolean;
  export function isArray(object: any): object is any[];
  export function isBoolean(object: any): object is boolean;
  export function isNull(object: any): object is null;
  export function isNullOrUndefined(object: any): object is null | undefined;
  export function isNumber(object: any): object is number;
  export function isString(object: any): object is string;
  export function isSymbol(object: any): object is symbol;
  export function isUndefined(object: any): object is undefined;
  export function isRegExp(object: any): object is RegExp;
  export function isObject(object: any): object is object;
  export function isDate(object: any): object is Date;
  export function isError(object: any): object is Error;
  export function isFunction(object: any): boolean;
  export function isPrimitive(object: any): boolean;
  export function isBuffer(object: any): object is Buffer;
  
  export function deprecate<T extends Function>(fn: T, message: string, code?: string): T;
  
  export function promisify<TCustom extends Function>(fn: CustomPromisify<TCustom>): TCustom;
  export function promisify<T>(fn: (callback: (err: any, result: T) => void) => void): () => Promise<T>;
  export function promisify<T, A1>(fn: (arg1: A1, callback: (err: any, result: T) => void) => void): (arg1: A1) => Promise<T>;
  export function promisify<T, A1, A2>(fn: (arg1: A1, arg2: A2, callback: (err: any, result: T) => void) => void): (arg1: A1, arg2: A2) => Promise<T>;
  export function promisify<T, A1, A2, A3>(fn: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, result: T) => void) => void): (arg1: A1, arg2: A2, arg3: A3) => Promise<T>;
  export function promisify(fn: Function): Function;
  
  export namespace types {
    function isAnyArrayBuffer(object: any): boolean;
    function isArgumentsObject(object: any): boolean;
    function isArrayBuffer(object: any): object is ArrayBuffer;
    function isAsyncFunction(object: any): boolean;
    function isBigInt64Array(value: any): boolean;
    function isBigUint64Array(value: any): boolean;
    function isBooleanObject(object: any): boolean;
    function isBoxedPrimitive(object: any): boolean;
    function isDataView(object: any): object is DataView;
    function isDate(object: any): object is Date;
    function isExternal(value: any): boolean;
    function isFloat32Array(value: any): value is Float32Array;
    function isFloat64Array(value: any): value is Float64Array;
    function isGeneratorFunction(object: any): boolean;
    function isGeneratorObject(object: any): boolean;
    function isInt8Array(value: any): value is Int8Array;
    function isInt16Array(value: any): value is Int16Array;
    function isInt32Array(value: any): value is Int32Array;
    function isMap(value: any): boolean;
    function isMapIterator(value: any): boolean;
    function isModuleNamespaceObject(value: any): boolean;
    function isNativeError(value: any): boolean;
    function isNumberObject(value: any): boolean;
    function isPromise(value: any): boolean;
    function isProxy(value: any): boolean;
    function isRegExp(object: any): object is RegExp;
    function isSet(value: any): boolean;
    function isSetIterator(value: any): boolean;
    function isSharedArrayBuffer(object: any): boolean;
    function isStringObject(object: any): boolean;
    function isSymbolObject(object: any): boolean;
    function isTypedArray(value: any): boolean;
    function isUint8Array(value: any): value is Uint8Array;
    function isUint8ClampedArray(value: any): value is Uint8ClampedArray;
    function isUint16Array(value: any): value is Uint16Array;
    function isUint32Array(value: any): value is Uint32Array;
    function isWeakMap(value: any): boolean;
    function isWeakSet(value: any): boolean;
    function isWebAssemblyCompiledModule(value: any): boolean;
  }
  
  export class TextDecoder {
    constructor(encoding?: string, options?: { fatal?: boolean; ignoreBOM?: boolean });
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
    decode(input?: NodeJS.ArrayBufferView | ArrayBuffer | null, options?: { stream?: boolean }): string;
  }
  
  export class TextEncoder {
    constructor();
    readonly encoding: string;
    encode(input?: string): Uint8Array;
    encodeInto(source: string, destination: Uint8Array): { read: number; written: number };
  }
  
  export interface CustomPromisify<TCustom extends Function> extends Function {
    __promisify__: TCustom;
  }
  
  export const TextDecoder: {
    new(encoding?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }): TextDecoder;
  };
  
  export const TextEncoder: {
    new(): TextEncoder;
  };
  
  export function callbackify(fn: () => Promise<void>): (callback: (err: Error | null) => void) => void;
  export function callbackify<TResult>(fn: () => Promise<TResult>): (callback: (err: Error | null, result: TResult) => void) => void;
  export function callbackify<T1>(fn: (arg1: T1) => Promise<void>): (arg1: T1, callback: (err: Error | null) => void) => void;
  export function callbackify<T1, TResult>(fn: (arg1: T1) => Promise<TResult>): (arg1: T1, callback: (err: Error | null, result: TResult) => void) => void;
  export function callbackify<T1, T2>(fn: (arg1: T1, arg2: T2) => Promise<void>): (arg1: T1, arg2: T2, callback: (err: Error | null) => void) => void;
  export function callbackify<T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => Promise<TResult>): (arg1: T1, arg2: T2, callback: (err: Error | null, result: TResult) => void) => void;
  export function callbackify(fn: Function): Function;
  
  export function getSystemErrorName(err: number): string;
  export function getSystemErrorMap(): Map<number, [string, string]>;
  
  export const debuglog: {
    (section: string): (msg: string, ...param: any[]) => void;
    debuglog: (section: string) => (msg: string, ...param: any[]) => void;
  };
  
  export const debug: typeof debuglog.debuglog;
  
  export const _extend: (target: any, source: any) => any;
  
  export const inherits: (constructor: any, superConstructor: any) => void;
  
  export const promisify: typeof promisify & {
    custom: symbol;
  };
  
  export const types: typeof types;
}
