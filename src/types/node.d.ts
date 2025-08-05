declare module 'path' {
  export interface ParsedPath {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  }

  export function normalize(p: string): string;
  export function join(...paths: string[]): string;
  export function resolve(...pathSegments: string[]): string;
  export function isAbsolute(p: string): boolean;
  export function relative(from: string, to: string): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
  export const sep: '\\' | '/';
  export const delimiter: string;
  export function parse(pathString: string): ParsedPath;
  export function format(pathObject: ParsedPath): string;

  export namespace posix {
    function normalize(p: string): string;
    function join(...paths: string[]): string;
    function resolve(...pathSegments: string[]): string;
    function isAbsolute(p: string): boolean;
    function relative(from: string, to: string): string;
    function dirname(p: string): string;
    function basename(p: string, ext?: string): string;
    function extname(p: string): string;
    const sep: string;
    const delimiter: string;
    function parse(p: string): ParsedPath;
    function format(pP: ParsedPath): string;
  }

  export namespace win32 {
    function normalize(p: string): string;
    function join(...paths: string[]): string;
    function resolve(...pathSegments: string[]): string;
    function isAbsolute(p: string): boolean;
    function relative(from: string, to: string): string;
    function dirname(p: string): string;
    function basename(p: string, ext?: string): string;
    function extname(p: string): string;
    const sep: string;
    const delimiter: string;
    function parse(p: string): ParsedPath;
    function format(p: ParsedPath): string;
  }
}

declare module 'os' {
  export interface CpuInfo {
    model: string;
    speed: number;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }

  export interface NetworkInterfaceBase {
    address: string;
    netmask: string;
    mac: string;
    internal: boolean;
  }

  export function hostname(): string;
  export function cpus(): CpuInfo[];
  export function networkInterfaces(): { [index: string]: any[] };
  export const EOL: string;
}
