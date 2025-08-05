declare module 'process' {
  export = process;
}

declare namespace NodeJS {
  export interface ProcessEnv {
    [key: string]: string | undefined;
  }

  export interface Process {
    env: ProcessEnv;
    argv: string[];
    platform: string;
    version: string;
    versions: {
      http_parser: string;
      node: string;
      v8: string;
      ares: string;
      uv: string;
      zlib: string;
      modules: string;
      openssl: string;
    };
    arch: string;
    config: {
      target_defaults: {
        cflags: any[];
        default_configuration: string;
        defines: string[];
        include_dirs: string[];
        libraries: string[];
      };
      variables: {
        clang: number;
        host_arch: string;
        node_install_npm: boolean;
        node_install_waf: boolean;
        node_prefix: string;
        node_shared_openssl: boolean;
        node_shared_v8: boolean;
        node_shared_zlib: boolean;
        node_use_dtrace: boolean;
        node_use_etw: boolean;
        node_use_openssl: boolean;
        target_arch: string;
        v8_no_strict_aliasing: number;
        v8_use_snapshot: boolean;
        visibility: string;
      };
    };
    pid: number;
    title: string;
    browser: boolean;
    stdin: NodeJS.ReadableStream;
    stdout: NodeJS.WritableStream;
    stderr: NodeJS.WritableStream;
    execPath: string;
    abort(): void;
    chdir(directory: string): void;
    cwd(): string;
    exit(code?: number): never;
    getgid?(): number;
    setgid?(id: number | string): void;
    getuid?(): number;
    setuid?(id: number | string): void;
    geteuid?(): number;
    seteuid?(id: number | string): void;
    getegid?(): number;
    setegid?(id: number | string): void;
    getgroups?(): number[];
    setgroups?(groups: Array<string | number>): void;
    initgroups?(user: string | number, extra_group: string | number): void;
    kill(pid: number, signal?: string | number): void;
    memoryUsage(): {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nextTick(callback: (...args: any[]) => void, ...args: any[]): void;
    umask(mask?: number): number;
    uptime(): number;
    hrtime(time?: [number, number]): [number, number];
    send?(message: any, sendHandle?: any): void;
    disconnect(): void;
    connected: boolean;
    // Worker
    channel?: {
      ref(): void;
      unref(): void;
    };
  }
}

declare var process: NodeJS.Process;
