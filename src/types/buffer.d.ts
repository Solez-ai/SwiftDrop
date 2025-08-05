declare module 'buffer' {
  export const INSPECT_MAX_BYTES: number;
  export const kMaxLength: number;
  export const kStringMaxLength: number;
  export const constants: {
    MAX_LENGTH: number;
    MAX_STRING_LENGTH: number;
  };

  export type TranscodeEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";

  export function transcode(source: Uint8Array, fromEnc: TranscodeEncoding, toEnc: TranscodeEncoding): Buffer;

  export const SlowBuffer: {
    /** @deprecated since v6.0.0, use `Buffer.allocUnsafeSlow()` */
    new(size: number): Buffer;
    new(size: number, fill: string | Buffer | number): Buffer;
    new(str: string, encoding?: string): Buffer;
    prototype: Buffer;
  };

  export { Buffer };

  /**
   * @experimental
   */
  export interface BlobOptions {
    /**
     * @default 'utf8'
     */
    encoding?: BufferEncoding | undefined;
    /**
     * The Blob content-type, the default is ''.
     */
    type?: string | undefined;
  }

  /**
   * A `Blob` encapsulates immutable, raw data that can be safely shared across
   * multiple worker threads.
   * @since v15.7.0, v14.18.0
   * @experimental
   */
  export class Blob {
    /**
     * The total size of the `Blob` in bytes.
     * @since v15.7.0, v14.18.0
     */
    readonly size: number;
    /**
     * The content-type of the `Blob`.
     * @since v15.7.0, v14.18.0
     */
    readonly type: string;
    /**
     * Creates a new `Blob` object containing a copy of the source object.
     * @since v15.7.0, v14.18.0
     */
    constructor(sources: ReadonlyArray<ArrayBuffer | string | NodeJS.ArrayBufferView>, options?: BlobOptions);
    /**
     * Returns a promise that resolves with a buffer containing a copy of the `Blob` data.
     * @since v15.7.0, v14.18.0
     */
    arrayBuffer(): Promise<ArrayBuffer>;
    /**
     * Creates and returns a new `Blob` containing a subset of this `Blob` objects data.
     * @since v15.7.0, v14.18.0
     * @param start The starting index.
     * @param end The ending index.
     * @param type The content-type for the new `Blob`
     */
    slice(start?: number, end?: number, type?: string): Blob;
    /**
     * Returns a promise that resolves with the contents of the `Blob` decoded as a UTF-8 string.
     * @since v15.7.0, v14.18.0
     */
    text(): Promise<string>;
    /**
     * Returns a new `ReadableStream` that allows the content of the `Blob` to be read.
     * @since v16.7.0
     */
    stream(): unknown; // TODO: Add ReadableStream type when available
  }

  export interface Buffer extends Uint8Array {
    /**
     * Writes string to the buffer at offset using the given encoding.
     * @param string String to write to the buffer.
     * @param offset Offset to start writing at. Default: 0.
     * @param length Maximum number of bytes to write. Default: buffer.length - offset.
     * @param encoding The character encoding of string. Default: 'utf8'.
     * @return Number of bytes written.
     */
    write(string: string, offset?: number, length?: number, encoding?: BufferEncoding): number;
    write(string: string, encoding?: BufferEncoding): number;
    /**
     * Returns a new Buffer that references the same memory as the original, but offset and cropped by the start and end indices.
     * @param start Starting index. Default: 0.
     * @param end Ending index. Default: buf.length.
     */
    slice(start?: number, end?: number): Buffer;
    /**
     * Returns a JSON representation of the Buffer instance.
     */
    toJSON(): { type: 'Buffer'; data: number[] };
    /**
     * Returns true if both buffers contain exactly the same bytes, false otherwise.
     * @param otherBuffer A Buffer to compare to.
     */
    equals(otherBuffer: Uint8Array): boolean;
    /**
     * Returns a number indicating whether this comes before, after, or is the same as the otherBuffer in sort order.
     * @param otherBuffer A Buffer to compare to.
     */
    compare(otherBuffer: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
    /**
     * Copies data from a region of this buffer to a region in the target buffer.
     * @param target A Buffer to copy into.
     * @param targetStart The offset within the target buffer to start writing at. Default: 0.
     * @param sourceStart The offset within this buffer to start copying from. Default: 0.
     * @param sourceEnd The offset within this buffer to stop copying from (not inclusive). Default: buf.length.
     * @return The number of bytes copied.
     */
    copy(target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
    /**
     * Returns a new Buffer that is the result of concatenating all the Buffer instances in the list together.
     * @param list List of Buffer or Uint8Array instances to concatenate.
     * @param totalLength Total length of the buffers when concatenated.
     */
    static concat(list: ReadonlyArray<Uint8Array>, totalLength?: number): Buffer;
    /**
     * Returns true if the encoding is a valid encoding argument, false otherwise.
     * @param encoding The encoding to test.
     */
    static isEncoding(encoding: string): encoding is BufferEncoding;
    /**
     * Returns true if the given object is a Buffer, false otherwise.
     * @param obj The object to test.
     */
    static isBuffer(obj: any): obj is Buffer;
    /**
     * Returns the number of bytes used to represent the given string.
     * @param string The string to test.
     * @param encoding The encoding of the string. Default: 'utf8'.
     */
    static byteLength(string: string | NodeJS.ArrayBufferView | ArrayBuffer | SharedArrayBuffer, encoding?: BufferEncoding): number;
    /**
     * Returns a buffer which is the result of concatenating all the buffers in the list together.
     * @param list List of Buffer or Uint8Array instances to concatenate.
     * @param totalLength Total length of the buffers when concatenated.
     */
    static from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): Buffer;
    static from(data: number[]): Buffer;
    static from(data: Uint8Array): Buffer;
    static from(str: string, encoding?: BufferEncoding): Buffer;
    /**
     * Creates a new Buffer using the passed {data}
     * @param data data to create a new Buffer
     */
    static of(...items: number[]): Buffer;
    /**
     * Allocates a new Buffer of size bytes. If fill is undefined, the Buffer will be zero-filled.
     * @param size The desired length of the new Buffer.
     * @param fill A value to pre-fill the new Buffer with. Default: 0.
     * @param encoding If fill is a string, this is its encoding. Default: 'utf8'.
     */
    static alloc(size: number, fill?: string | Buffer | number, encoding?: BufferEncoding): Buffer;
    /**
     * Allocates a new Buffer of size bytes. The contents are not initialized.
     * @param size The desired length of the new Buffer.
     */
    static allocUnsafe(size: number): Buffer;
    /**
     * Allocates a new non-zero-filled and non-pooled Buffer of size bytes. The contents are not initialized.
     * @param size The desired length of the new Buffer.
     */
    static allocUnsafeSlow(size: number): Buffer;
  }

  export const Buffer: {
    /**
     * Allocates a new Buffer of size bytes. If fill is undefined, the Buffer will be zero-filled.
     * @param size The desired length of the new Buffer.
     * @param fill A value to pre-fill the new Buffer with. Default: 0.
     * @param encoding If fill is a string, this is its encoding. Default: 'utf8'.
     */
    alloc(size: number, fill?: string | Buffer | number, encoding?: BufferEncoding): Buffer;
    /**
     * Allocates a new Buffer of size bytes. The contents are not initialized.
     * @param size The desired length of the new Buffer.
     */
    allocUnsafe(size: number): Buffer;
    /**
     * Allocates a new non-zero-filled and non-pooled Buffer of size bytes. The contents are not initialized.
     * @param size The desired length of the new Buffer.
     */
    allocUnsafeSlow(size: number): Buffer;
    /**
     * Returns the number of bytes used to represent the given string.
     * @param string The string to test.
     * @param encoding The encoding of the string. Default: 'utf8'.
     */
    byteLength(string: string | NodeJS.ArrayBufferView | ArrayBuffer | SharedArrayBuffer, encoding?: BufferEncoding): number;
    /**
     * Returns a buffer which is the result of concatenating all the buffers in the list together.
     * @param list List of Buffer or Uint8Array instances to concatenate.
     * @param totalLength Total length of the buffers when concatenated.
     */
    concat(list: ReadonlyArray<Uint8Array>, totalLength?: number): Buffer;
    /**
     * Returns a new Buffer that references the same memory as the original, but offset and cropped by the start and end indices.
     * @param arrayBuffer The ArrayBuffer to create a view for.
     * @param byteOffset The first byte to reference. Default: 0.
     * @param length The number of bytes to reference. Default: arrayBuffer.byteLength - byteOffset.
     */
    from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): Buffer;
    /**
     * Creates a new Buffer containing the given JavaScript string {str}.
     * @param str String to store in buffer.
     * @param encoding The encoding to use, optional. Default is 'utf8'.
     */
    from(str: string, encoding?: BufferEncoding): Buffer;
    /**
     * Creates a new Buffer using the passed {data}
     * @param data data to create a new Buffer
     */
    from(data: number[]): Buffer;
    from(data: Uint8Array): Buffer;
    /**
     * Returns true if the encoding is a valid encoding argument, false otherwise.
     * @param encoding The encoding to test.
     */
    isEncoding(encoding: string): encoding is BufferEncoding;
    /**
     * Returns true if the given object is a Buffer, false otherwise.
     * @param obj The object to test.
     */
    isBuffer(obj: any): obj is Buffer;
    /**
     * Creates a new Buffer using the passed {data}
     * @param data data to create a new Buffer
     */
    of(...items: number[]): Buffer;
    /**
     * The maximum length of a string (in UTF-16 code units) that can be created.
     */
    readonly poolSize: number;
    /**
     * This is the size (in bytes) of pre-allocated internal Buffer instances used for pooling.
     */
    readonly INSPECT_MAX_BYTES: number;
    /**
     * The largest size allowed for a single Buffer instance.
     */
    readonly kMaxLength: number;
    /**
     * The largest length that can be used for Buffer#readUIntLE() and similar.
     */
    readonly kStringMaxLength: number;
    /**
     * The maximum length of a buffer.
     */
    readonly MAX_LENGTH: number;
    /**
     * The maximum length of a string (in UTF-16 code units) that can be created.
     */
    readonly MAX_STRING_LENGTH: number;
  };

  export default Buffer;
}
