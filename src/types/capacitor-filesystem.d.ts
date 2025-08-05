declare module '@capacitor/filesystem' {
  export interface FileReadOptions {
    path: string;
    directory?: string;
    encoding?: 'utf8' | 'base64' | 'binary';
  }

  export interface FileWriteOptions {
    path: string;
    data: string;
    directory?: string;
    encoding?: 'utf8' | 'base64' | 'binary';
    recursive?: boolean;
  }

  export interface FileAppendOptions extends FileWriteOptions {}
  
  export interface FileDeleteOptions {
    path: string;
    directory?: string;
    recursive?: boolean;
  }

  export interface MkdirOptions {
    path: string;
    directory?: string;
    recursive?: boolean;
  }

  export interface RmdirOptions extends MkdirOptions {}
  
  export interface ReaddirOptions {
    path: string;
    directory?: string;
  }

  export interface StatOptions {
    path: string;
    directory?: string;
  }

  export interface FileInfo {
    name: string;
    type: 'file' | 'directory';
    size: number;
    mtime?: number;
    ctime?: number;
    uri: string;
  }

  export interface FilesystemPlugin {
    readFile(options: FileReadOptions): Promise<{ data: string }>;
    writeFile(options: FileWriteOptions): Promise<void>;
    appendFile(options: FileAppendOptions): Promise<void>;
    deleteFile(options: FileDeleteOptions): Promise<void>;
    mkdir(options: MkdirOptions): Promise<void>;
    rmdir(options: RmdirOptions): Promise<void>;
    readdir(options: ReaddirOptions): Promise<{ files: FileInfo[] }>;
    stat(options: StatOptions): Promise<{ type: 'file' | 'directory', size: number, mtime: number, ctime: number }>;
    getUri(options: { path: string, directory?: string }): Promise<{ uri: string }>;
  }

  const Filesystem: FilesystemPlugin;
  export { Filesystem };
  
  export enum Directory {
    Documents = 'DOCUMENTS',
    Data = 'DATA',
    Cache = 'CACHE',
    External = 'EXTERNAL',
    ExternalStorage = 'EXTERNAL_STORAGE'
  }
}
